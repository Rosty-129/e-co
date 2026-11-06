import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const StoreContext = createContext();
const API_URL = 'https://e-co-plao.vercel.app';

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Reusable fetchers (exposed to consumers) ──────────────
  const fetchCategories = useCallback(async () => {
    const res = await fetch(`${API_URL}/category`);
    if (!res.ok) throw new Error('Failed to load categories');
    const data = await res.json();
    setCategories(data);
    return data;
  }, []);

  const fetchProducts = useCallback(async () => {
    const res = await fetch(`${API_URL}/product`);
    if (!res.ok) throw new Error('Failed to load products');
    const data = await res.json();
    setProducts(data);
    return data;
  }, []);

  // ── Initial load ──────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (err) {
        console.error('Failed to fetch store data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchProducts, fetchCategories]);

  // ── Orders ────────────────────────────────────────────────
  const addOrder = async (orderData) => {
    const token = localStorage.getItem('authtoken');
    const res = await fetch(`${API_URL}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(orderData),
    });

    const newOrder = await res.json();
    if (!res.ok) throw new Error(newOrder.message || 'Failed to place order');

    setOrders((prev) => [...prev, newOrder]);
    return newOrder;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        loading,
        addOrder,
        fetchCategories,   // ← new
        fetchProducts,     // ← new
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);