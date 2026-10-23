import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { Search, Plus, Check } from 'lucide-react';

export default function Products() {
  const { products, categories } = useStore();
  const { addToCart } = useCart();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [added, setAdded] = useState(null);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'All' || p.categoryid === Number(selectedCat);
    return matchesSearch && matchesCat;
  });

  const handleAdd = (product) => {
    addToCart(product);
    setAdded(product.id);
    setTimeout(() => setAdded((cur) => (cur === product.id ? null : cur)), 1400);
  };

  const chip = (active) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
      active
        ? 'bg-neutral-800 text-white'
        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-400'
    }`;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900">
            Products
          </h1>
          <p className="mt-2 text-neutral-500">
            {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            {selectedCat !== 'All' || search ? ' match your filters' : ' available'}
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-neutral-300 bg-white pl-11 pr-4 py-3 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-800 focus:ring-4 focus:ring-neutral-200 transition"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button onClick={() => setSelectedCat('All')} className={chip(selectedCat === 'All')}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(String(c.id))}
            className={chip(selectedCat === String(c.id))}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-neutral-200/70 py-20 text-center">
          <p className="text-xl font-medium text-neutral-900">No products found</p>
          <p className="mt-2 text-neutral-500">Try a different search or category.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCat('All');
            }}
            className="mt-6 rounded-full bg-neutral-800 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filtered.map((product) => {
            const soldOut = product.Stock === 0;
            const low = product.Stock > 0 && product.Stock <= 5;
            const justAdded = added === product.id;
            return (
              <article key={product.id} className="group flex flex-col">
                <Link
                  to={`/products/${product.id}`}
                  className="relative block aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-200"
                >
                  <img
                    src={product.productphoto}
                    alt={product.name}
                    className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                      soldOut ? 'grayscale opacity-60' : ''
                    }`}
                  />
                  {(low || soldOut) && (
                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium backdrop-blur ${
                        soldOut
                          ? 'bg-neutral-800/80 text-white'
                          : 'bg-white/85 text-neutral-800'
                      }`}
                    >
                      {soldOut ? 'Sold out' : `Only ${product.Stock} left`}
                    </span>
                  )}
                </Link>

                <div className="mt-4 flex items-start justify-between gap-3 px-1">
                  <div className="min-w-0">
                    <Link
                      to={`/products/${product.id}`}
                      className="block font-medium text-neutral-900 truncate hover:text-neutral-500 transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="text-sm text-neutral-500 truncate">{product.description}</p>
                    <p className="mt-2 font-semibold text-neutral-900">${product.price}</p>
                  </div>
                  <button
                    disabled={soldOut}
                    onClick={() => handleAdd(product)}
                    aria-label={`Add ${product.name} to cart`}
                    className={`grid place-items-center h-11 w-11 shrink-0 rounded-full transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed ${
                      justAdded
                        ? 'bg-neutral-800 text-white scale-110'
                        : 'bg-neutral-200/70 text-neutral-800 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    {justAdded ? <Check size={18} /> : <Plus size={18} />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}