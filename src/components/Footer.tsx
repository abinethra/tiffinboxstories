import type { AppRoute } from '../types/index.ts';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-[#E6DDD0] bg-[#F3ECE0] text-[#231B15]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5 space-y-3">
          <p className="font-serif text-xl font-semibold text-[#231B15]">Tiffinbox Stories</p>
          <p className="text-sm text-[#6A5D52] leading-relaxed max-w-sm">
            Food that feels like home. Delivery-only Tamil Nadu and South Indian home kitchen
            serving stone-ground breakfast tiffins, midday Tamil Nadu Meals, and warm evening
            aappam &amp; kuruma.
          </p>
          <p className="text-xs text-[#6A5D52] pt-1">
            Daily Delivery Hours: 7:00 AM – 10:00 PM · Delivery Only
          </p>
        </div>

        <div className="md:col-span-4 space-y-2.5">
          <p className="text-xs font-semibold tracking-wide text-[#6A5D52] uppercase">Explore</p>
          <ul className="space-y-2 text-sm">
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/menu')}
                className="hover:text-[#B84A2F] transition-colors cursor-pointer"
              >
                Today&apos;s Menu
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/stories')}
                className="hover:text-[#B84A2F] transition-colors cursor-pointer"
              >
                Kitchen Stories
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/plans')}
                className="hover:text-[#B84A2F] transition-colors cursor-pointer"
              >
                Weekly &amp; Monthly Plans
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/about')}
                className="hover:text-[#B84A2F] transition-colors cursor-pointer"
              >
                Delivery Areas &amp; Contact
              </button>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3 space-y-2.5">
          <p className="text-xs font-semibold tracking-wide text-[#6A5D52] uppercase">Kitchen Desk</p>
          <ul className="space-y-2 text-sm text-[#6A5D52]">
            <li>
              <a
                href="https://wa.me/919845011223?text=Hello%20TiffinBox%20Stories!%20I%20would%20like%20to%20enquire%20about%20a%20tiffin%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#231B15] font-medium hover:text-[#B84A2F] transition-colors"
              >
                Order via WhatsApp
              </a>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/cart')}
                className="hover:text-[#B84A2F] transition-colors cursor-pointer"
              >
                Track Existing Order
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate('/admin')}
                className="hover:text-[#B84A2F] transition-colors cursor-pointer"
              >
                Kitchen Admin Portal
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E6DDD0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#6A5D52]">
          <span>&copy; {new Date().getFullYear()} Tiffinbox Stories. Cooked fresh at Panaiyur, ECR.</span>
          <span>Free delivery on orders ₹399 and above</span>
        </div>
      </div>
    </footer>
  );
}
