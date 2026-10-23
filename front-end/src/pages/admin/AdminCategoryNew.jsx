import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5005';

export default function AdminCategoryNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim()) {
      return setError('Category name is required.');
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authtoken');
      const res = await fetch(`${API}/category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create category');

      setSuccess(`Category "${data.category.name}" created!`);
      setForm({ name: '', description: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto border-2 border-black rounded-lg p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-medium text-black">Create New Category</h1>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="text-xs underline text-black hover:opacity-70"
        >
          ← Back to product form
        </button>
      </div>

      {error && (
        <p className="p-3 bg-red-50 border border-red-300 text-red-700 text-sm rounded mb-4">
          {error}
        </p>
      )}
      {success && (
        <p className="p-3 bg-green-50 border border-green-300 text-green-700 text-sm rounded mb-4">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-black mb-1">
            Category Name
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Electronics"
            className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1">
            Description <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What belongs in this category?"
            className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 bg-black text-white font-medium rounded border-2 border-black hover:bg-white hover:text-black transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Category'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products/new')}
            className="px-4 py-2 bg-white text-black font-medium rounded border-2 border-black hover:bg-black hover:text-white transition"
          >
            Done
          </button>
        </div>
      </form>
    </div>
  );
}