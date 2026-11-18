import { useState, type FormEvent } from 'react';
import { CheckCircle2, Clock, MapPin, MessageCircle } from 'lucide-react';
import { DELIVERY_AREAS, KITCHEN_COOKS } from '../data/subscriptions.ts';
import { submitContact } from '../lib/api.ts';

export function AboutContactPage() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [area, setArea] = useState(DELIVERY_AREAS[0].name);
  const [topic, setTopic] = useState('General Enquiry');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (name.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (contact.trim().length < 5) {
      setError('Please enter a valid phone number or email.');
      return;
    }
    if (message.trim().length < 8) {
      setError('Please write a message of at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitContact({
        name: name.trim(),
        contact: contact.trim(),
        area,
        topic,
        message: message.trim(),
      });
      setSuccessMsg(res.message);
      setName('');
      setContact('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14 space-y-14">
      {/* 1. About Our Kitchen & Cooks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12 border-b border-[#E6DDD0]">
        <div className="lg:col-span-6 space-y-4">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#B84A2F]">
            Our Cloud Kitchen Philosophy
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231B15] text-balance">
            Built around home cooks, slow fermentation, and honest ingredients.
          </h1>
          <p className="text-base text-[#6A5D52] leading-relaxed">
            TiffinBox Stories began with a simple observation: city life leaves very little time for
            twelve-hour stone-ground batters and freshly roasted masalas, yet restaurant takeaways
            seldom feel like home.
          </p>
          <p className="text-base text-[#6A5D52] leading-relaxed">
            Operating purely as a delivery kitchen allows us to put every rupee into cold-pressed
            gingelly oil, A2 cultured ghee, farm-sourced produce, and fair hours for our team of
            regional home cooks.
          </p>
        </div>

        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {KITCHEN_COOKS.map((cook) => (
            <div
              key={cook.name}
              className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-5 space-y-1.5"
            >
              <p className="text-xs font-semibold text-[#B84A2F]">{cook.region}</p>
              <h2 className="font-serif text-lg font-semibold text-[#231B15]">{cook.name}</h2>
              <p className="text-xs text-[#231B15] font-medium">{cook.specialty}</p>
              <p className="text-xs text-[#6A5D52]">{cook.years}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Delivery Areas & Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Delivery Areas & WhatsApp */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#B84A2F]">
              Delivery Coverage
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#231B15]">
              Where We Deliver Warm
            </h2>
            <p className="text-sm text-[#6A5D52]">
              We dispatch in insulated carriers from our Panaiyur, ECR cloud kitchen across
              neighbouring East Coast Road and OMR zones.
            </p>
          </div>

          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] divide-y divide-[#E6DDD0]">
            {DELIVERY_AREAS.map((item) => (
              <div
                key={item.name}
                className="px-4 py-3.5 flex items-center justify-between gap-4 text-sm"
              >
                <span className="inline-flex items-center gap-2 text-[#231B15] font-medium">
                  <MapPin className="w-4 h-4 text-[#B84A2F] shrink-0" aria-hidden="true" />
                  {item.name}
                </span>
                <span className="text-xs text-[#6A5D52] tabular-nums shrink-0">{item.window}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#F3ECE0] rounded-2xl border border-[#E6DDD0] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#231B15]">
              <Clock className="w-4 h-4 text-[#D48B17]" aria-hidden="true" />
              <span>Kitchen Hours: 7:00 AM – 10:00 PM Daily</span>
            </div>
            <p className="text-sm text-[#6A5D52]">
              Need a custom group tiffin box or have an urgent delivery question? Message our
              kitchen desk directly on WhatsApp.
            </p>
            <a
              href="https://wa.me/919845011223?text=Hello%20TiffinBox%20Stories!%20I%20have%20a%20question%20about%20tiffin%20delivery."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F6B46] hover:bg-[#245537] text-white text-sm font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7 bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-6 sm:p-8 space-y-5">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-semibold text-[#231B15]">
              Write to Our Kitchen Desk
            </h2>
            <p className="text-sm text-[#6A5D52]">
              Ask about corporate lunch boxes, custom allergy notes, or expanding delivery to your
              apartment block.
            </p>
          </div>

          {successMsg && (
            <div className="rounded-xl bg-[#2F6B46]/10 border border-[#2F6B46]/30 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#2F6B46] shrink-0 mt-0.5" />
              <p className="text-sm text-[#231B15]">{successMsg}</p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl bg-[#B84A2F]/10 border border-[#B84A2F]/30 px-4 py-3 text-sm text-[#983921]"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold text-[#231B15] mb-1.5">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                />
              </div>

              <div>
                <label htmlFor="contact-info" className="block text-xs font-semibold text-[#231B15] mb-1.5">
                  Phone or Email
                </label>
                <input
                  id="contact-info"
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="9845012345 or email"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-area" className="block text-xs font-semibold text-[#231B15] mb-1.5">
                  Neighbourhood
                </label>
                <select
                  id="contact-area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                >
                  {DELIVERY_AREAS.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                  <option value="Other Area">Other ECR / OMR Area</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-topic" className="block text-xs font-semibold text-[#231B15] mb-1.5">
                  Enquiry Topic
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
                >
                  <option value="General Enquiry">General Enquiry</option>
                  <option value="Weekly / Monthly Subscription">Weekly / Monthly Subscription</option>
                  <option value="Office / Group Tiffins">Office / Group Tiffins</option>
                  <option value="Feedback on an Order">Feedback on an Order</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold text-[#231B15] mb-1.5">
                Message
              </label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us how we can help..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FAF6EF] text-sm text-[#231B15] focus:outline-none focus:border-[#B84A2F]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-[#B84A2F] hover:bg-[#983921] disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
