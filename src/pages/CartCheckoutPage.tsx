import { useState, type FormEvent } from 'react';
import { CheckCircle2, Minus, Plus, Search, ShoppingBag, Trash2 } from 'lucide-react';
import { DishImage } from '../components/DishImage.tsx';
import { FREE_DELIVERY_THRESHOLD, useCart } from '../context/CartContext.tsx';
import { DELIVERY_AREAS } from '../data/subscriptions.ts';
import { createOrder, fetchOrderById } from '../lib/api.ts';
import type { AppRoute, Order } from '../types/index.ts';

interface CartCheckoutPageProps {
  onNavigate: (route: AppRoute) => void;
}

const DELIVERY_SLOTS = [
  'Morning (7:30 AM – 9:30 AM)',
  'Lunch (12:00 PM – 2:00 PM)',
  'Dinner (7:00 PM – 9:30 PM)',
];

export function CartCheckoutPage({ onNavigate }: CartCheckoutPageProps) {
  const { items, subtotal, deliveryFee, total, updateQuantity, removeItem, clearCart } = useCart();

  // Checkout form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState(DELIVERY_AREAS[0].name);
  const [address, setAddress] = useState('');
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0]);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Order lookup state
  const [lookupId, setLookupId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  const amountRemainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  const handleCheckoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (items.length === 0) {
      setFormError('Your tiffin bag is empty.');
      return;
    }

    const trimmedName = customerName.trim();
    const cleanedPhone = phone.replace(/\s+/g, '').trim();
    const trimmedAddress = address.trim();

    if (trimmedName.length < 2) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!/^(\+91)?[6-9]\d{9}$/.test(cleanedPhone)) {
      setFormError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (trimmedAddress.length < 10) {
      setFormError('Please enter your house/flat number, street, and landmark.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        customerName: trimmedName,
        phone: cleanedPhone,
        address: trimmedAddress,
        area,
        deliverySlot,
        notes: notes.trim(),
        items: items.map((entry) => ({
          menuItemId: entry.item.id,
          quantity: entry.quantity,
        })),
      });
      setConfirmedOrder(order);
      setTrackedOrder(order);
      clearCart();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to place your order right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOrderLookup = async (e: FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    if (!lookupId.trim()) {
      setLookupError('Enter an order ID such as TBS-1001.');
      return;
    }

    setLookupLoading(true);
    try {
      const order = await fetchOrderById(lookupId.trim());
      setTrackedOrder(order);
    } catch (err) {
      setTrackedOrder(null);
      setLookupError(err instanceof Error ? err.message : 'Order not found.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14 space-y-12">
      {/* Confirmed Order Receipt */}
      {confirmedOrder ? (
        <div className="max-w-2xl mx-auto bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-[#2F6B46] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2F6B46]">
                Order Confirmed
              </p>
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231B15]">
                Thank you, {confirmedOrder.customerName}
              </h1>
              <p className="text-sm text-[#6A5D52]">
                Your tiffin box is queued in our kitchen. Keep your order ID handy to check live
                preparation status.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-[#F3ECE0] p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-[#6A5D52]">Order ID</p>
              <p className="font-mono font-semibold text-[#231B15] tabular-nums">
                {confirmedOrder.id}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#6A5D52]">Status</p>
              <p className="font-semibold text-[#B84A2F]">{confirmedOrder.status}</p>
            </div>
            <div>
              <p className="text-xs text-[#6A5D52]">Delivery Slot</p>
              <p className="font-medium text-[#231B15]">{confirmedOrder.deliverySlot}</p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-[#231B15]">Order Summary</h2>
            <ul className="divide-y divide-[#E6DDD0] text-sm">
              {confirmedOrder.items.map((item) => (
                <li key={item.menuItemId} className="py-2.5 flex justify-between gap-4">
                  <span className="text-[#231B15]">
                    {item.name}{' '}
                    <span className="text-[#6A5D52] tabular-nums">&times; {item.quantity}</span>
                  </span>
                  <span className="font-medium text-[#231B15] tabular-nums">
                    ₹{item.price * item.quantity}
                  </span>
                </li>
              ))}
            </ul>
            <div className="pt-3 border-t border-[#E6DDD0] space-y-1.5 text-sm">
              <div className="flex justify-between text-[#6A5D52]">
                <span>Subtotal</span>
                <span className="tabular-nums">₹{confirmedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-[#6A5D52]">
                <span>Delivery Fee</span>
                <span className="tabular-nums">
                  {confirmedOrder.deliveryFee === 0 ? 'Free' : `₹${confirmedOrder.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-base text-[#231B15] pt-1">
                <span>Total Payable (Cash / UPI on Delivery)</span>
                <span className="tabular-nums">₹{confirmedOrder.total}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setConfirmedOrder(null);
                onNavigate('/menu');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#B84A2F] hover:bg-[#983921] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Order More Tiffins
            </button>
            <button
              type="button"
              onClick={() => setConfirmedOrder(null)}
              className="px-5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-[#231B15] text-sm font-semibold hover:bg-[#F3ECE0] transition-colors cursor-pointer"
            >
              Track Another Order
            </button>
          </div>
        </div>
      ) : items.length === 0 ? (
        /* Empty Bag State */
        <div className="max-w-xl mx-auto bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-8 sm:p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F3ECE0] flex items-center justify-center mx-auto text-[#B84A2F]">
            <ShoppingBag className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231B15]">
            Your tiffin bag is empty
          </h1>
          <p className="text-sm text-[#6A5D52]">
            Explore today&apos;s fresh South Indian breakfast, lunch, and dinner boxes to build
            your delivery order.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/menu')}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#B84A2F] hover:bg-[#983921] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Browse Today&apos;s Menu
          </button>
        </div>
      ) : (
        /* Active Cart & Checkout Two-Column Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items + Order Summary */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#B84A2F]">
                Step 1 of 2
              </p>
              <h1 className="font-serif text-3xl font-semibold text-[#231B15]">
                Your Tiffin Bag
              </h1>
            </div>

            {amountRemainingForFreeDelivery > 0 ? (
              <div className="rounded-xl bg-[#F6E6C4]/70 border border-[#D48B17]/40 px-4 py-3 text-xs sm:text-sm text-[#231B15]">
                Add <span className="font-semibold tabular-nums">₹{amountRemainingForFreeDelivery}</span> more
                for free doorstep delivery (orders ₹{FREE_DELIVERY_THRESHOLD}+).
              </div>
            ) : (
              <div className="rounded-xl bg-[#2F6B46]/10 border border-[#2F6B46]/30 px-4 py-3 text-xs sm:text-sm text-[#2F6B46] font-medium">
                You unlocked free home delivery on this tiffin order.
              </div>
            )}

            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] divide-y divide-[#E6DDD0]">
              {items.map(({ item, quantity }) => (
                <div key={item.id} className="p-4 sm:p-5 flex items-center gap-4">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-[#F3ECE0] shrink-0">
                    <DishImage
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#6A5D52]">
                      {item.dietary === 'veg' ? 'Veg' : 'Non-Veg'} · {item.mealType}
                    </p>
                    <h2 className="font-serif text-base font-semibold text-[#231B15] truncate">
                      {item.name}
                    </h2>
                    <p className="text-sm font-medium text-[#6A5D52] tabular-nums">
                      ₹{item.price} each
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="inline-flex items-center gap-1 bg-[#F3ECE0] rounded-xl p-1 border border-[#E6DDD0]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#FFFDF9] text-[#231B15] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, quantity + 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#B84A2F] text-white cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[3.5rem]">
                      <p className="font-semibold text-sm text-[#231B15] tabular-nums">
                        ₹{item.price * quantity}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name} from bag`}
                      className="p-1.5 text-[#6A5D52] hover:text-[#B84A2F] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-5 space-y-2.5 text-sm">
              <div className="flex justify-between text-[#6A5D52]">
                <span>Subtotal</span>
                <span className="tabular-nums">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#6A5D52]">
                <span>Delivery Fee</span>
                <span className="tabular-nums">
                  {deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="pt-2.5 border-t border-[#E6DDD0] flex justify-between items-baseline">
                <span className="font-serif text-lg font-semibold text-[#231B15]">
                  Total Payable
                </span>
                <span className="font-serif text-xl font-semibold text-[#231B15] tabular-nums">
                  ₹{total}
                </span>
              </div>
              <p className="text-xs text-[#6A5D52]">
                Pay via UPI or Cash on Delivery when your tiffin arrives.
              </p>
            </div>
          </div>

          {/* Right Column: Delivery Details Form */}
          <div className="lg:col-span-5 bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-6 space-y-5">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#B84A2F]">
                Step 2 of 2
              </p>
              <h2 className="font-serif text-2xl font-semibold text-[#231B15]">
                Delivery Details
              </h2>
            </div>

            {formError && (
              <div
                role="alert"
                className="rounded-xl bg-[#B84A2F]/10 border border-[#B84A2F]/30 px-4 py-3 text-sm text-[#983921]"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label htmlFor="checkout-name" className="block text-xs font-semibold text-[#231B15] mb-1.5">
                  Full Name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Karthik Sundaram"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                />
              </div>

              <div>
                <label htmlFor="checkout-phone" className="block text-xs font-semibold text-[#231B15] mb-1.5">
                  Mobile Number (10 digits)
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9845012345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] tabular-nums focus:outline-none focus:border-[#B84A2F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="checkout-area" className="block text-xs font-semibold text-[#231B15] mb-1.5">
                    Delivery Area
                  </label>
                  <select
                    id="checkout-area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                  >
                    {DELIVERY_AREAS.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="checkout-slot" className="block text-xs font-semibold text-[#231B15] mb-1.5">
                    Delivery Slot
                  </label>
                  <select
                    id="checkout-slot"
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                  >
                    {DELIVERY_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="checkout-address" className="block text-xs font-semibold text-[#231B15] mb-1.5">
                  Complete Street Address &amp; Landmark
                </label>
                <textarea
                  id="checkout-address"
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat / House no., street name, apartment or nearby landmark"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                />
              </div>

              <div>
                <label htmlFor="checkout-notes" className="block text-xs font-semibold text-[#231B15] mb-1.5">
                  Kitchen or Delivery Notes (optional)
                </label>
                <input
                  id="checkout-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Less spice, no onion/garlic, leave at gate..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-[#B84A2F] hover:bg-[#983921] disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                {submitting ? 'Confirming Your Tiffin...' : `Place Order · ₹${total}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Status Tracker Section */}
      <div className="border-t border-[#E6DDD0] pt-10">
        <div className="max-w-xl mx-auto bg-[#F3ECE0] rounded-2xl border border-[#E6DDD0] p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-semibold text-[#231B15]">
              Check Order Status
            </h2>
            <p className="text-xs text-[#6A5D52]">
              Already placed an order? Enter your Order ID (e.g. <span className="font-mono">TBS-1001</span>) to view live kitchen status.
            </p>
          </div>

          <form onSubmit={handleOrderLookup} className="flex gap-2">
            <input
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="TBS-1001"
              aria-label="Order ID"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FFFDF9] text-sm font-mono text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
            />
            <button
              type="submit"
              disabled={lookupLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#231B15] hover:bg-[#3A2E25] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span>{lookupLoading ? 'Checking...' : 'Track'}</span>
            </button>
          </form>

          {lookupError && <p className="text-xs text-[#B84A2F] font-medium">{lookupError}</p>}

          {trackedOrder && !confirmedOrder && (
            <div className="rounded-xl bg-[#FFFDF9] border border-[#E6DDD0] p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-[#231B15]">{trackedOrder.id}</span>
                <span className="font-semibold text-[#B84A2F]">{trackedOrder.status}</span>
              </div>
              <p className="text-xs text-[#6A5D52]">
                {trackedOrder.customerName} · {trackedOrder.area} · {trackedOrder.deliverySlot}
              </p>
              <p className="text-xs text-[#231B15] tabular-nums">
                {trackedOrder.items.map((i) => `${i.name} (${i.quantity})`).join(', ')} — Total ₹
                {trackedOrder.total}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
