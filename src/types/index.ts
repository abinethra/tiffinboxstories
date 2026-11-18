export type DietaryType = 'veg' | 'non-veg';
export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';
export type OrderStatus = 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Delivered';
export type AppRoute = '/' | '/menu' | '/stories' | '/plans' | '/about' | '/cart' | '/admin';

export interface MenuItem {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
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

export interface SubscriptionPlan {
  id: string;
  title: string;
  cadence: 'Weekly' | 'Monthly';
  dietary: 'Veg' | 'Veg & Non-Veg';
  mealsIncluded: string;
  price: number;
  perMealNote: string;
  description: string;
  highlights: string[];
  featured?: boolean;
}
