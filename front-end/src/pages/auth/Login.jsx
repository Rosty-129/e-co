
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { AuthShell, Field, PrimaryButton, FormError, stepAnim } from '../../components/AuthUI';

const copy = {
  login: ['Welcome back', 'Sign in to track your orders and check out faster.'],
  forgot: ['Forgot your password?', 'Enter your email and we will send you a 6-digit code.'],
  reset: ['Choose a new password', 'Enter the code from your email and set a new password.'],
  done: ['All set', 'Your password has been updated.'],
};

export default function Login() {
  const { login, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('login');

  const [email, setEmail] = useState('user@test.com');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);

  // CAPTCHA state
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);

  const resetCaptcha = () => {
    setCaptchaToken('');
    setCaptchaKey(prev => prev + 1);
  };

  const go = (next) => {
    setError('');
    setFieldError('');
    resetCaptcha();
    setView(next);
  };

  const run = async (fn) => {
    setError('');
    setLoading(true);

    try {
      await fn();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const handleLogin = (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    run(async () => {
      try {
        // Send CAPTCHA token to backend
        await login(email, password, captchaToken);
        navigate('/');
      } catch (err) {
        if (err.code === 'UNVERIFIED') {
          navigate('/register', {
            state: { verifyEmail: email }
          });
          return;
        }

        throw err;
      } finally {
        resetCaptcha();
      }
    });
  };

  // FORGOT PASSWORD
  const handleForgot = (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    run(async () => {
      try {
        await forgotPassword(email, captchaToken);
        go('reset');
      } finally {
        resetCaptcha();
      }
    });
  };

  // RESET PASSWORD
  const handleReset = (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      return setFieldError('Use at least 8 characters.');
    }

    if (newPassword !== confirm) {
      return setFieldError('The passwords do not match.');
    }

    setFieldError('');

    run(async () => {
      await resetPassword({
        email,
        code,
        password: newPassword
      });

      setPassword('');
      go('done');
    });
  };

  // RESEND PASSWORD RESET CODE
  const handleResend = () => {
    if (!captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    run(async () => {
      try {
        await forgotPassword(email, captchaToken);
        setError('');
      } finally {
        resetCaptcha();
      }
    });
  };

  const back = (
    <button
      type="button"
      onClick={() => go('login')}
      className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
    >
      <ArrowLeft
        size={16}
        className="transition-transform group-hover:-translate-x-1"
      />
      Back to sign in
    </button>
  );

  return (
    <AuthShell title={copy[view][0]} text={copy[view][1]}>
      <div key={view} data-auth-step style={stepAnim}>

        {/* LOGIN */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Sign in
            </h2>

            <FormError>{error}</FormError>

            <Field
              id="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <div>
              <Field
                id="password"
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />

              <button
                type="button"
                onClick={() => go('forgot')}
                className="mt-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Cloudflare Turnstile */}
            <div className="flex justify-center">
              <Turnstile
                key={captchaKey}
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken('')}
                onError={() => setCaptchaToken('')}
              />
            </div>

            <PrimaryButton type="submit" loading={loading}>
              Sign in
            </PrimaryButton>

            <p className="text-sm text-neutral-500 text-center">
              New here?{' '}
              <Link
                to="/register"
                className="font-medium text-neutral-900 underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {view === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-5">
            {back}

            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Reset your password
            </h2>

            <FormError>{error}</FormError>

            <Field
              id="reset-email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <div className="flex justify-center">
              <Turnstile
                key={captchaKey}
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken('')}
                onError={() => setCaptchaToken('')}
              />
            </div>

            <PrimaryButton type="submit" loading={loading}>
              Send code
            </PrimaryButton>
          </form>
        )}

        {/* RESET PASSWORD */}
        {view === 'reset' && (
          <form onSubmit={handleReset} className="space-y-5">
            {back}

            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Enter your code
            </h2>

            <p className="text-sm text-neutral-500 -mt-2">
              We sent a code to{' '}
              <span className="font-medium text-neutral-800">
                {email}
              </span>. It expires in 15 minutes.
            </p>

            <FormError>{error}</FormError>

            <Field
              id="code"
              label="6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              style={{ letterSpacing: '0.4em' }}
            />

            <Field
              id="new-password"
              label="New password"
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="At least 8 characters."
            />

            <Field
              id="confirm-password"
              label="Confirm new password"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              error={fieldError}
            />

            <PrimaryButton type="submit" loading={loading}>
              Update password
            </PrimaryButton>

            {/* CAPTCHA for requesting another reset code */}
            <div className="flex justify-center">
              <Turnstile
                key={captchaKey}
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken('')}
                onError={() => setCaptchaToken('')}
              />
            </div>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full text-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Send a new code
            </button>
          </form>
        )}

        {/* DONE */}
        {view === 'done' && (
          <div className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Password updated
            </h2>

            <p className="text-neutral-500">
              You can now sign in with your new password.
            </p>

            <PrimaryButton type="button" onClick={() => go('login')}>
              Back to sign in
            </PrimaryButton>
          </div>
        )}

      </div>
    </AuthShell>
  );
}
