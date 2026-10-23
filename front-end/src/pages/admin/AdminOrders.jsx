import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5005';

export default function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authtoken');
      const res = await fetch(`${API}/order/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load orders');
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const setStatus = async (id, action) => {
    try {
      const token = localStorage.getItem('authtoken');
      const path =
        action === 'COMPLETED'
          ? `${API}/order/${id}/complete`
          : `${API}/order/${id}/disapprove`;

      const res = await fetch(path, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Update failed');
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: action } : o))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-medium mb-6 text-black">Manage Orders</h1>

      {loading && <p className="text-sm text-gray-500">Loading orders...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-sm text-gray-500">No orders placed yet.</p>
      )}

      {!loading && orders.length > 0 && (
        <div className="overflow-x-auto border-2 border-black rounded-lg bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/5 border-b-2 border-black">
              <tr>
                <th className="p-4 font-semibold text-black">Order ID</th>
                <th className="p-4 font-semibold text-black">Customer</th>
                <th className="p-4 font-semibold text-black">Items</th>
                <th className="p-4 font-semibold text-black">Total</th>
                <th className="p-4 font-semibold text-black">Status</th>
                <th className="p-4 font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-black/10 last:border-0">
                  <td className="p-4 font-medium text-black">#{o.id}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800">
                      {o.user ? `${o.user.firstname} ${o.user.lastname}` : 'Customer'}
                    </div>
                    <div className="text-xs text-gray-500">{o.user?.email}</div>
                  </td>
                  <td className="p-4 text-gray-700">{o.items?.length || 0} item(s)</td>
                  <td className="p-4 font-medium text-gray-800">${o.total}</td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 rounded font-semibold bg-black/10 text-black">
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => setStatus(o.id, 'COMPLETED')}
                      disabled={o.status === 'COMPLETED'}
                      className="text-xs px-3 py-1 rounded border-2 border-black text-black font-medium hover:bg-black hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => setStatus(o.id, 'DISAPPROVED')}
                      disabled={o.status === 'DISAPPROVED'}
                      className="text-xs px-3 py-1 rounded border-2 border-red-700 text-red-700 font-medium hover:bg-red-700 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Disapprove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}