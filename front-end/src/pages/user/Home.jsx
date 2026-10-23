import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  CheckCircle,
  Package,
  Boxes,
  Wallet,
  ClipboardList,
  Search,
  ShieldCheck,
  Plus,
} from 'lucide-react';

const steps = [
  {
    icon: ShoppingBag,
    title: 'Browse and select',
    text: 'Explore the catalog, check stock in real time and add what you need to your cart.',
  },
  {
    icon: CheckCircle,
    title: 'Check out fast',
    text: 'Review your cart and enter your delivery details. No card needed to place the order.',
  },
  {
    icon: Package,
    title: 'Receive and pay',
    text: 'We process the order right away. You pay in person when you get or pick up your items.',
  },
];

const faqs = [
  {
    q: 'Do I need a credit card to order?',
    a: 'No. You only give us your delivery details. Payment happens in person when you receive or pick up your order.',
  },
  {
    q: 'How do I know an item is in stock?',
    a: 'Stock levels are shown live on every product. If something sells out, it is marked as soon as it happens.',
  },
  {
    q: 'Can I see my previous orders?',
    a: 'Yes. Create an account and every order, with its current status, appears on your Orders page.',
  },
  {
    q: 'Who manages the inventory?',
    a: 'Admins log in to update stock, add products and clear completed orders.',
  },
];

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y divide-neutral-200 border-y border-neutral-200">
      {faqs.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-6 py-5 text-left text-lg font-medium text-neutral-800 hover:text-neutral-500 transition-colors"
            >
              {item.q}
              <Plus
                size={20}
                className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <p className="overflow-hidden text-neutral-500 leading-relaxed max-w-xl">
                <span className="block pb-5">{item.a}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const rise = (delay = 0, duration = 1.5) => ({
  animation: `home-rise ${duration}s cubic-bezier(0.22, 0.7, 0.2, 1) ${delay}s both`,
});

const riseCss = `
@keyframes home-rise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  [data-rise] { animation: none !important; }
}
`;

/* Pure-CSS product preview used in the hero */
function HeroVisual() {
  return (
    <div className="relative h-80 sm:h-96 lg:h-[28rem]">
      <div
        data-rise
        style={rise(0.4, 1.8)}
        className="absolute inset-0 rounded-[2rem] bg-neutral-200/70"
      />

      <div data-rise style={rise(1.0)} className="absolute left-[8%] top-[10%] w-[52%]">
        <div className="rounded-2xl bg-white border border-neutral-200 p-3 shadow-sm -rotate-3">
          <div className="aspect-square rounded-xl bg-neutral-300" />
          <div className="mt-3 h-3 w-2/3 rounded-full bg-neutral-300" />
          <div className="mt-2 h-3 w-1/3 rounded-full bg-neutral-200" />
        </div>
      </div>

      <div data-rise style={rise(1.35)} className="absolute right-[7%] top-[22%] w-[46%]">
        <div className="rounded-2xl bg-neutral-800 p-3 shadow-lg rotate-2">
          <div className="aspect-[4/5] rounded-xl bg-neutral-600" />
          <div className="mt-3 flex items-center justify-between">
            <div className="h-3 w-1/2 rounded-full bg-neutral-500" />
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800">
              In stock
            </span>
          </div>
        </div>
      </div>

      <div data-rise style={rise(1.8)} className="absolute left-[14%] bottom-[8%]">
        <div className="flex items-center gap-3 rounded-full bg-white border border-neutral-200 py-2 pl-2 pr-5 shadow-md">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-neutral-800 text-white">
            <ShoppingBag size={16} />
          </span>
          <span className="text-sm">
            <span className="block font-medium text-neutral-800">Added to cart</span>
            <span className="block text-neutral-500 text-xs">Pay when it arrives</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const handleContactSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! (Mock Action)');
    e.target.reset();
  };

  const inputClass =
    'w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-800 focus:ring-4 focus:ring-neutral-200 transition';

  return (
    <div className="space-y-28 text-neutral-800">
      <style>{riseCss}</style>
      {/* Hero */}
      <section className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center pt-4">
        <div>
          <h1 data-rise style={rise(0.2)} className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.02] text-neutral-900">
            Shopping, minus the noise.
          </h1>
          <p data-rise style={rise(0.8)} className="mt-6 text-lg md:text-xl text-neutral-500 max-w-lg leading-relaxed">
            A small, focused store. Browse what is in stock, order in a minute and pay when your items
            arrive.
          </p>
          <div data-rise style={rise(1.3)} className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 rounded-full bg-neutral-800 px-7 py-3.5 font-medium text-white hover:bg-neutral-700 transition-colors"
            >
              Start shopping
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border border-neutral-300 bg-white px-7 py-3.5 font-medium text-neutral-800 hover:border-neutral-800 transition-colors"
            >
              How it works
            </a>
          </div>
        </div>
        <HeroVisual />
      </section>

      <div data-rise style={rise(2.0, 1.8)} className="space-y-28">
      {/* Quick facts strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-px overflow-hidden rounded-2xl bg-neutral-200 border border-neutral-200">
        {[
          ['No card', 'required to place an order'],
          ['Live stock', 'updated as items sell'],
          ['Pay in person', 'on delivery or pickup'],
        ].map(([big, small]) => (
          <div key={big} className="bg-white px-8 py-7">
            <p className="text-2xl font-semibold text-neutral-900">{big}</p>
            <p className="mt-1 text-neutral-500">{small}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24">
        <div className="max-w-xl mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
            From cart to doorstep in three steps
          </h2>
          <p className="mt-4 text-neutral-500 text-lg">
            No payment forms, no waiting on confirmations.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className={`rounded-3xl p-8 ${
                i === 1 ? 'bg-neutral-800 text-neutral-100' : 'bg-white border border-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between mb-10">
                <span
                  className={`grid place-items-center h-12 w-12 rounded-2xl ${
                    i === 1 ? 'bg-neutral-700' : 'bg-neutral-100'
                  }`}
                >
                  <Icon size={22} strokeWidth={1.6} />
                </span>
                <span className={`text-sm ${i === 1 ? 'text-neutral-400' : 'text-neutral-400'}`}>
                  Step {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{title}</h3>
              <p className={`leading-relaxed ${i === 1 ? 'text-neutral-300' : 'text-neutral-500'}`}>
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What you can do: bento */}
      <section>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 max-w-xl mb-12">
          Everything you need, nothing you don&apos;t
        </h2>
        <div className="grid md:grid-cols-6 gap-5">
          <div className="md:col-span-4 rounded-3xl bg-neutral-200/70 p-8 md:p-10 min-h-[15rem] flex flex-col justify-between">
            <ClipboardList size={28} strokeWidth={1.5} />
            <div>
              <h3 className="text-2xl font-semibold text-neutral-900">Track every order</h3>
              <p className="mt-2 text-neutral-600 max-w-md leading-relaxed">
                Create a customer account and follow your order history and status in one place.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-3xl bg-white border border-neutral-200 p-8 flex flex-col justify-between min-h-[15rem]">
            <Search size={28} strokeWidth={1.5} />
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">Find it instantly</h3>
              <p className="mt-2 text-neutral-500 leading-relaxed">
                Filter by category and search by name on the products page.
              </p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-3xl bg-white border border-neutral-200 p-8 flex flex-col justify-between min-h-[15rem]">
            <Boxes size={28} strokeWidth={1.5} />
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">Real-time stock</h3>
              <p className="mt-2 text-neutral-500 leading-relaxed">
                What you see is what is on the shelf.
              </p>
            </div>
          </div>

          <div className="md:col-span-4 rounded-3xl bg-neutral-800 text-neutral-100 p-8 md:p-10 min-h-[15rem] flex flex-col justify-between">
            <ShieldCheck size={28} strokeWidth={1.5} />
            <div>
              <h3 className="text-2xl font-semibold">Built-in admin tools</h3>
              <p className="mt-2 text-neutral-300 max-w-md leading-relaxed">
                Log in as an admin to update stock, add new products and clear orders without leaving
                the store.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pay on receipt callout */}
      <section className="rounded-[2rem] bg-neutral-200/70 px-8 py-14 md:px-16 md:py-16 grid md:grid-cols-[auto_1fr_auto] gap-8 items-center">
        <span className="grid place-items-center h-16 w-16 rounded-full bg-white border border-neutral-300">
          <Wallet size={26} strokeWidth={1.5} />
        </span>
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
            Pay only when you have your items
          </h2>
          <p className="mt-2 text-neutral-600 max-w-xl">
            Orders are processed instantly, and payment is settled face to face on delivery or pickup.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-800 px-7 py-3.5 font-medium text-white hover:bg-neutral-700 transition-colors"
        >
          Browse products
        </Link>
      </section>

      {/* FAQ */}
      <section className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-20">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">
            Common questions
          </h2>
          <p className="mt-4 text-neutral-500 text-lg max-w-sm">
            Still unsure? Send us a message below and we will get back to you.
          </p>
        </div>
        <Faq />
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="scroll-mt-24 grid lg:grid-cols-2 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white"
      >
        <div className="bg-neutral-800 text-neutral-100 p-10 md:p-14 flex flex-col justify-between gap-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Questions about an order or a product?
          </h2>
          <p className="text-neutral-300 leading-relaxed max-w-sm">
            Tell us what you need and leave your email. A real person reads every message.
          </p>
        </div>
        <form className="p-10 md:p-14 space-y-5" onSubmit={handleContactSubmit}>
          <div>
            <label htmlFor="c-name" className="block text-sm font-medium text-neutral-600 mb-2">
              Name
            </label>
            <input id="c-name" type="text" required className={inputClass} placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="c-email" className="block text-sm font-medium text-neutral-600 mb-2">
              Email
            </label>
            <input
              id="c-email"
              type="email"
              required
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="c-msg" className="block text-sm font-medium text-neutral-600 mb-2">
              Message
            </label>
            <textarea
              id="c-msg"
              rows="4"
              required
              className={`${inputClass} resize-none`}
              placeholder="How can we help?"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-neutral-800 py-3.5 font-medium text-white hover:bg-neutral-700 transition-colors"
          >
            Send message
          </button>
        </form>
      </section>
      </div>
    </div>
  );
}