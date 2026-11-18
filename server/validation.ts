import type { DietaryType, MealType, OrderStatus } from './types.ts';

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  error?: string;
}

const VALID_DIETARY: DietaryType[] = ['veg', 'non-veg'];
const VALID_MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];
const VALID_ORDER_STATUSES: OrderStatus[] = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

export interface ValidatedOrderInput {
  customerName: string;
  phone: string;
  address: string;
  area: string;
  deliverySlot: string;
  notes: string;
  items: Array<{ menuItemId: string; quantity: number }>;
}

export function validateOrderInput(body: unknown): ValidationResult<ValidatedOrderInput> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }

  const record = body as Record<string, unknown>;
  const customerName = typeof record.customerName === 'string' ? record.customerName.trim() : '';
  const phone = typeof record.phone === 'string' ? record.phone.replace(/\s+/g, '').trim() : '';
  const address = typeof record.address === 'string' ? record.address.trim() : '';
  const area = typeof record.area === 'string' ? record.area.trim() : 'Panaiyur & Uthandi (ECR)';
  const deliverySlot = typeof record.deliverySlot === 'string' ? record.deliverySlot.trim() : 'Next Available Slot';
  const notes = typeof record.notes === 'string' ? record.notes.trim().slice(0, 300) : '';

  if (customerName.length < 2 || customerName.length > 80) {
    return { valid: false, error: 'Please enter a valid full name (2–80 characters).' };
  }

  if (!/^(\+91)?[6-9]\d{9}$/.test(phone)) {
    return { valid: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }

  if (address.length < 10 || address.length > 300) {
    return { valid: false, error: 'Please enter a complete delivery address (at least 10 characters).' };
  }

  if (!Array.isArray(record.items) || record.items.length === 0) {
    return { valid: false, error: 'Your order must include at least one tiffin item.' };
  }

  const validatedItems: Array<{ menuItemId: string; quantity: number }> = [];
  for (const item of record.items) {
    if (!item || typeof item !== 'object') {
      return { valid: false, error: 'Invalid item entry in order.' };
    }
    const itemRecord = item as Record<string, unknown>;
    const menuItemId = typeof itemRecord.menuItemId === 'string' ? itemRecord.menuItemId.trim() : '';
    const quantity = Number(itemRecord.quantity);
    if (!menuItemId || !Number.isInteger(quantity) || quantity < 1 || quantity > 25) {
      return { valid: false, error: 'Each item must have a valid ID and quantity between 1 and 25.' };
    }
    validatedItems.push({ menuItemId, quantity });
  }

  return {
    valid: true,
    data: {
      customerName,
      phone,
      address,
      area,
      deliverySlot,
      notes,
      items: validatedItems,
    },
  };
}

export interface ValidatedContactInput {
  name: string;
  contact: string;
  area: string;
  topic: string;
  message: string;
}

export function validateContactInput(body: unknown): ValidationResult<ValidatedContactInput> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }
  const record = body as Record<string, unknown>;
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const contact = typeof record.contact === 'string' ? record.contact.trim() : '';
  const area = typeof record.area === 'string' ? record.area.trim() : 'General';
  const topic = typeof record.topic === 'string' ? record.topic.trim() : 'General Enquiry';
  const message = typeof record.message === 'string' ? record.message.trim() : '';

  if (name.length < 2 || name.length > 80) {
    return { valid: false, error: 'Please enter your name (2–80 characters).' };
  }
  if (contact.length < 5 || contact.length > 100) {
    return { valid: false, error: 'Please provide a valid phone number or email address.' };
  }
  if (message.length < 8 || message.length > 1000) {
    return { valid: false, error: 'Please write a message of at least 8 characters.' };
  }

  return {
    valid: true,
    data: { name, contact, area, topic, message },
  };
}

export interface ValidatedMenuInput {
  name: string;
  description: string;
  price: number;
  dietary: DietaryType;
  mealType: MealType;
  imageUrl: string;
  cookName: string;
  origin: string;
  story: string;
  isTodaySpecial: boolean;
  isAvailable: boolean;
}

export function validateMenuInput(body: unknown): ValidationResult<ValidatedMenuInput> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object.' };
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const description = typeof record.description === 'string' ? record.description.trim() : '';
  const price = Number(record.price);
  const dietary = record.dietary as DietaryType;
  const mealType = record.mealType as MealType;
  const imageUrl = typeof record.imageUrl === 'string' && record.imageUrl.trim()
    ? record.imageUrl.trim()
    : '/src/assets/images/dish_mallige_idli_1794992174801.jpg';
  const cookName = typeof record.cookName === 'string' ? record.cookName.trim() : '';
  const origin = typeof record.origin === 'string' ? record.origin.trim() : '';
  const story = typeof record.story === 'string' ? record.story.trim() : '';
  const isTodaySpecial = Boolean(record.isTodaySpecial);
  const isAvailable = record.isAvailable === undefined ? true : Boolean(record.isAvailable);

  if (name.length < 3 || name.length > 100) {
    return { valid: false, error: 'Dish name must be between 3 and 100 characters.' };
  }
  if (description.length < 10 || description.length > 400) {
    return { valid: false, error: 'Description must be between 10 and 400 characters.' };
  }
  if (!Number.isFinite(price) || price < 20 || price > 5000) {
    return { valid: false, error: 'Price must be a valid amount between ₹20 and ₹5,000.' };
  }
  if (!VALID_DIETARY.includes(dietary)) {
    return { valid: false, error: 'Dietary type must be "veg" or "non-veg".' };
  }
  if (!VALID_MEAL_TYPES.includes(mealType)) {
    return { valid: false, error: 'Meal type must be Breakfast, Lunch, or Dinner.' };
  }
  if (cookName.length < 2 || cookName.length > 80) {
    return { valid: false, error: 'Cook name must be between 2 and 80 characters.' };
  }
  if (origin.length < 2 || origin.length > 80) {
    return { valid: false, error: 'Origin region must be between 2 and 80 characters.' };
  }
  if (story.length < 15 || story.length > 800) {
    return { valid: false, error: 'Dish story must be between 15 and 800 characters.' };
  }

  return {
    valid: true,
    data: {
      name,
      description,
      price: Math.round(price),
      dietary,
      mealType,
      imageUrl,
      cookName,
      origin,
      story,
      isTodaySpecial,
      isAvailable,
    },
  };
}

export function validateOrderStatus(status: unknown): ValidationResult<OrderStatus> {
  if (typeof status !== 'string' || !VALID_ORDER_STATUSES.includes(status as OrderStatus)) {
    return {
      valid: false,
      error: `Status must be one of: ${VALID_ORDER_STATUSES.join(', ')}.`,
    };
  }
  return { valid: true, data: status as OrderStatus };
}
