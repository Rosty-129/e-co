import { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Package, ShoppingBag, DollarSign, AlertTriangle, Users, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const API = 'http://localhost:5005';

export default function Dashboard() {
  const { products } = useStore();
  const { user } = useAuth();

  const [stats, setStats] = useState({
    revenue: 0, pending: 0, completed: 0, customers: 0,
    totalProducts: 0, lowStock: 0, outOfStock: 0,
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    const token = localStorage.getItem('authtoken');
    const h = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API}/dashboard/revenue`, { headers: h }).then((r) => r.json()).catch(() => ({})),
      fetch(`${API}/dashboard/orders/pending`, { headers: h }).then((r) => r.json()).catch(() => ({})),
      fetch(`${API}/dashboard/orders/completed`, { headers: h }).then((r) => r.json()).catch(() => ({})),
      fetch(`${API}/dashboard/customers`, { headers: h }).then((r) => r.json()).catch(() => ({})),
      fetch(`${API}/dashboard/products`, { headers: h }).then((r) => r.json()).catch(() => ({})),
      fetch(`${API}/dashboard/products/low-stock`, { headers: h }).then((r) => r.json()).catch(() => ({})),
      fetch(`${API}/dashboard/products/out-of-stock`, { headers: h }).then((r) => r.json()).catch(() => ({})),
      fetch(`${API}/order/admin/all`, { headers: h }).then((r) => r.json()).catch(() => []),
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

  const cards = [
    { label: 'Total Revenue', value: `$${Number(stats.revenue).toFixed(2)}`, icon: DollarSign },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag },
    { label: 'Pending Orders', value: stats.pending, icon: AlertTriangle },
    { label: 'Completed Orders', value: stats.completed, icon: CheckCircle },
    { label: 'Total Products', value: stats.totalProducts, icon: Package },
    { label: 'Low Stock Products', value: stats.lowStock, icon: AlertTriangle },
    { label: 'Out of Stock Products', value: stats.outOfStock, icon: AlertTriangle },
    { label: 'Total Customers', value: stats.customers, icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-black">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? 'Loading...' : 'Real-time metrics from your database.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="p-4 border-2 border-black rounded-lg bg-white flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-black mb-1">{s.label}</p>
                <p className="text-2xl font-bold tracking-tight text-gray-800">{s.value}</p>
              </div>
              <div className="p-2 bg-black/5 rounded text-black">
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border-2 border-black rounded-lg p-5 bg-white">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-black/20">
            <h2 className="font-medium text-black">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs underline text-black">View all</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders recorded yet.</p>
          ) : (
            <div className="divide-y divide-black/10 text-sm">
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">Order #{o.id}</p>
                    <p className="text-xs text-gray-500">
                      {o.user?.email || 'Customer'} • {o.items?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">${o.total}</p>
                    <span className="text-[10px] uppercase font-semibold text-black">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-2 border-black rounded-lg p-5 bg-white">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-black/20">
            <h2 className="font-medium text-black">Stock Alerts</h2>
            <Link to="/admin/inventory" className="text-xs underline text-black">Manage inventory</Link>
          </div>
          {products.filter((p) => p.Stock <= 5).length === 0 ? (
            <p className="text-sm text-gray-500">All products have sufficient stock.</p>
          ) : (
            <div className="divide-y divide-black/10 text-sm">
              {products.filter((p) => p.Stock <= 5).map((p) => (
                <div key={p.id} className="py-2.5 flex justify-between items-center">
                  <span className="font-medium text-gray-800">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                    p.Stock === 0 ? 'bg-red-100 text-red-800' : 'bg-black/10 text-black'
                  }`}>
                    {p.Stock === 0 ? 'Out of stock' : `${p.Stock} remaining`}
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