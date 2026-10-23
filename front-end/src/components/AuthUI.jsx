import { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export const authCss = `
@keyframes auth-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  [data-auth-step] { animation: none !important; }
}
`;

export const stepAnim = { animation: 'auth-in 0.5s cubic-bezier(0.22, 0.7, 0.2, 1) both' };

export function AuthShell({ title, text, children }) {
  return (
    <div className="max-w-4xl mx-auto my-6 md:my-12 grid md:grid-cols-[0.85fr_1.15fr] overflow-hidden rounded-[2rem] border border-neutral-200 bg-white">
      <style>{authCss}</style>
      <div className="bg-neutral-800 text-neutral-100 p-10 md:p-12 flex flex-col justify-between gap-10 min-h-[14rem]">
        <p className="text-xl font-semibold tracking-tight">
          Store<span className="text-neutral-400">.</span>
        </p>
        <div key={title} data-auth-step style={stepAnim}>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
            {title}
          </h1>
          <p className="mt-4 text-neutral-300 leading-relaxed max-w-xs">{text}</p>
        </div>
      </div>
      <div className="p-8 md:p-12">{children}</div>
    </div>
  );
}

export function Field({ label, id, type = 'text', error, hint, ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-600 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          aria-invalid={!!error}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-4 transition ${
            isPassword ? 'pr-12' : ''
          } ${
            error
              ? 'border-neutral-800 focus:ring-neutral-300'
              : 'border-neutral-300 focus:border-neutral-800 focus:ring-neutral-200'
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid place-items-center h-8 w-8 rounded-full text-neutral-400 hover:text-neutral-800 transition-colors"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-neutral-800 font-medium">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function PrimaryButton({ loading, children, ...props }) {
  return (
    <button
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-neutral-800 py-3.5 font-medium text-white hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      {...props}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="rounded-xl bg-neutral-100 border border-neutral-300 px-4 py-3 text-sm text-neutral-800"
    >
      {children}
    </div>
  );
}

// DevHint has been deleted