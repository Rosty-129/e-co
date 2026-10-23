import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Package } from 'lucide-react';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('authtoken');

    fetch('http://localhost:5005/order', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load orders');
        setOrders(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <h1 className="text-xl font-medium mb-3">Sign in to see your orders</h1>
        <Link to="/login" className="inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded font-medium text-sm">
          Sign in
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto py-16 text-center text-gray-500">Loading orders...</div>;
  }

  if (error) {
    return <div className="max-w-3xl mx-auto py-16 text-center text-red-500">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <Package size={40} className="mx-auto mb-4 text-gray-300" />
        <h1 className="text-xl font-medium mb-3">No orders yet</h1>
        <p className="text-gray-500 mb-6">You haven't placed any orders.</p>
        <Link to="/products" className="inline-block bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded font-medium text-sm">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-medium mb-6">Your Orders</h1>
      {orders.map((order) => (
        <div key={order.id} className="border border-gray-200 dark:border-gray-800 rounded p-4 bg-white dark:bg-gray-900">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3 mb-3">
            <div>
              <p className="font-medium">Order #{order.id}</p>
              <p className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">${order.total}</p>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                {order.status}
              </span>
            </div>
          </div>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {(order.items || []).map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.product?.name || `Product #${item.productid}`} × {item.quantity}
                </span>
                <span>${item.unitPrice * item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}