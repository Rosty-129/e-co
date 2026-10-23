import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  PlusSquare,
  FolderPlus,
  ShoppingBag,
  User,
  LogOut,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Inventory', path: '/admin/inventory', icon: Package },
    { label: 'Add product', path: '/admin/products/new', icon: PlusSquare },
    { label: 'Add category', path: '/admin/categories/new', icon: FolderPlus },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Profile', path: '/admin/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-neutral-50 text-neutral-800 font-sans antialiased">
      {/* Mobile overlay */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="px-5 h-16 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <span className="block text-xl font-semibold tracking-tight text-neutral-900">
              Store<span className="text-neutral-400">.</span>
            </span>
            <span className="block text-xs text-neutral-500 -mt-0.5">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="md:hidden grid place-items-center h-9 w-9 rounded-full hover:bg-neutral-200/70 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-300 ${
                  isActive
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900'
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-neutral-200 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft size={18} strokeWidth={1.8} />
            Back to store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.8} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-30 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="md:hidden grid place-items-center h-10 w-10 rounded-full hover:bg-neutral-200/70 transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm text-neutral-500">
              Signed in as{' '}
              <span className="font-medium text-neutral-900">{user?.firstname || 'Admin'}</span>
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}