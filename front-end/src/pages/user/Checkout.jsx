import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { addOrder } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    phone: '',
    address: '',
    notes: '',
  });

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (cart.length === 0 && step !== 3) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <h1 className="text-xl font-medium mb-3 text-black">Your cart is empty.</h1>
        <p className="text-gray-500 mb-6">Add products before proceeding to checkout.</p>
        <Link
          to="/products"
          className="inline-block bg-black text-white px-4 py-2 rounded font-medium text-sm hover:bg-white hover:text-black border-2 border-black transition"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in to place an order.");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        userid: user.id,
        address: formData.address,
        total: total,
        items: cart.map(item => ({
          productid: item.productid,
          quantity: item.quantity,
          unitPrice: item.product.price,
        }))
      };

      await addOrder(orderPayload);
      clearCart();
      setStep(3);
    } catch (err) {
      alert("Failed to place order: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 3) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-black bg-white text-black mb-4">
          <CheckCircle2 size={30} />
        </div>
        <h1 className="text-2xl font-medium mb-2 text-black">Order Confirmed</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your order has been recorded. Payment is in person upon receipt or pickup.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/orders"
            className="bg-black text-white border-2 border-black px-4 py-2 rounded text-sm font-medium hover:bg-white hover:text-black transition"
          >
            View your orders
          </Link>
          <Link
            to="/products"
            className="bg-white text-black border-2 border-black px-4 py-2 rounded text-sm font-medium hover:bg-black hover:text-white transition"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6"
      >
        <ArrowLeft size={16} /> Back to products
      </Link>

      <h1 className="text-2xl font-medium mb-6 text-black">Checkout (In-Person Payment)</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main flow */}
        <div className="md:col-span-2 space-y-6">
          {step === 1 && (
            <div className="border-2 border-black rounded-lg p-6 bg-white">
              <h2 className="font-medium text-lg mb-4 text-black">1. Review Items</h2>
              <div className="divide-y divide-black/10 mb-6">
                {cart.map((item) => (
                  <div key={item.productid} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{item.product.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity} × ${item.product.price}</p>
                    </div>
                    <span className="font-medium text-gray-800">
                      ${(item.quantity * item.product.price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full py-2 bg-black text-white font-medium rounded text-sm border-2 border-black hover:bg-white hover:text-black transition"
              >
                Proceed to delivery details
              </button>
            </div>
          )}

          {step === 2 && (
            <form
              onSubmit={handleConfirmOrder}
              className="border-2 border-black rounded-lg p-6 bg-white space-y-4"
            >
              <div className="flex justify-between items-center border-b border-black/10 pb-3">
                <h2 className="font-medium text-lg text-black">2. Delivery Details</h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-500 underline hover:text-black"
                >
                  Back to review
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstname"
                    required
                    value={formData.firstname}
                    onChange={handleInputChange}
                    className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastname"
                    required
                    value={formData.lastname}
                    onChange={handleInputChange}
                    className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="e.g. +1 555-0199"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-1">Delivery Address</label>
                <textarea
                  name="address"
                  required
                  rows="2"
                  placeholder="Street address, city, postal code"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none resize-none"
                />
              </div>

              <div className="p-3 bg-black/5 border border-black/10 rounded text-xs text-gray-700 space-y-1">
                <p className="font-semibold text-black">Payment method: In Person</p>
                <p>No card required online. Cash/card accepted at delivery/pickup.</p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-black text-white font-medium rounded text-sm border-2 border-black hover:bg-white hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
              </button>
            </form>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="border-2 border-black rounded-lg p-6 bg-white h-fit space-y-4">
          <h3 className="font-medium border-b border-black/10 pb-3 text-black">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between font-medium text-base pt-2 border-t border-black/10 text-black">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}