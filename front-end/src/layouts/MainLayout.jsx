import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import CartDrawer from '../components/CartDrawer';
import { useState, useRef, useLayoutEffect, useEffect } from 'react';

const css = `
@keyframes nav-settle {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  [data-nav] { animation: none !important; }
}
`;

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0, visible: false });
  const [animatePill, setAnimatePill] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/products', label: 'Products' },
    ...(user ? [{ to: '/orders', label: 'Orders' }] : []),
    ...(user?.role === 'ADMIN' ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const isActive = (l) => (l.end ? pathname === l.to : pathname.startsWith(l.to));

  // Move the sliding pill under the active link
  useLayoutEffect(() => {
    const update = () => {
      const el = navRef.current?.querySelector('[data-active="true"]');
      if (!el) return setPill((p) => ({ ...p, visible: false }));
      setPill({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [pathname, user]);

  // Skip the transition on first paint so the pill doesn't fly in from the corner
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimatePill(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-800 font-sans antialiased">
      <style>{css}</style>

      <header
        data-nav
        style={{ animation: 'nav-settle 1.2s cubic-bezier(0.22, 0.7, 0.2, 1) 0.1s both' }}
        className="sticky top-0 z-40 bg-neutral-50/80 backdrop-blur-md border-b border-neutral-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden grid place-items-center h-10 w-10 rounded-full hover:bg-neutral-200/70 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link to="/" className="text-xl font-semibold tracking-tight text-neutral-900">
              Store<span className="text-neutral-400">.</span>
            </Link>
          </div>

          <nav
            ref={navRef}
            className="relative hidden md:flex items-center rounded-full bg-neutral-100 border border-neutral-200 p-1"
          >
            <span
              aria-hidden
              className={`absolute top-1 bottom-1 rounded-full bg-neutral-800 ${
                animatePill
                  ? 'transition-[left,width,opacity] duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)]'
                  : ''
              } ${pill.visible ? 'opacity-100' : 'opacity-0'}`}
              style={{ left: pill.left, width: pill.width }}
            />
            {links.map((l) => {
              const active = isActive(l);
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  data-active={active}
                  className={`relative z-10 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-500 ${
                    active ? 'text-white' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative grid place-items-center h-10 w-10 rounded-full hover:bg-neutral-200/70 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart size={21} />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="absolute -top-0.5 -right-0.5 bg-neutral-800 text-white text-[11px] min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full font-semibold ring-2 ring-neutral-50"
                >
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2 pl-2">
                <span className="hidden sm:block text-sm font-medium text-neutral-600">
                  {user.firstname}
                </span>
                <button
                  onClick={logout}
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:border-neutral-800 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 transition-colors"
              >
                <User size={16} />
                Log in
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden grid transition-all duration-500 ease-out ${
            mobileMenuOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <nav className="overflow-hidden px-4 sm:px-6">
            <div className="py-3 space-y-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`block rounded-xl px-4 py-3 text-base font-medium transition-colors ${
                    isActive(l)
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-700 hover:bg-neutral-200/70'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Outlet />
      </main>

      <footer className="border-t border-neutral-200 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-lg font-semibold tracking-tight text-neutral-900">
            Store<span className="text-neutral-400">.</span>
          </p>
          <div className="flex gap-6 text-sm text-neutral-500">
            <Link to="/products" className="hover:text-neutral-900 transition-colors">
              Products
            </Link>
            <Link to="/#contact" className="hover:text-neutral-900 transition-colors">
              Contact
            </Link>
          </div>
          <p className="text-sm text-neutral-400">© {new Date().getFullYear()} Store</p>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}