import { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { Footer } from './components/Footer.tsx';
import { Navbar } from './components/Navbar.tsx';
import { CartProvider, useCart } from './context/CartContext.tsx';
import { fetchMenu } from './lib/api.ts';
import { AboutContactPage } from './pages/AboutContactPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { CartCheckoutPage } from './pages/CartCheckoutPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { MenuPage } from './pages/MenuPage.tsx';
import { PlansPage } from './pages/PlansPage.tsx';
import { StoriesPage } from './pages/StoriesPage.tsx';
import type { AppRoute, MenuItem } from './types/index.ts';

const VALID_ROUTES: AppRoute[] = ['/', '/menu', '/stories', '/plans', '/about', '/cart', '/admin'];

const ROUTE_META: Record<AppRoute, { title: string; description: string }> = {
  '/': {
    title: 'Tiffinbox Stories — Food That Feels Like Home',
    description:
      'Food that feels like home. Tamil Nadu breakfast, midday Meals, and dinner tiffins delivered warm.',
  },
  '/menu': {
    title: 'Menu — Tiffinbox Stories',
    description:
      'Explore Breakfast, Lunch (Tamil Nadu Meals & Rice Bowls), and Dinner tiffins starting at ₹50.',
  },
  '/stories': {
    title: 'Our Stories — Tiffinbox Stories',
    description:
      'Meet the regional home cooks behind Tiffinbox Stories and read the origin of every dish.',
  },
  '/plans': {
    title: 'Subscription Plans — Tiffinbox Stories',
    description:
      'Flexible weekly and monthly Tamil Nadu tiffin delivery plans with zero delivery fees.',
  },
  '/about': {
    title: 'About & Contact — Tiffinbox Stories',
    description:
      'View our delivery areas, WhatsApp desk, and contact our home kitchen team.',
  },
  '/cart': {
    title: 'Tiffin Bag & Checkout — Tiffinbox Stories',
    description: 'Review your tiffin order, enter delivery details, or track an existing order.',
  },
  '/admin': {
    title: 'Kitchen Admin — Tiffinbox Stories',
    description: 'Kitchen operations portal for menu and order management.',
  },
};

function parseRoute(pathname: string): AppRoute {
  if (VALID_ROUTES.includes(pathname as AppRoute)) {
    return pathname as AppRoute;
  }
  return '/';
}

function AppShell() {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.pathname));
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);

  const { lastAddedName } = useCart();

  const loadMenu = useCallback(async () => {
    setLoadingMenu(true);
    setMenuError(null);
    try {
      const items = await fetchMenu();
      setMenuItems(Array.isArray(items) ? items : []);
    } catch (err) {
      setMenuItems([]);
      setMenuError(err instanceof Error ? err.message : 'Unable to load menu right now.');
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const meta = ROUTE_META[route];
    document.title = meta.title;
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      descEl.setAttribute('content', meta.description);
    }
  }, [route]);

  const navigate = (nextRoute: AppRoute) => {
    if (nextRoute !== route) {
      window.history.pushState({}, '', nextRoute);
      setRoute(nextRoute);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EF] text-[#231B15]">
      <Navbar currentRoute={route} onNavigate={navigate} />

      <main className="flex-1">
        {route === '/' && (
          <HomePage
            menuItems={menuItems}
            loading={loadingMenu}
            error={menuError}
            onRetry={loadMenu}
            onNavigate={navigate}
          />
        )}
        {route === '/menu' && (
          <MenuPage
            menuItems={menuItems}
            loading={loadingMenu}
            error={menuError}
            onRetry={loadMenu}
            onNavigate={navigate}
          />
        )}
        {route === '/stories' && (
          <StoriesPage
            menuItems={menuItems}
            loading={loadingMenu}
            error={menuError}
            onRetry={loadMenu}
            onNavigate={navigate}
          />
        )}
        {route === '/plans' && <PlansPage />}
        {route === '/about' && <AboutContactPage />}
        {route === '/cart' && <CartCheckoutPage onNavigate={navigate} />}
        {route === '/admin' && <AdminPage onMenuChanged={loadMenu} />}
      </main>

      <Footer onNavigate={navigate} />

      {/* Subtle Add-to-Bag confirmation toast */}
      {lastAddedName && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#231B15] text-white text-sm shadow-lg border border-[#3A2E25]"
        >
          <Check className="w-4 h-4 text-[#D48B17] shrink-0" aria-hidden="true" />
          <span className="truncate max-w-[220px]">Added {lastAddedName}</span>
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="text-xs font-semibold text-[#F6E6C4] underline underline-offset-4 hover:text-white cursor-pointer whitespace-nowrap"
          >
            View Bag
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppShell />
    </CartProvider>
  );
}
