import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Edit2, LogOut, Plus, Trash2, X } from 'lucide-react';
import {
  adminCreateMenuItem,
  adminDeleteMenuItem,
  adminGetOrders,
  adminLogin,
  adminUpdateMenuItem,
  adminUpdateOrderStatus,
  fetchMenu,
  type MenuItemFormPayload,
} from '../lib/api.ts';
import type { ContactMessage, DietaryType, MealType, MenuItem, Order, OrderStatus } from '../types/index.ts';

interface AdminPageProps {
  onMenuChanged: () => void;
}

const TOKEN_KEY = 'tiffinbox_admin_jwt';
const ORDER_STATUSES: OrderStatus[] = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

const EMPTY_FORM: MenuItemFormPayload = {
  name: '',
  description: '',
  price: 160,
  dietary: 'veg',
  mealType: 'Breakfast',
  imageUrl: '/src/assets/images/dish_mallige_idli_1794992174801.jpg',
  cookName: '',
  origin: '',
  story: '',
  isTodaySpecial: false,
  isAvailable: true,
};

export function AdminPage({ onMenuChanged }: AdminPageProps) {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem(TOKEN_KEY));
  const [email, setEmail] = useState('admin@tiffinboxstories.in');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [enquiries, setEnquiries] = useState<ContactMessage[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Add / Edit Menu Modal state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<MenuItemFormPayload>(EMPTY_FORM);
  const [savingDish, setSavingDish] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadAdminData = useCallback(async (authToken: string) => {
    setLoadingData(true);
    setDashboardError(null);
    try {
      const [items, ordersRes] = await Promise.all([
        fetchMenu({ includeUnavailable: true }),
        adminGetOrders(authToken),
      ]);
      setMenuItems(items);
      setOrders(ordersRes.orders);
      setEnquiries(ordersRes.contactMessages);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to load kitchen dashboard.';
      if (msg.toLowerCase().includes('session') || msg.toLowerCase().includes('authentication')) {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
      }
      setDashboardError(msg);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      loadAdminData(token);
    }
  }, [token, loadAdminData]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoggingIn(true);
    try {
      const res = await adminLogin(email.trim(), password);
      sessionStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setPassword('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setFormState(EMPTY_FORM);
    setFormError(null);
    setEditorOpen(true);
  };

  const openEditModal = (dish: MenuItem) => {
    setEditingId(dish.id);
    setFormState({
      name: dish.name,
      description: dish.description,
      price: dish.price,
      dietary: dish.dietary,
      mealType: dish.mealType,
      imageUrl: dish.imageUrl,
      cookName: dish.cookName,
      origin: dish.origin,
      story: dish.story,
      isTodaySpecial: dish.isTodaySpecial,
      isAvailable: dish.isAvailable,
    });
    setFormError(null);
    setEditorOpen(true);
  };

  const handleSaveDish = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormError(null);
    setSavingDish(true);
    try {
      if (editingId) {
        const updated = await adminUpdateMenuItem(token, editingId, formState);
        setMenuItems((prev) => prev.map((d) => (d.id === editingId ? updated : d)));
      } else {
        const created = await adminCreateMenuItem(token, formState);
        setMenuItems((prev) => [created, ...prev]);
      }
      onMenuChanged();
      setEditorOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save dish.');
    } finally {
      setSavingDish(false);
    }
  };

  const handleDeleteDish = async (dish: MenuItem) => {
    if (!token) return;
    try {
      await adminDeleteMenuItem(token, dish.id);
      setMenuItems((prev) => prev.filter((item) => item.id !== dish.id));
      onMenuChanged();
    } catch (err) {
      setDashboardError(err instanceof Error ? err.message : 'Unable to delete dish.');
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    if (!token) return;
    try {
      const updated = await adminUpdateOrderStatus(token, orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (err) {
      setDashboardError(err instanceof Error ? err.message : 'Unable to update order status.');
    }
  };

  if (!token) {
    return (
      <section className="max-w-md mx-auto px-4 py-14">
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-6 sm:p-8 space-y-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#B84A2F]">
              Kitchen Operations
            </p>
            <h1 className="font-serif text-2xl font-semibold text-[#231B15]">
              Admin Sign In
            </h1>
            <p className="text-xs text-[#6A5D52]">
              Manage daily menu items, dish stories, and live customer tiffin orders.
            </p>
          </div>

          {authError && (
            <div
              role="alert"
              className="rounded-xl bg-[#B84A2F]/10 border border-[#B84A2F]/30 px-3.5 py-2.5 text-xs text-[#983921]"
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-[#231B15] mb-1">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-[#231B15] mb-1">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter kitchen password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-xl bg-[#B84A2F] hover:bg-[#983921] disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {loggingIn ? 'Signing In...' : 'Sign In to Kitchen'}
            </button>
          </form>

          <p className="text-xs text-[#6A5D52] pt-2 border-t border-[#E6DDD0]">
            Seeded dev credentials: <span className="font-mono">admin@tiffinboxstories.in</span> /{' '}
            <span className="font-mono">tiffin-kitchen-2026</span>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6DDD0]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#B84A2F]">
            Kitchen Admin Portal
          </p>
          <h1 className="font-serif text-3xl font-semibold text-[#231B15]">
            Menu &amp; Order Desk
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F3ECE0] border border-[#E6DDD0]">
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                activeTab === 'menu' ? 'bg-[#FFFDF9] text-[#231B15] shadow-xs' : 'text-[#6A5D52]'
              }`}
            >
              Menu ({menuItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#FFFDF9] text-[#231B15] shadow-xs'
                  : 'text-[#6A5D52]'
              }`}
            >
              Orders ({orders.length})
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E6DDD0] bg-[#FFFDF9] text-xs font-semibold text-[#231B15] hover:bg-[#F3ECE0] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {dashboardError && (
        <div className="rounded-xl bg-[#B84A2F]/10 border border-[#B84A2F]/30 px-4 py-3 text-sm text-[#983921]">
          {dashboardError}
        </div>
      )}

      {loadingData ? (
        <p className="text-sm text-[#6A5D52]">Loading kitchen records...</p>
      ) : activeTab === 'menu' ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl font-semibold text-[#231B15]">
              All Tiffin Dishes
            </h2>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B84A2F] hover:bg-[#983921] text-white text-sm font-semibold cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Dish</span>
            </button>
          </div>

          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E6DDD0] text-xs text-[#6A5D52] bg-[#F3ECE0]/60">
                <tr>
                  <th className="py-3 px-4 font-semibold">Dish</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Cook</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6DDD0]">
                {menuItems.map((dish) => (
                  <tr key={dish.id} className="hover:bg-[#FAF6EF]/60">
                    <td className="py-3 px-4 font-medium text-[#231B15]">
                      {dish.name}
                      {dish.isTodaySpecial && (
                        <span className="ml-2 text-xs font-semibold text-[#B84A2F]">
                          · Special
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#6A5D52]">
                      {dish.dietary === 'veg' ? 'Veg' : 'Non-Veg'} · {dish.mealType}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#6A5D52]">{dish.cookName}</td>
                    <td className="py-3 px-4 font-medium tabular-nums">₹{dish.price}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className={dish.isAvailable ? 'text-[#2F6B46] font-medium' : 'text-[#6A5D52]'}>
                        {dish.isAvailable ? 'Available' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(dish)}
                        aria-label={`Edit ${dish.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#231B15] hover:bg-[#F3ECE0] mr-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDish(dish)}
                        aria-label={`Delete ${dish.name}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#B84A2F] hover:bg-[#B84A2F]/10 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-semibold text-[#231B15]">Customer Orders</h2>
            {orders.length === 0 ? (
              <p className="text-sm text-[#6A5D52]">No orders placed yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6A5D52]">
                        <span className="font-mono font-semibold text-[#231B15]">{order.id}</span>
                        <span>·</span>
                        <span>{order.deliverySlot}</span>
                        <span>·</span>
                        <span>{order.area}</span>
                      </div>
                      <p className="font-serif text-lg font-semibold text-[#231B15]">
                        {order.customerName}{' '}
                        <span className="font-sans text-xs font-normal text-[#6A5D52] tabular-nums">
                          ({order.phone})
                        </span>
                      </p>
                      <p className="text-xs text-[#6A5D52]">{order.address}</p>
                      <p className="text-sm text-[#231B15] tabular-nums">
                        {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')} —{' '}
                        <span className="font-semibold">₹{order.total}</span>
                      </p>
                      {order.notes && (
                        <p className="text-xs text-[#B84A2F]">Note: {order.notes}</p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <label htmlFor={`status-${order.id}`} className="text-xs text-[#6A5D52]">
                        Status:
                      </label>
                      <select
                        id={`status-${order.id}`}
                        value={order.status}
                        onChange={(e) =>
                          handleOrderStatusChange(order.id, e.target.value as OrderStatus)
                        }
                        className="px-3 py-2 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-xs font-semibold text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {enquiries.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-semibold text-[#231B15]">
                Customer &amp; Plan Enquiries
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {enquiries.map((msg) => (
                  <div
                    key={msg.id}
                    className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-4 space-y-1.5 text-sm"
                  >
                    <p className="text-xs font-semibold text-[#B84A2F]">{msg.topic}</p>
                    <p className="font-semibold text-[#231B15]">
                      {msg.name}{' '}
                      <span className="font-normal text-xs text-[#6A5D52]">
                        ({msg.contact} · {msg.area})
                      </span>
                    </p>
                    <p className="text-xs text-[#6A5D52] leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      {editorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dish-editor-title"
          className="fixed inset-0 z-50 bg-[#231B15]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] max-w-lg w-full p-6 space-y-4 relative my-8 shadow-xl">
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              aria-label="Close dish editor"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6A5D52] hover:bg-[#F3ECE0] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 id="dish-editor-title" className="font-serif text-2xl font-semibold text-[#231B15]">
              {editingId ? 'Edit Tiffin Dish' : 'Add New Tiffin Dish'}
            </h2>

            {formError && (
              <p className="rounded-xl bg-[#B84A2F]/10 border border-[#B84A2F]/30 px-3.5 py-2.5 text-xs text-[#983921]">
                {formError}
              </p>
            )}

            <form onSubmit={handleSaveDish} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#231B15] mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#231B15] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min={20}
                    max={5000}
                    required
                    value={formState.price}
                    onChange={(e) => setFormState({ ...formState, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#231B15] mb-1">Dietary</label>
                  <select
                    value={formState.dietary}
                    onChange={(e) =>
                      setFormState({ ...formState, dietary: e.target.value as DietaryType })
                    }
                    className="w-full px-2.5 py-2 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm"
                  >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#231B15] mb-1">Meal</label>
                  <select
                    value={formState.mealType}
                    onChange={(e) =>
                      setFormState({ ...formState, mealType: e.target.value as MealType })
                    }
                    className="w-full px-2.5 py-2 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#231B15] mb-1">Cook Name</label>
                  <input
                    type="text"
                    required
                    value={formState.cookName}
                    onChange={(e) => setFormState({ ...formState, cookName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#231B15] mb-1">Origin</label>
                  <input
                    type="text"
                    required
                    value={formState.origin}
                    onChange={(e) => setFormState({ ...formState, origin: e.target.value })}
                    placeholder="e.g. Madurai, Tamil Nadu"
                    className="w-full px-3 py-2 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231B15] mb-1">
                  Image Path / URL
                </label>
                <input
                  type="text"
                  value={formState.imageUrl}
                  onChange={(e) => setFormState({ ...formState, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231B15] mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#231B15] mb-1">
                  Origin Story
                </label>
                <textarea
                  rows={3}
                  required
                  value={formState.story}
                  onChange={(e) => setFormState({ ...formState, story: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm"
                />
              </div>

              <div className="flex items-center gap-6 pt-1 text-xs font-medium text-[#231B15]">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isTodaySpecial}
                    onChange={(e) =>
                      setFormState({ ...formState, isTodaySpecial: e.target.checked })
                    }
                    className="accent-[#B84A2F]"
                  />
                  <span>Feature in Today&apos;s Special</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.isAvailable}
                    onChange={(e) =>
                      setFormState({ ...formState, isAvailable: e.target.checked })
                    }
                    className="accent-[#2F6B46]"
                  />
                  <span>Available for Order</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6DDD0] text-sm font-semibold text-[#231B15] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDish}
                  className="px-5 py-2 rounded-xl bg-[#B84A2F] hover:bg-[#983921] text-white text-sm font-semibold cursor-pointer"
                >
                  {savingDish ? 'Saving...' : editingId ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
