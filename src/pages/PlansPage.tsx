import { useState, type FormEvent } from 'react';
import { Check, CheckCircle2, X } from 'lucide-react';
import { DELIVERY_AREAS, SUBSCRIPTION_PLANS } from '../data/subscriptions.ts';
import { submitContact } from '../lib/api.ts';
import type { SubscriptionPlan } from '../types/index.ts';

export function PlansPage() {
  const [cadenceFilter, setCadenceFilter] = useState<'All' | 'Weekly' | 'Monthly'>('All');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Plan enrollment enquiry form state
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [area, setArea] = useState(DELIVERY_AREAS[0].name);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const visiblePlans = SUBSCRIPTION_PLANS.filter((plan) =>
    cadenceFilter === 'All' ? true : plan.cadence === cadenceFilter
  );

  const openPlanModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setError(null);
    setSuccessMsg(null);
  };

  const handlePlanSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setError(null);

    if (name.trim().length < 2 || contact.trim().length < 5) {
      setError('Please enter your name and mobile number or email.');
      return;
    }

    setSubmitting(true);
    try {
      await submitContact({
        name: name.trim(),
        contact: contact.trim(),
        area,
        topic: `Subscription: ${selectedPlan.title} (${selectedPlan.cadence})`,
        message: `Interested in ${selectedPlan.title} (₹${selectedPlan.price}). ${
          notes.trim() || 'Please call to confirm my start date and delivery slot.'
        }`,
      });
      setSuccessMsg(
        `Request received for ${selectedPlan.title}. Our kitchen coordinator will call you within 2 hours to confirm your start date.`
      );
      setName('');
      setContact('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit plan enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E6DDD0]">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#B84A2F]">
            Weekly &amp; Monthly Tiffin Subscriptions
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231B15] text-balance">
            Nourishing everyday tiffins, delivered on your rhythm.
          </h1>
          <p className="text-base text-[#6A5D52]">
            Flexible Monday–Saturday plans with zero delivery fees, easy meal pauses, and rotating
            home-style regional menus.
          </p>
        </div>

        {/* Cadence Toggle */}
        <div
          role="group"
          aria-label="Filter plans by cadence"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F3ECE0] border border-[#E6DDD0] self-start"
        >
          {(['All', 'Weekly', 'Monthly'] as const).map((tab) => {
            const active = cadenceFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setCadenceFilter(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#B84A2F] text-white'
                    : 'text-[#6A5D52] hover:text-[#231B15]'
                }`}
              >
                {tab === 'All' ? 'All Plans' : `${tab} Plans`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visiblePlans.map((plan) => (
          <article
            key={plan.id}
            className={`flex flex-col justify-between rounded-2xl p-6 sm:p-8 border transition-shadow ${
              plan.featured
                ? 'bg-[#FFFDF9] border-[#B84A2F] shadow-sm'
                : 'bg-[#FFFDF9] border-[#E6DDD0]'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-[#6A5D52] font-medium">
                  {plan.cadence} · {plan.dietary}
                </span>
                {plan.featured && (
                  <span className="font-semibold text-[#B84A2F]">Most Popular</span>
                )}
              </div>

              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#231B15]">{plan.title}</h2>
                <p className="text-xs font-medium text-[#6A5D52] mt-1">{plan.mealsIncluded}</p>
              </div>

              <div className="flex items-baseline gap-2.5 pt-1">
                <span className="font-serif text-3xl font-semibold text-[#231B15] tabular-nums">
                  ₹{plan.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-[#2F6B46] font-medium">{plan.perMealNote}</span>
              </div>

              <p className="text-sm text-[#6A5D52] leading-relaxed">{plan.description}</p>

              <ul className="space-y-2.5 pt-2 border-t border-[#E6DDD0]">
                {plan.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5 text-sm text-[#231B15]">
                    <Check
                      className="w-4 h-4 text-[#2F6B46] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E6DDD0]">
              <button
                type="button"
                onClick={() => openPlanModal(plan)}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                  plan.featured
                    ? 'bg-[#B84A2F] hover:bg-[#983921] text-white'
                    : 'bg-[#F3ECE0] hover:bg-[#E6DDD0] text-[#231B15]'
                }`}
              >
                Start {plan.title}
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Plan Enquiry Modal */}
      {selectedPlan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="plan-dialog-title"
          className="fixed inset-0 z-50 bg-[#231B15]/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] max-w-md w-full p-6 space-y-5 relative shadow-xl">
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              aria-label="Close subscription enquiry modal"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6A5D52] hover:text-[#231B15] hover:bg-[#F3ECE0] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#B84A2F]">
                {selectedPlan.cadence} Subscription · ₹{selectedPlan.price.toLocaleString('en-IN')}
              </p>
              <h2 id="plan-dialog-title" className="font-serif text-2xl font-semibold text-[#231B15]">
                {selectedPlan.title}
              </h2>
              <p className="text-xs text-[#6A5D52]">{selectedPlan.mealsIncluded}</p>
            </div>

            {successMsg ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#2F6B46]/10 border border-[#2F6B46]/30 p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#2F6B46] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#231B15]">{successMsg}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="w-full py-2.5 rounded-xl bg-[#231B15] text-white text-sm font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePlanSubmit} className="space-y-4">
                {error && (
                  <p className="rounded-xl bg-[#B84A2F]/10 border border-[#B84A2F]/30 px-3.5 py-2.5 text-xs text-[#983921]">
                    {error}
                  </p>
                )}

                <div>
                  <label htmlFor="plan-name" className="block text-xs font-semibold text-[#231B15] mb-1">
                    Your Name
                  </label>
                  <input
                    id="plan-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                  />
                </div>

                <div>
                  <label htmlFor="plan-contact" className="block text-xs font-semibold text-[#231B15] mb-1">
                    Mobile Number or Email
                  </label>
                  <input
                    id="plan-contact"
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="9845012345 or email@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                  />
                </div>

                <div>
                  <label htmlFor="plan-area" className="block text-xs font-semibold text-[#231B15] mb-1">
                    Delivery Neighbourhood
                  </label>
                  <select
                    id="plan-area"
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
                  <label htmlFor="plan-notes" className="block text-xs font-semibold text-[#231B15] mb-1">
                    Preferred Start Date &amp; Dietary Notes
                  </label>
                  <textarea
                    id="plan-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Starting Monday, mild spice preferred"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#B84A2F] hover:bg-[#983921] disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  {submitting ? 'Sending Request...' : 'Request Plan Activation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
