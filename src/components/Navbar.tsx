import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import type { AppRoute } from '../types/index.ts';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const NAV_LINKS: Array<{ label: string; route: AppRoute }> = [
  { label: 'Home', route: '/' },
  { label: 'Menu', route: '/menu' },
  { label: 'Our Stories', route: '/stories' },
  { label: 'Plans', route: '/plans' },
  { label: 'About', route: '/about' },
];

export function Navbar({ currentRoute, onNavigate }: NavbarProps) {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (route: AppRoute) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6EF]/95 backdrop-blur-sm border-b border-[#E6DDD0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('/')}
          className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#231B15] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B84A2F] cursor-pointer"
        >
          Tiffinbox Stories
        </button>

        {/* Zone 2: 5 concise single-line text links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6A5D52]"
        >
          {NAV_LINKS.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                type="button"
                onClick={() => handleNavClick(link.route)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B84A2F] ${
                  isActive
                    ? 'text-[#231B15] font-semibold underline decoration-[#B84A2F] decoration-2 underline-offset-6'
                    : 'hover:text-[#231B15]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('/cart')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B84A2F] hover:bg-[#983921] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#231B15]"
          >
            <ShoppingBag className="w-4 h-4" aria-hidden="true" />
            <span className="tabular-nums">
              {totalItems > 0 ? `Tiffin Bag (${totalItems})` : 'Tiffin Bag'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#E6DDD0] bg-[#FFFDF9] text-[#231B15] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E6DDD0] bg-[#FAF6EF] px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                type="button"
                onClick={() => handleNavClick(link.route)}
                className={`block w-full text-left px-3 py-2.5 rounded-xl text-base font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#F3ECE0] text-[#B84A2F] font-semibold'
                    : 'text-[#231B15] hover:bg-[#F3ECE0]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleNavClick('/admin')}
            className="block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-[#6A5D52] hover:bg-[#F3ECE0] cursor-pointer"
          >
            Kitchen Admin
          </button>
        </div>
      )}
    </header>
  );
}
