import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQty } = useCart();

  if (!isCartOpen) return null;

  const total = cart.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity, 
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsCartOpen(false)} 
      />
      
      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-black p-6 flex flex-col justify-between border-l-2 border-black">
          <div>
            <div className="flex items-center justify-between pb-4 border-b-2 border-black">
              <h2 className="text-xl font-black uppercase tracking-tight">Your Cart</h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-center text-neutral-500 py-8 font-medium">Your cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.productid} className="flex items-center justify-between border-2 border-black p-3">
                    <div className="flex-1">
                      <h4 className="font-bold uppercase text-sm">{item.product?.name}</h4>
                      <p className="text-sm font-semibold">${item.product?.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => updateQty(item.productid, item.quantity - 1)}
                          className="p-1 border border-black hover:bg-black hover:text-white transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold px-2">{item.quantity}</span>
                        <button 
                          onClick={() => updateQty(item.productid, item.quantity + 1)}
                          className="p-1 border border-black hover:bg-black hover:text-white transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.productid)}
                      className="p-2 text-red-600 hover:bg-red-600 hover:text-white transition-colors ml-4"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="border-t-2 border-black pt-4">
              <div className="flex justify-between font-black text-lg mb-4">
                <span>TOTAL</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="block w-full text-center py-3 bg-black text-white font-bold uppercase tracking-wider hover:bg-white hover:text-black border-2 border-black transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}