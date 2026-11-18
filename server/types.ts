/**
 * Shared TypeScript types for TiffinBox Stories backend API and JSON storage.
 * Uses erasable TypeScript syntax compatible with Node 22 native type stripping.
 */

export type DietaryType = 'veg' | 'non-veg';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';
export type OrderStatus = 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number; // Price in INR (₹)
  dietary: DietaryType;
  mealType: MealType;
  imageUrl: string;
  cookName: string;
  origin: string;
  story: string;
  isTodaySpecial: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  dietary: DietaryType;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  area: string;
  deliverySlot: string;
  notes: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  contact: string;
  area: string;
  topic: string;
  message: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

export interface DatabaseSchema {
  seedVersion?: number;
  menuItems: MenuItem[];
  orders: Order[];
  contactMessages: ContactMessage[];
  admins: AdminUser[];
  orderSequence: number;
}
