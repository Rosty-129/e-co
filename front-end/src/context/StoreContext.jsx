import { createContext, useState, useContext, useEffect } from 'react';

const StoreContext = createContext();
const API_URL = 'http://localhost:5005';

export const StoreProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_URL}/product`),
          fetch(`${API_URL}/category`)
        ]);

        if (prodRes.ok) setProducts(await prodRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch (err) {
        console.error("Failed to fetch store data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addOrder = async (orderData) => {
    const token = localStorage.getItem('authtoken');
    const res = await fetch(`${API_URL}/order`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }) // Passes token if your backend needs it
      },
      body: JSON.stringify(orderData)
    });
    
    const newOrder = await res.json();
    if (!res.ok) throw new Error(newOrder.message || 'Failed to place order');
    
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  };

  return (
    <StoreContext.Provider value={{ products, categories, orders, loading, addOrder }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);