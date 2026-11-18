import { Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import type { MenuItem } from '../types/index.ts';
import { DishImage } from './DishImage.tsx';

interface DishCardProps {
  dish: MenuItem;
  onReadStory?: (dish: MenuItem) => void;
}

export function DishCard({ dish, onReadStory }: DishCardProps) {
  const { getItemQuantity, addItem, updateQuantity } = useCart();
  const quantity = getItemQuantity(dish.id);
  const isVeg = dish.dietary === 'veg';

  return (
    <article className="group flex flex-col bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden bg-[#F3ECE0]">
        <DishImage
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex-1 flex flex-col p-5">
        {/* Unboxed metadata row with explicit text + semantic symbol (no pills) */}
        <div className="flex items-center justify-between gap-2 text-xs text-[#6A5D52] mb-2">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span
              className={`inline-flex items-center justify-center w-3.5 h-3.5 rounded-[3px] border ${
                isVeg ? 'border-[#2F6B46]' : 'border-[#B84A2F]'
              }`}
              aria-hidden="true"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isVeg ? 'bg-[#2F6B46]' : 'bg-[#B84A2F]'
                }`}
              />
            </span>
            <span>{isVeg ? 'Veg' : 'Non-Veg'}</span>
            <span aria-hidden="true">·</span>
            <span>{dish.mealType}</span>
          </span>
          {dish.isTodaySpecial && (
            <span className="font-semibold text-[#B84A2F]">Chef&apos;s Special</span>
          )}
        </div>

        <h3 className="font-serif text-lg font-semibold text-[#231B15] leading-snug mb-1.5">
          {dish.name}
        </h3>

        <p className="text-sm text-[#6A5D52] leading-relaxed line-clamp-2 mb-4">
          {dish.description}
        </p>

        <div className="mt-auto pt-3 border-t border-[#E6DDD0]/80 flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-base text-[#231B15] tabular-nums">
              ₹{dish.price}
            </p>
            {onReadStory ? (
              <button
                type="button"
                onClick={() => onReadStory(dish)}
                className="text-xs text-[#6A5D52] hover:text-[#B84A2F] underline underline-offset-2 cursor-pointer"
              >
                By {dish.cookName}
              </button>
            ) : (
              <p className="text-xs text-[#6A5D52]">By {dish.cookName}</p>
            )}
          </div>

          {quantity === 0 ? (
            <button
              type="button"
              onClick={() => addItem(dish, 1)}
              className="px-4 py-2 rounded-xl bg-[#B84A2F] hover:bg-[#983921] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#231B15]"
            >
              Add to Cart
            </button>
          ) : (
            <div className="inline-flex items-center gap-1 bg-[#F3ECE0] rounded-xl p-1 border border-[#E6DDD0]">
              <button
                type="button"
                onClick={() => updateQuantity(dish.id, quantity - 1)}
                aria-label={`Decrease quantity of ${dish.name}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FFFDF9] text-[#231B15] hover:bg-[#FAF6EF] transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center text-sm font-semibold text-[#231B15] tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(dish.id, quantity + 1)}
                aria-label={`Increase quantity of ${dish.name}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#B84A2F] text-white hover:bg-[#983921] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
