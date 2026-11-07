import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

const API = 'https://e-co-plao.vercel.app';

export default function ProductNew() {
  const { categories, fetchProducts, fetchCategories } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryid: '',
    price: '',
    Stock: '',
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories().catch(console.error);
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0 && !formData.categoryid) {
      setFormData((f) => ({
        ...f,
        categoryid: String(categories[0].id),
      }));
    }
  }, [categories, formData.categoryid]);

  // Generate previews for selected images.
  useEffect(() => {
    const urls = selectedImages.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

  const handleCategoryChange = (e) => {
    const val = e.target.value;

    if (val === '__new__') {
      navigate('/admin/categories/new');
      return;
    }

    setFormData({
      ...formData,
      categoryid: val,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 5) {
      setError('You can upload a maximum of 5 images.');
      e.target.value = '';
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and WebP images are allowed.');
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be smaller than 5 MB.');
        e.target.value = '';
        return;
      }
    }

    setError('');
    setSelectedImages(files);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (
      !formData.name.trim() ||
      !formData.categoryid ||
      Number(formData.price) < 0 ||
      !Number.isInteger(Number(formData.price)) ||
      Number(formData.Stock) < 0 ||
      !Number.isInteger(Number(formData.Stock))
    ) {
      setError(
        'Please provide a valid name, category, whole-number price, and stock count.'
      );
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('authtoken');

      const payload = new FormData();

      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('categoryid', formData.categoryid);
      payload.append('price', formData.price);
      payload.append('Stock', formData.Stock);

      selectedImages.forEach((image) => {
        payload.append('images', image);
      });

      const res = await fetch(`${API}/product`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      await fetchProducts();

      navigate('/admin/inventory');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto border-2 border-black rounded-lg p-6 bg-white">
      <h1 className="text-xl font-medium mb-6 text-black">
        Create New Product
      </h1>

      {error && (
        <p className="p-3 bg-red-50 text-red-700 text-xs rounded mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-black mb-1">
            Product Name
          </label>

          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1">
            Category
          </label>

          <select
            required
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
              Create new category…
            </option>
          </select>

          <p className="mt-1 text-xs text-gray-500">
            Need a category that doesn't exist yet? Pick "Create new category…" above.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Price ($)
            </label>

            <input
              type="number"
              step="1"
              min="0"
              required
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: e.target.value,
                })
              }
              className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Stock
            </label>

            <input
              type="number"
              min="0"
              step="1"
              required
              value={formData.Stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  Stock: e.target.value,
                })
              }
              className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-black mb-1">
            Description
          </label>

          <textarea
            rows="3"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none resize-none"
          />
        </div>

        {/* Product images */}
        <div>
          <label className="block text-xs font-semibold text-black mb-1">
            Product Images (maximum 5)
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800"
          />

          <p className="mt-1 text-xs text-gray-500">
            JPEG, PNG, or WebP. Maximum 5 MB per image.
          </p>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {previews.map((preview, index) => (
                <div key={preview} className="relative">
                  <img
                    src={preview}
                    alt={`Product preview ${index + 1}`}
                    className="w-full aspect-square object-cover rounded border"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black text-white rounded-full w-6 h-6 text-sm"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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