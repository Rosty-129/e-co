import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

const API = 'http://localhost:5005';

export default function ProductNew() {
  const { categories } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryid: '',
    price: '',
    Stock: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-select first category once loaded
  useEffect(() => {
    if (categories.length > 0 && !formData.categoryid) {
      setFormData((f) => ({ ...f, categoryid: categories[0].id }));
    }
  }, [categories]);

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    if (val === '__new__') {
      navigate('/admin/categories/new');
      return;
    }
    setFormData({ ...formData, categoryid: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.name ||
      !formData.categoryid ||
      Number(formData.price) <= 0 ||
      Number(formData.Stock) < 0
    ) {
      setError('Please provide valid name, category, positive price, and stock count.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authtoken');
      const res = await fetch(`${API}/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          categoryid: Number(formData.categoryid),
          price: Number(formData.price),
          Stock: Number(formData.Stock),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create product');
      navigate('/admin/inventory');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto border-2 border-black rounded-lg p-6 bg-white">
      <h1 className="text-xl font-medium mb-6 text-black">Create New Product</h1>

      {error && <p className="p-3 bg-red-50 text-red-700 text-xs rounded mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-black mb-1">Product Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1">Category</label>
          <select
            value={formData.categoryid}
            onChange={handleCategoryChange}
            className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
          >
            {categories.length === 0 && (
              <option value="" disabled>
                No categories yet — create one below
              </option>
            )}
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="__new__" className="font-semibold">
              ➕ Create new category…
            </option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Need a category that doesn't exist yet? Pick "Create new category…" above.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Price ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Stock</label>
            <input
              type="number"
              required
              value={formData.Stock}
              onChange={(e) => setFormData({ ...formData, Stock: e.target.value })}
              className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1">Description</label>
          <textarea
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-black text-white font-medium rounded border-2 border-black hover:bg-white hover:text-black transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
}