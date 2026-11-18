import mongoose, { Schema } from 'mongoose';

const menuItemSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
    dietary: { type: String, enum: ['veg', 'non-veg'], required: true },
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner'], required: true },
    imageUrl: { type: String, required: true },
    cookName: { type: String, required: true },
    origin: { type: String, required: true },
    story: { type: String, required: true },
    isTodaySpecial: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'menu_items',
  }
);

const orderItemSchema = new Schema(
  {
    menuItemId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    dietary: { type: String, enum: ['veg', 'non-veg'], required: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    area: { type: String, required: true },
    deliverySlot: { type: String, required: true },
    notes: { type: String, default: '' },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'],
      default: 'Confirmed',
    },
  },
  {
    timestamps: true,
    collection: 'orders',
  }
);

const contactMessageSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    area: { type: String, required: true },
    topic: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: 'contact_messages',
  }
);

const adminUserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  {
    collection: 'admins',
  }
);

const counterSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 1001 },
  },
  {
    collection: 'counters',
  }
);

const metadataSchema = new Schema(
  {
    _id: { type: String, required: true },
    seedVersion: { type: Number, required: true, default: 2 },
  },
  {
    collection: 'app_metadata',
  }
);

export const MenuItemModel =
  mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
export const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const ContactMessageModel =
  mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);
export const AdminUserModel =
  mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);
export const CounterModel = mongoose.models.Counter || mongoose.model('Counter', counterSchema);
export const MetadataModel =
  mongoose.models.AppMetadata || mongoose.model('AppMetadata', metadataSchema);
