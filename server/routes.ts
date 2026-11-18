import { Router, type NextFunction, type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import { connectToDatabase, getDatabaseStatus, getNextOrderId, isDatabaseReady } from './db.ts';
import {
  AdminUserModel,
  ContactMessageModel,
  MenuItemModel,
  OrderModel,
} from './models.ts';
import { requireAdmin, signAdminToken, type AuthenticatedRequest } from './auth.ts';
import {
  validateContactInput,
  validateMenuInput,
  validateOrderInput,
  validateOrderStatus,
} from './validation.ts';
import type { OrderItem } from './types.ts';

const FREE_DELIVERY_THRESHOLD = 399;
const STANDARD_DELIVERY_FEE = 35;

async function requireDatabase(_req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!isDatabaseReady()) {
    try {
      await connectToDatabase();
    } catch {
      // Error details are captured in getDatabaseStatus()
    }
  }
  if (!isDatabaseReady()) {
    const { error } = getDatabaseStatus();
    res.status(500).json({
      error:
        error ||
        'Database is not connected. Please set MONGODB_URL and verify MongoDB Atlas Network Access.',
    });
    return;
  }
  next();
}

function serializeDoc<T extends Record<string, unknown>>(doc: unknown): T {
  const raw =
    doc && typeof (doc as { toObject?: () => Record<string, unknown> }).toObject === 'function'
      ? (doc as { toObject: () => Record<string, unknown> }).toObject()
      : (doc as Record<string, unknown>);
  const copy = { ...raw };
  delete copy._id;
  delete copy.__v;
  return copy as T;
}

