import { useMemo, useState } from 'react';
import { FileImage, Search, X } from 'lucide-react';
import { DishCard } from '../components/DishCard.tsx';
import type { AppRoute, DietaryType, MealType, MenuItem } from '../types/index.ts';

interface MenuPageProps {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onNavigate: (route: AppRoute) => void;
}

const DIETARY_FILTERS: Array<{ label: string; value: 'all' | DietaryType }> = [
  { label: 'All Dishes', value: 'all' },
  { label: 'Pure Veg', value: 'veg' },
  { label: 'Non-Veg', value: 'non-veg' },
];

const MEAL_FILTERS: Array<{ label: string; value: 'all' | MealType }> = [
  { label: 'All Meals', value: 'all' },
  { label: 'Breakfast', value: 'Breakfast' },
  { label: 'Lunch', value: 'Lunch' },
  { label: 'Dinner', value: 'Dinner' },
];

export function MenuPage({ menuItems = [], loading, error, onRetry, onNavigate }: MenuPageProps) {
  const [dietaryFilter, setDietaryFilter] = useState<'all' | DietaryType>('all');
  const [mealFilter, setMealFilter] = useState<'all' | MealType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuCardOpen, setMenuCardOpen] = useState(false);

  const filteredDishes = useMemo(() => {
    const safeItems = Array.isArray(menuItems) ? menuItems : [];
    const query = searchQuery.trim().toLowerCase();
    return safeItems.filter((item) => {
      if (dietaryFilter !== 'all' && item.dietary !== dietaryFilter) return false;
      if (mealFilter !== 'all' && item.mealType !== mealFilter) return false;
      if (query) {
        const match =
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.cookName.toLowerCase().includes(query) ||
          item.origin.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [menuItems, dietaryFilter, mealFilter, searchQuery]);

  const resetFilters = () => {
    setDietaryFilter('all');
    setMealFilter('all');
    setSearchQuery('');
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E6DDD0]">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-semibold tracking-wider uppercase text-[#B84A2F]">
            Food That Feels Like Home
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231B15]">
            Today&apos;s Kitchen Menu
          </h1>
          <p className="text-sm sm:text-base text-[#6A5D52]">
            Freshly cooked Tamil Nadu breakfast, lunch, and dinner tiffins. Free delivery on
            orders ₹399 and above.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMenuCardOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FFFDF9] hover:bg-[#F3ECE0] text-xs font-semibold text-[#231B15] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileImage className="w-4 h-4 text-[#B84A2F]" aria-hidden="true" />
            <span>Printed Menu Card</span>
          </button>

          {/* Search Field */}
          <div className="relative w-full sm:w-64">
            <Search
              className="w-4 h-4 text-[#6A5D52] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search idly, dosa, meals..."
              aria-label="Search menu dishes"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#E6DDD0] bg-[#FFFDF9] text-sm text-[#231B15] placeholder:text-[#6A5D52]/70 focus:outline-none focus:border-[#B84A2F]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6A5D52] hover:text-[#231B15] p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Filter Bars */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Dietary Segmented Control */}
        <div
          role="group"
          aria-label="Dietary filter"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F3ECE0] border border-[#E6DDD0] self-start"
        >
          {DIETARY_FILTERS.map((opt) => {
            const active = dietaryFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDietaryFilter(opt.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#FFFDF9] text-[#231B15] shadow-xs'
                    : 'text-[#6A5D52] hover:text-[#231B15]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Meal Type Segmented Control */}
        <div
          role="group"
          aria-label="Meal time filter"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F3ECE0] border border-[#E6DDD0] self-start overflow-x-auto max-w-full"
        >
          {MEAL_FILTERS.map((opt) => {
            const active = mealFilter === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMealFilter(opt.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#B84A2F] text-white'
                    : 'text-[#6A5D52] hover:text-[#231B15]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
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
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-10 text-center space-y-3">
          <p className="text-sm text-[#B84A2F] font-medium">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-[#B84A2F] text-white text-sm font-semibold cursor-pointer"
          >
            Reload Menu
          </button>
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] p-10 text-center space-y-3">
          <h2 className="font-serif text-xl font-semibold text-[#231B15]">
            {dietaryFilter === 'non-veg'
              ? 'Today’s kitchen menu is 100% Pure Veg'
              : 'No dishes match these filters'}
          </h2>
          <p className="text-sm text-[#6A5D52]">
            {dietaryFilter === 'non-veg'
              ? 'All 23 tiffin dishes currently on our Breakfast, Lunch, and Dinner menu are home-style vegetarian specials.'
              : 'Try switching meal times or clearing your search query to see all home-style tiffins.'}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-[#F3ECE0] hover:bg-[#E6DDD0] text-[#231B15] text-sm font-semibold transition-colors cursor-pointer"
          >
            View All Dishes
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-[#6A5D52] tabular-nums">
            Showing {filteredDishes.length} {filteredDishes.length === 1 ? 'dish' : 'dishes'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onReadStory={() => onNavigate('/stories')}
              />
            ))}
          </div>
        </>
      )}

      {/* Printed Menu Card Modal */}
      {menuCardOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tiffinbox Stories Printed Menu Card"
          className="fixed inset-0 z-50 bg-[#231B15]/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#FFFDF9] rounded-2xl border border-[#E6DDD0] max-w-3xl w-full p-4 sm:p-6 space-y-4 relative shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl font-semibold text-[#231B15]">
                  Tiffinbox Stories — Complete Rate Card
                </h2>
                <p className="text-xs text-[#6A5D52]">Food that feels like home</p>
              </div>
              <button
                type="button"
                onClick={() => setMenuCardOpen(false)}
                aria-label="Close printed menu card"
                className="p-2 rounded-xl border border-[#E6DDD0] text-[#231B15] hover:bg-[#F3ECE0] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden border border-[#E6DDD0] bg-white">
              <img
                src="/assets/aistudio/image_33066836.png"
                alt="Tiffinbox Stories complete Breakfast, Lunch, and Dinner menu and rates"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
