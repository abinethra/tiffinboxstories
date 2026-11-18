import { ArrowRight, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { DishCard } from '../components/DishCard.tsx';
import { DishImage } from '../components/DishImage.tsx';
import { CUSTOMER_REVIEWS } from '../data/subscriptions.ts';
import type { AppRoute, MenuItem } from '../types/index.ts';

interface HomePageProps {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onNavigate: (route: AppRoute) => void;
}

const HERO_IMAGE_URL = '/src/assets/images/hero_tiffin_spread_1794992173990.jpg';

const HOW_IT_WORKS_STEPS = [
  {
    number: '01.',
    title: 'Choose Your Tiffin',
    detail:
      'Browse breakfast, lunch, and dinner boxes cooked fresh each day—filter by vegetarian or non-veg regional recipes.',
  },
  {
    number: '02.',
    title: 'Place Your Order',
    detail:
      'Select your delivery slot and add kitchen notes for spice or oil preferences. No app download or hidden packaging fees.',
  },
  {
    number: '03.',
    title: 'Delivered Warm',
    detail:
      'Dispatched from our Panaiyur, ECR kitchen in leak-proof thermal boxes and delivered within 20–40 minutes along ECR and OMR.',
  },
];

export function HomePage({ menuItems = [], loading, error, onRetry, onNavigate }: HomePageProps) {
  const safeItems = Array.isArray(menuItems) ? menuItems : [];
  const specials = safeItems.filter((item) => item.isTodaySpecial).slice(0, 3);
  const displayedSpecials = specials.length > 0 ? specials : safeItems.slice(0, 3);

  return (
    <div>
      {/* 1. Hero Section — Split Editorial Layout */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-14 lg:pt-12 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 py-2">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#B84A2F]">
              Tiffinbox Stories · Panaiyur, ECR
            </p>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.35rem] font-semibold text-[#231B15] leading-[1.1] tracking-tight text-balance">
              Food that feels like home, packed warm in every tiffin.
            </h1>

            <p className="text-base sm:text-lg text-[#6A5D52] leading-relaxed max-w-xl">
              From ₹50 morning Idly and Pongal to full ₹250 Tamil Nadu Meals and evening Aappam
              with Kuruma—stone-ground batters and heirloom family recipes delivered fresh.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('/menu')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#B84A2F] hover:bg-[#983921] text-white text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#231B15]"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/stories')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-[#E6DDD0] bg-[#FFFDF9] hover:bg-[#F3ECE0] text-[#231B15] text-sm font-semibold transition-colors cursor-pointer"
              >
                Read Dish Stories
              </button>
            </div>

            {/* Clean unboxed trust notes */}
            <div className="pt-4 border-t border-[#E6DDD0] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#6A5D52]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#D48B17]" aria-hidden="true" />
                7:00 AM – 10:00 PM Daily
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2F6B46]" aria-hidden="true" />
                Zero Preservatives or Soda
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B84A2F]" aria-hidden="true" />
                Free Delivery Above ₹399
              </span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] sm:min-h-[380px] rounded-2xl overflow-hidden border border-[#E6DDD0] bg-[#F3ECE0]">
              <DishImage
                src={HERO_IMAGE_URL}
                alt="Traditional steel tiffin carrier beside banana leaf with idlis, ghee dosa, chutneys, sambar, and brass filter coffee"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Today's Special Section */}
      <section className="border-t border-[#E6DDD0] bg-[#F3ECE0]/60 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#B84A2F]">
                Fresh Off Today&apos;s Tawa
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231B15] text-balance">
                Today&apos;s Kitchen Specials
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/menu')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B84A2F] hover:text-[#983921] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>View Full Menu</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-[#E6DDD0]/60" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-24 bg-[#E6DDD0] rounded" />
                    <div className="h-5 w-3/4 bg-[#E6DDD0] rounded" />
                    <div className="h-4 w-full bg-[#E6DDD0]/70 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-8 text-center space-y-3">
              <p className="text-sm text-[#B84A2F] font-medium">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 rounded-xl bg-[#B84A2F] text-white text-sm font-semibold cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSpecials.map((dish) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onReadStory={() => onNavigate('/stories')}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 lg:py-20">
        <div className="max-w-2xl mb-10 space-y-2">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#B84A2F]">
            From Our Stove To Your Table
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231B15] text-balance">
            How TiffinBox Stories Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-6 space-y-3"
            >
              <p className="font-serif text-2xl font-semibold text-[#D48B17] tabular-nums">
                {step.number}
              </p>
              <h3 className="font-serif text-xl font-semibold text-[#231B15]">{step.title}</h3>
              <p className="text-sm text-[#6A5D52] leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Customer Reviews Section */}
      <section className="border-t border-[#E6DDD0] bg-[#F3ECE0]/50 py-14 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#B84A2F]">
                Neighbour Notes
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231B15] text-balance">
                Loved Around Panaiyur &amp; ECR
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/plans')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B84A2F] hover:text-[#983921] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Explore Weekly &amp; Monthly Plans</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {CUSTOMER_REVIEWS.map((review) => (
              <blockquote
                key={review.id}
                className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-6 flex flex-col justify-between gap-5"
              >
                <p className="text-sm text-[#231B15] leading-relaxed">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <footer className="pt-4 border-t border-[#E6DDD0] space-y-0.5">
                  <p className="font-serif text-base font-semibold text-[#231B15]">
                    {review.name}
                  </p>
                  <p className="text-xs text-[#6A5D52]">{review.neighborhood}</p>
                  <p className="text-xs text-[#B84A2F] font-medium pt-0.5">
                    Ordered: {review.dish}
                  </p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
