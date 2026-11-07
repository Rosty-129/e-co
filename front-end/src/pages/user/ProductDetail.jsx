import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, Minus, Plus, Check } from 'lucide-react';
import ProductReviews from './ProductReviews';

export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useStore();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === Number(id));

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!product) {
    return (
      <div className="py-24 text-center">
        <p className="text-2xl font-semibold text-neutral-900">
          Product not found
        </p>

        <Link
          to="/products"
          className="mt-6 inline-block rounded-full bg-neutral-800 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700 transition-colors"
        >
          Back to products
        </Link>
      </div>
    );
  }

  const photos = product.productphoto || [];
  const currentImage = photos[selectedImage]?.url;

  const soldOut = product.Stock === 0;
  const low = product.Stock > 0 && product.Stock <= 5;

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const stepBtn =
    'grid place-items-center h-10 w-10 rounded-full hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors';

  return (
    <div className="max-w-5xl mx-auto space-y-20">
      <div>
        <Link
          to="/products"
          className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back to products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Image gallery */}
          <div className="md:sticky md:top-24">
            <div className="overflow-hidden rounded-[2rem] bg-neutral-200 aspect-square">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  className={`h-full w-full object-cover ${
                    soldOut ? 'grayscale opacity-60' : ''
                  }`}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-neutral-500">
                  No image available
                </div>
              )}
            </div>

            {photos.length > 1 && (
              <div className="grid grid-cols-5 gap-3 mt-4">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-xl aspect-square border-2 transition ${
                      selectedImage === index
                        ? 'border-neutral-900'
                        : 'border-transparent hover:border-neutral-400'
                    }`}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <img
                      src={photo.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col pt-2">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900">
              {product.name}
            </h1>

            <p className="mt-4 text-3xl font-semibold text-neutral-900">
              ${product.price}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-neutral-200/70 px-3.5 py-1.5 text-sm font-medium text-neutral-700">
              <span
                className={`h-2 w-2 rounded-full ${
                  soldOut
                    ? 'bg-neutral-400'
                    : low
                      ? 'bg-amber-500'
                      : 'bg-neutral-800'
                }`}
              />

              {soldOut
                ? 'Out of stock'
                : low
                  ? `Only ${product.Stock} left`
                  : 'In stock'}
            </div>

            <p className="mt-6 text-neutral-500 text-lg leading-relaxed max-w-md">
              {product.description}
            </p>

            <div className="mt-10 flex flex-col gap-4 border-t border-neutral-200 pt-8">
              {!soldOut && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600">
                    Quantity
                  </span>

                  <div className="flex items-center rounded-full bg-neutral-100 border border-neutral-200">
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.max(1, q - 1))
                      }
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className={stepBtn}
                    >
                      <Minus size={16} />
                    </button>

                    <span className="w-10 text-center font-medium tabular-nums">
                      {quantity}
                    </span>

                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.Stock, q + 1))
                      }
                      disabled={quantity >= product.Stock}
                      aria-label="Increase quantity"
                      className={stepBtn}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              <button
                disabled={soldOut}
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-neutral-800 py-4 font-medium text-white hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {added ? (
                  <>
                    <Check size={18} />
                    Added to cart
                  </>
                ) : soldOut ? (
                  'Sold out'
                ) : (
                  `Add to cart · $${(product.price * quantity).toFixed(2)}`
                )}
              </button>

              <p className="text-sm text-neutral-500 text-center">
                No payment now. You pay when your order arrives.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}