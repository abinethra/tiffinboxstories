import { Plus } from 'lucide-react';
import { DishImage } from '../components/DishImage.tsx';
import { useCart } from '../context/CartContext.tsx';
import type { AppRoute, MenuItem } from '../types/index.ts';

interface StoriesPageProps {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onNavigate: (route: AppRoute) => void;
}

export function StoriesPage({
  menuItems = [],
  loading,
  error,
  onRetry,
  onNavigate,
}: StoriesPageProps) {
  const { addItem, getItemQuantity } = useCart();
  const safeItems = Array.isArray(menuItems) ? menuItems : [];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 lg:py-14 space-y-10">
      {/* Page Intro */}
      <div className="space-y-3 pb-8 border-b border-[#E6DDD0] max-w-3xl">
        <p className="text-xs font-semibold tracking-wider uppercase text-[#B84A2F]">
          Kitchen Chronicles
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231B15] text-balance">
          Every tiffin carries the hand and hometown of its cook.
        </h1>
        <p className="text-base text-[#6A5D52] leading-relaxed">
          We never standardize away the quirks that make home cooking unforgettable. Read the
          origins, heirloom techniques, and memories behind every dish on our menu.
        </p>
      </div>

      {loading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-6 animate-pulse"
            >
              <div className="md:col-span-5 aspect-[4/3] bg-[#E6DDD0]/60 rounded-xl" />
              <div className="md:col-span-7 space-y-3 py-2">
                <div className="h-3 w-32 bg-[#E6DDD0] rounded" />
                <div className="h-6 w-2/3 bg-[#E6DDD0] rounded" />
                <div className="h-20 w-full bg-[#E6DDD0]/70 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-10 text-center space-y-3">
          <p className="text-sm text-[#B84A2F] font-medium">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-[#B84A2F] text-white text-sm font-semibold cursor-pointer"
          >
            Reload Stories
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {safeItems.map((dish, index) => {
            const qty = getItemQuantity(dish.id);
            const reverseOnDesktop = index % 2 === 1;
            const isVeg = dish.dietary === 'veg';

            return (
              <article
                key={dish.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-stretch bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-4 sm:p-6"
              >
                <div
                  className={`md:col-span-5 ${
                    reverseOnDesktop ? 'md:order-2' : 'md:order-1'
                  }`}
                >
                  <div className="aspect-[4/3] md:h-full rounded-xl overflow-hidden bg-[#F3ECE0]">
                    <DishImage
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div
                  className={`md:col-span-7 flex flex-col justify-between space-y-4 ${
                    reverseOnDesktop ? 'md:order-1' : 'md:order-2'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6A5D52]">
                      <span className="font-semibold text-[#B84A2F]">{dish.cookName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{dish.origin}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {isVeg ? 'Veg' : 'Non-Veg'} / {dish.mealType}
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl font-semibold text-[#231B15]">
                      {dish.name}
                    </h2>

                    <p className="text-sm sm:text-base text-[#231B15]/90 leading-relaxed">
                      {dish.story}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E6DDD0] flex flex-wrap items-center justify-between gap-4">
                    <span className="font-semibold text-base text-[#231B15] tabular-nums">
                      ₹{dish.price} <span className="text-xs font-normal text-[#6A5D52]">per tiffin</span>
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => addItem(dish, 1)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B84A2F] hover:bg-[#983921] text-white text-sm font-semibold transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>{qty > 0 ? `Add Another (${qty} in bag)` : 'Order This Dish'}</span>
                      </button>
                      {qty > 0 && (
                        <button
                          type="button"
                          onClick={() => onNavigate('/cart')}
                          className="text-xs font-semibold text-[#231B15] underline underline-offset-4 hover:text-[#B84A2F] cursor-pointer"
                        >
                          View Bag
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
