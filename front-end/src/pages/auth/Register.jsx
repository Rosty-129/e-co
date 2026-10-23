import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthShell, Field, PrimaryButton, FormError, stepAnim } from '../../components/AuthUI';

const copy = {
  form: ['Create your account', 'Track every order and check out in seconds.'],
  verify: ['Check your inbox', 'One last step: confirm your email so we know it is you.'],
};

export default function Register() {
  const navigate = useNavigate();
  const { register, verifyEmail, resendCode } = useAuth();
  const location = useLocation();
  // Login can send people here to verify an account they never confirmed
  const pendingEmail = location.state?.verifyEmail;

  const [step, setStep] = useState(pendingEmail ? 'verify' : 'form'); // form | verify
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: pendingEmail || '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  // Arrived from Login with an unverified account: send a fresh code
  useEffect(() => {
    if (pendingEmail) resendCode(pendingEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const run = async (fn) => {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const next = {};
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.password !== form.confirm) next.confirm = 'The passwords do not match.';
    if (!/^[+\d][\d\s-]{5,}$/.test(form.phone)) next.phone = 'Enter a valid phone number.';
    setErrors(next);
    if (Object.keys(next).length) return;

    // role and isVerified are set by the server, never by the client
    const { confirm, ...payload } = form;
    run(async () => {
      await register(payload);
      setStep('verify');
    });
  };

  const handleVerify = (e) => {
    e.preventDefault();
    run(async () => {
      await verifyEmail({ email: form.email, code });
      navigate('/'); // THIS IS THE FIX: Navigate to home instead of login
    });
  };

  const handleResend = () =>
    run(async () => {
      await resendCode(form.email);
      setNotice('We sent you a new code.');
    });

  return (
    <AuthShell title={copy[step][0]} text={copy[step][1]}>
      <div key={step} data-auth-step style={stepAnim}>
        {step === 'form' && (
          <form onSubmit={handleRegister} className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Sign up</h2>
            <FormError>{error}</FormError>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field
                id="firstname"
                label="First name"
                required
                autoComplete="given-name"
                value={form.firstname}
                onChange={set('firstname')}
              />
              <Field
                id="lastname"
                label="Last name"
                required
                autoComplete="family-name"
                value={form.lastname}
                onChange={set('lastname')}
              />
            </div>
            <Field
              id="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
            />
            <Field
              id="phone"
              label="Phone"
              type="tel"
              required
              autoComplete="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="+213 555 000 000"
              error={errors.phone}
              hint="Used for delivery and pickup."
            />
            <Field
              id="password"
              label="Password"
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
              error={errors.password}
              hint="At least 8 characters."
            />
            <Field
              id="confirm"
              label="Confirm password"
              type="password"
              required
              autoComplete="new-password"
              value={form.confirm}
              onChange={set('confirm')}
              error={errors.confirm}
            />
            <PrimaryButton type="submit" loading={loading}>
              Create account
            </PrimaryButton>
            <p className="text-sm text-neutral-500 text-center">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-neutral-900 underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Verify your email
            </h2>
            <p className="text-sm text-neutral-500 -mt-2">
              We sent a 6-digit code to{' '}
              <span className="font-medium text-neutral-800">{form.email}</span>. It expires in 10
              minutes.
            </p>
            <FormError>{error}</FormError>
            {notice && (
              <p className="text-sm font-medium text-neutral-800" role="status">
                {notice}
              </p>
            )}
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
            <PrimaryButton type="submit" loading={loading}>
              Verify email
            </PrimaryButton>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleResend}
                className="text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Send a new code
              </button>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Change email
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthShell>
  );
}