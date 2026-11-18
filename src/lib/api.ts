import type { ContactMessage, DietaryType, MealType, MenuItem, Order, OrderStatus } from '../types/index.ts';

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let data: Record<string, unknown> = {};

  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      if (res.ok) {
        throw new Error('Received an unexpected non-JSON response from the server.');
      }
    }
  }

  if (!res.ok) {
    const message =
      typeof data?.error === 'string' ? data.error : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function fetchMenu(filters?: {
  dietary?: DietaryType | 'all';
  mealType?: MealType | 'all';
  q?: string;
  includeUnavailable?: boolean;
}): Promise<MenuItem[]> {
  const params = new URLSearchParams();
  if (filters?.dietary && filters.dietary !== 'all') {
    params.set('dietary', filters.dietary);
  }
  if (filters?.mealType && filters.mealType !== 'all') {
    params.set('mealType', filters.mealType);
  }
  if (filters?.q?.trim()) {
    params.set('q', filters.q.trim());
  }
  if (filters?.includeUnavailable) {
    params.set('includeUnavailable', 'true');
  }
  const query = params.toString();
  const res = await fetch(`/api/menu${query ? `?${query}` : ''}`);
  const data = await parseJsonResponse<{ items?: MenuItem[] }>(res);
  if (!Array.isArray(data?.items)) {
    throw new Error('Menu data is currently unavailable.');
  }
  return data.items;
}

export async function createOrder(payload: {
  customerName: string;
  phone: string;
  address: string;
  area: string;
  deliverySlot: string;
  notes: string;
  items: Array<{ menuItemId: string; quantity: number }>;
}): Promise<Order> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse<{ order: Order }>(res);
  return data.order;
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`/api/orders/${encodeURIComponent(id.trim())}`);
  const data = await parseJsonResponse<{ order: Order }>(res);
  return data.order;
}

export async function submitContact(payload: {
  name: string;
  contact: string;
  area: string;
  topic: string;
  message: string;
}): Promise<{ message: string; enquiry: ContactMessage }> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<{ message: string; enquiry: ContactMessage }>(res);
}

export async function adminLogin(
  email: string,
  password: string
): Promise<{ token: string; admin: { id: string; email: string; name: string } }> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseJsonResponse(res);
}

export async function adminGetOrders(
  token: string
): Promise<{ orders: Order[]; contactMessages: ContactMessage[] }> {
  const res = await fetch('/api/admin/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await parseJsonResponse<{
    orders?: Order[];
    contactMessages?: ContactMessage[];
  }>(res);
  return {
    orders: Array.isArray(data.orders) ? data.orders : [],
    contactMessages: Array.isArray(data.contactMessages) ? data.contactMessages : [],
  };
}

export async function adminUpdateOrderStatus(
  token: string,
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await parseJsonResponse<{ order: Order }>(res);
  return data.order;
}

export type MenuItemFormPayload = {
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
};

export async function adminCreateMenuItem(
  token: string,
  payload: MenuItemFormPayload
): Promise<MenuItem> {
  const res = await fetch('/api/admin/menu', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse<{ item: MenuItem }>(res);
  return data.item;
}

export async function adminUpdateMenuItem(
  token: string,
  id: string,
  payload: MenuItemFormPayload
): Promise<MenuItem> {
  const res = await fetch(`/api/admin/menu/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse<{ item: MenuItem }>(res);
  return data.item;
}

export async function adminDeleteMenuItem(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/menu/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseJsonResponse(res);
}