export function createApiRouter(): Router {
  const router = Router();

  // Health check
  router.get('/health', (_req, res) => {
    const status = getDatabaseStatus();
    res.json({
      status: 'ok',
      service: 'Tiffinbox Stories API',
      database: status.ready ? 'connected' : 'disconnected',
      ...(status.error ? { detail: status.error } : {}),
    });
  });

  // Require MongoDB connection for all data endpoints below
  router.use(requireDatabase);

  // GET /api/menu — Public menu listing with optional dietary, mealType, and search filters
  router.get('/menu', async (req, res, next) => {
    try {
      const { dietary, mealType, q, includeUnavailable } = req.query;
      const filter: Record<string, unknown> = {};

      if (includeUnavailable !== 'true') {
        filter.isAvailable = true;
      }

      if (dietary === 'veg' || dietary === 'non-veg') {
        filter.dietary = dietary;
      }

      if (mealType === 'Breakfast' || mealType === 'Lunch' || mealType === 'Dinner') {
        filter.mealType = mealType;
      }

      if (typeof q === 'string' && q.trim()) {
        const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');
        filter.$or = [
          { name: regex },
          { description: regex },
          { cookName: regex },
          { origin: regex },
        ];
      }

      const docs = await MenuItemModel.find(filter).sort({ createdAt: 1 }).lean();
      res.json({ items: docs.map((d) => serializeDoc(d)) });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/orders — Create a new delivery order with server-side price verification
  router.post('/orders', async (req, res, next) => {
    try {
      const validation = validateOrderInput(req.body);
      if (!validation.valid || !validation.data) {
        res.status(400).json({ error: validation.error });
        return;
      }

      const requestedIds = validation.data.items.map((i) => i.menuItemId);
      const dishes = await MenuItemModel.find({
        id: { $in: requestedIds },
        isAvailable: true,
      }).lean();

      const menuMap = new Map(dishes.map((dish) => [dish.id, dish]));
      const orderItems: OrderItem[] = [];
      let subtotal = 0;

      for (const requested of validation.data.items) {
        const dish = menuMap.get(requested.menuItemId);
        if (!dish) {
          res.status(400).json({
            error: `One of the selected dishes (${requested.menuItemId}) is currently unavailable.`,
          });
          return;
        }

        const lineTotal = dish.price * requested.quantity;
        subtotal += lineTotal;
        orderItems.push({
          menuItemId: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: requested.quantity,
          dietary: dish.dietary,
        });
      }

      const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
      const total = subtotal + deliveryFee;
      const orderId = await getNextOrderId();

      const created = await OrderModel.create({
        id: orderId,
        customerName: validation.data.customerName,
        phone: validation.data.phone,
        address: validation.data.address,
        area: validation.data.area,
        deliverySlot: validation.data.deliverySlot,
        notes: validation.data.notes,
        items: orderItems,
        subtotal,
        deliveryFee,
        total,
        status: 'Confirmed',
      });

      res.status(201).json({ order: serializeDoc(created) });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/orders/:id — Look up an order receipt / live status by order ID
  router.get('/orders/:id', async (req, res, next) => {
    try {
      const rawId = req.params.id.trim().toUpperCase();
      const order = await OrderModel.findOne({ id: rawId }).lean();

      if (!order) {
        res.status(404).json({ error: `No order found with ID "${req.params.id}".` });
        return;
      }

      res.json({ order: serializeDoc(order) });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/contact — Save customer enquiry or subscription request
  router.post('/contact', async (req, res, next) => {
    try {
      const validation = validateContactInput(req.body);
      if (!validation.valid || !validation.data) {
        res.status(400).json({ error: validation.error });
        return;
      }

      const created = await ContactMessageModel.create({
        id: `MSG-${Date.now()}`,
        name: validation.data.name,
        contact: validation.data.contact,
        area: validation.data.area,
        topic: validation.data.topic,
        message: validation.data.message,
        createdAt: new Date(),
      });

      res.status(201).json({
        message: 'Thank you for writing to Tiffinbox Stories. Our kitchen team will reply shortly.',
        enquiry: serializeDoc(created),
      });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/admin/login — Authenticate kitchen administrator and issue JWT
  router.post('/admin/login', async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email.trim() ||
        !password
      ) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const admin = await AdminUserModel.findOne({ email: normalizedEmail }).lean();

      if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const token = signAdminToken({
        sub: admin.id,
        email: admin.email,
        name: admin.name,
      });

      res.json({
        token,
        admin: { id: admin.id, email: admin.email, name: admin.name },
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/admin/orders — Protected route to view all orders and contact enquiries
  router.get('/admin/orders', requireAdmin, async (_req: AuthenticatedRequest, res, next) => {
    try {
      const [orders, contactMessages] = await Promise.all([
        OrderModel.find().sort({ createdAt: -1 }).lean(),
        ContactMessageModel.find().sort({ createdAt: -1 }).lean(),
      ]);

      res.json({
        orders: orders.map((o) => serializeDoc(o)),
        contactMessages: contactMessages.map((m) => serializeDoc(m)),
      });
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/admin/orders/:id — Protected route to update order status
  router.patch(
    '/admin/orders/:id',
    requireAdmin,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const statusResult = validateOrderStatus(req.body?.status);
        if (!statusResult.valid || !statusResult.data) {
          res.status(400).json({ error: statusResult.error });
          return;
        }

        const updated = await OrderModel.findOneAndUpdate(
          { id: req.params.id },
          { $set: { status: statusResult.data } },
          { new: true }
        ).lean();

        if (!updated) {
          res.status(404).json({ error: 'Order not found.' });
          return;
        }

        res.json({ order: serializeDoc(updated) });
      } catch (err) {
        next(err);
      }
    }
  );

  // POST /api/admin/menu — Protected route to add a new dish
  router.post('/admin/menu', requireAdmin, async (req: AuthenticatedRequest, res, next) => {
    try {
      const validation = validateMenuInput(req.body);
      if (!validation.valid || !validation.data) {
        res.status(400).json({ error: validation.error });
        return;
      }

      const slug = validation.data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 32);
      const id = `dish-${slug}-${Date.now().toString().slice(-4)}`;

      const created = await MenuItemModel.create({
        id,
        ...validation.data,
      });

      res.status(201).json({ item: serializeDoc(created) });
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/admin/menu/:id — Protected route to update an existing dish
  router.put('/admin/menu/:id', requireAdmin, async (req: AuthenticatedRequest, res, next) => {
    try {
      const validation = validateMenuInput(req.body);
      if (!validation.valid || !validation.data) {
        res.status(400).json({ error: validation.error });
        return;
      }

      const updated = await MenuItemModel.findOneAndUpdate(
        { id: req.params.id },
        { $set: validation.data },
        { new: true }
      ).lean();

      if (!updated) {
        res.status(404).json({ error: 'Menu item not found.' });
        return;
      }

      res.json({ item: serializeDoc(updated) });
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/admin/menu/:id — Protected route to remove a dish
  router.delete(
    '/admin/menu/:id',
    requireAdmin,
    async (req: AuthenticatedRequest, res, next) => {
      try {
        const deleted = await MenuItemModel.findOneAndDelete({ id: req.params.id }).lean();
        if (!deleted) {
          res.status(404).json({ error: 'Menu item not found.' });
          return;
        }

        res.json({ deleted: serializeDoc(deleted) });
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
