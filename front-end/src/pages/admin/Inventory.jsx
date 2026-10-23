import { useStore } from '../../context/StoreContext';

const API = 'http://localhost:5005';

export default function Inventory() {
  const { products } = useStore();

  const updateStock = async (id, newStock) => {
    try {
      const token = localStorage.getItem('authtoken');
      const res = await fetch(`${API}/product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ Stock: Number(newStock) }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update stock');
      }
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };

  const getImg = (product) => {
    if (Array.isArray(product.productphoto)) return product.productphoto[0]?.url;
    return product.productphoto;
  };

  return (
    <div>
      <h1 className="text-2xl font-medium mb-8 text-black">Inventory Management</h1>
      <div className="overflow-x-auto border-2 border-black rounded-lg bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 border-b-2 border-black">
            <tr>
              <th className="p-4 font-semibold text-black">Product</th>
              <th className="p-4 font-semibold text-black">Price</th>
              <th className="p-4 font-semibold text-black">Stock</th>
              <th className="p-4 font-semibold text-black">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const img = getImg(product);
              return (
                <tr key={product.id} className="border-b border-black/10 last:border-0">
                  <td className="p-4 flex items-center gap-3">
                    {img ? (
                      <img src={img} className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-black/10" />
                    )}
                    <span className="font-medium text-gray-800">{product.name}</span>
                  </td>
                  <td className="p-4 text-gray-700">${product.price}</td>
                  <td className="p-4">
                    <input
                      type="number"
                      defaultValue={product.Stock}
                      onBlur={(e) => updateStock(product.id, e.target.value)}
                      className="w-20 p-1 border-2 border-black rounded bg-white text-black focus:outline-none"
                    />
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded font-semibold ${
                      product.Stock > 0
                        ? 'bg-black/10 text-black'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.Stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}