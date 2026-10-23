import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart')) || []);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productid === product.id);
      if (existing) {
        return prev.map(item => item.productid === product.id
          ? { ...item, quantity: Math.min(item.quantity + quantity, product.Stock) }
          : item);
      }
      return [...prev, { productid: product.id, product, quantity }];
    });
    // The cart no longer pops open on every add, so the "Added" feedback on the
    // product buttons stays visible. Put setIsCartOpen(true) back here if you prefer the old behavior.
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.productid !== id));
  const updateQty = (id, qty) =>
    setCart(prev => prev.map(item =>
      item.productid === id
        ? { ...item, quantity: Math.max(1, Math.min(qty, item.product.Stock)) }
        : item));
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);