import { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Users,
  CheckCircle,
  Download,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API = 'https://e-co-plao.vercel.app';

export default function Dashboard() {
  const { products } = useStore();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    revenue: 0,
    pending: 0,
    completed: 0,
    customers: 0,
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('authtoken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    Promise.all([
      fetch(`${API}/dashboard/revenue`, { headers })
        .then((r) => r.json())
        .catch(() => ({})),

      fetch(`${API}/dashboard/orders/pending`, { headers })
        .then((r) => r.json())
        .catch(() => ({})),

      fetch(`${API}/dashboard/orders/completed`, { headers })
        .then((r) => r.json())
        .catch(() => ({})),

      fetch(`${API}/dashboard/customers`, { headers })
        .then((r) => r.json())
        .catch(() => ({})),

      fetch(`${API}/dashboard/products`, { headers })
        .then((r) => r.json())
        .catch(() => ({})),

      fetch(`${API}/dashboard/products/low-stock`, { headers })
        .then((r) => r.json())
        .catch(() => ({})),

      fetch(`${API}/dashboard/products/out-of-stock`, { headers })
        .then((r) => r.json())
        .catch(() => ({})),

      fetch(`${API}/order/admin/all`, { headers })
        .then((r) => r.json())
        .catch(() => []),
    ])
      .then(([rev, pend, comp, cust, prod, low, out, ords]) => {
        setStats({
          revenue: rev.total || rev.revenue || 0,
          pending: pend.count || 0,
          completed: comp.count || 0,
          customers: cust.count || 0,
          totalProducts: prod.count || 0,
          lowStock: low.count || 0,
          outOfStock: out.count || 0,
        });

        setOrders(Array.isArray(ords) ? ords : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Export dashboard data as an Excel file
  const handleExport = async () => {
    try {
      setExporting(true);

      const token = localStorage.getItem('authtoken');

      const response = await fetch(`${API}/dashboard/export`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export dashboard data.');
      }

      // Convert the response into a downloadable Excel file
      const blob = await response.blob();

      // Create a temporary download URL
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and click it
      const link = document.createElement('a');
      link.href = url;
      link.download = `e-co-dashboard-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Could not export dashboard. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const cards = [
    {
      label: 'Total Revenue',
      value: `$${Number(stats.revenue).toFixed(2)}`,
      icon: DollarSign,
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingBag,
    },
    {
      label: 'Pending Orders',
      value: stats.pending,
      icon: AlertTriangle,
    },
    {
      label: 'Completed Orders',
      value: stats.completed,
      icon: CheckCircle,
    },
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
    },
    {
      label: 'Low Stock Products',
      value: stats.lowStock,
      icon: AlertTriangle,
    },
    {
      label: 'Out of Stock Products',
      value: stats.outOfStock,
      icon: AlertTriangle,
    },
    {
      label: 'Total Customers',
      value: stats.customers,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard heading and export button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-black">
            Dashboard Overview
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? 'Loading...'
              : 'Real-time metrics from your database.'}
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || loading || user?.role !== 'ADMIN'}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {exporting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}

          {exporting ? 'Exporting...' : 'Export to Excel'}
        </button>
      </div>

      {/* Dashboard statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((s, i) => {
          const Icon = s.icon;

          return (
            <div
              key={i}
              className="p-4 border-2 border-black rounded-lg bg-white flex justify-between items-start"
            >
              <div>
                <p className="text-xs font-semibold text-black mb-1">
                  {s.label}
                </p>

                <p className="text-2xl font-bold tracking-tight text-gray-800">
                  {s.value}
                </p>
              </div>

              <div className="p-2 bg-black/5 rounded text-black">
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent orders and stock alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent orders */}
        <div className="border-2 border-black rounded-lg p-5 bg-white">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-black/20">
            <h2 className="font-medium text-black">Recent Orders</h2>

            <Link
              to="/admin/orders"
              className="text-xs underline text-black"
            >
              View all
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">
              No orders recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-black/10 text-sm">
              {orders.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="py-2.5 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      Order #{o.id}
                    </p>

                    <p className="text-xs text-gray-500">
                      {o.user?.email || 'Customer'} •{' '}
                      {o.items?.length || 0} items
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-gray-800">
                      ${o.total}
                    </p>

                    <span className="text-[10px] uppercase font-semibold text-black">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock alerts */}
        <div className="border-2 border-black rounded-lg p-5 bg-white">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-black/20">
            <h2 className="font-medium text-black">Stock Alerts</h2>

            <Link
              to="/admin/inventory"
              className="text-xs underline text-black"
            >
              Manage inventory
            </Link>
          </div>

          {products.filter((p) => p.Stock <= 5).length === 0 ? (
            <p className="text-sm text-gray-500">
              All products have sufficient stock.
            </p>
          ) : (
            <div className="divide-y divide-black/10 text-sm">
              {products
                .filter((p) => p.Stock <= 5)
                .map((p) => (
                  <div
                    key={p.id}
                    className="py-2.5 flex justify-between items-center"
                  >
                    <span className="font-medium text-gray-800">
                      {p.name}
                    </span>

                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        p.Stock === 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-black/10 text-black'
                      }`}
                    >
                      {p.Stock === 0
                        ? 'Out of stock'
                        : `${p.Stock} remaining`}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}