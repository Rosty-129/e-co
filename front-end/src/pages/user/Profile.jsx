import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthShell, Field, PrimaryButton, FormError, stepAnim } from '../../components/AuthUI';

const API_BASE = 'https://e-co-plao.vercel.app';

const copy = {
  account: ['Your profile', 'Update your details. Changing your email requires a confirmation code.'],
  password: ['Change password', 'Use at least 8 characters. You will stay signed in on this device.'],
  verifyEmail: ['Confirm new email', 'We sent a 6-digit code to your new address. Enter it below.'],
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const token = localStorage.getItem('authtoken');

  const [step, setStep] = useState('account'); // account | password | verifyEmail

  const [profile, setProfile] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [pendingEmail, setPendingEmail] = useState('');
  const [code, setCode] = useState('');

  const [passwords, setPasswords] = useState({
    oldpassword: '',
    newpassword: '',
    confirm: '',
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!token) {
        setPageLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load profile');
        if (cancelled) return;
        const p = data.all || data;
        setProfile({
          firstname: p.firstname || '',
          lastname: p.lastname || '',
          email: p.email || '',
          phone: p.phone || '',
        });
        if (p.pendingEmail) {
          setPendingEmail(p.pendingEmail);
          setStep('verifyEmail');
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const setField = (key) => (e) =>
    setProfile((prev) => ({ ...prev, [key]: e.target.value }));

  const setPw = (key) => (e) =>
    setPasswords((prev) => ({ ...prev, [key]: e.target.value }));

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

  const handleAccount = (e) => {
    e.preventDefault();
    const next = {};
    if (!/^[+\d][\d\s-]{5,}$/.test(profile.phone || '')) {
      next.phone = 'Enter a valid phone number.';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    run(async () => {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstname: profile.firstname,
          lastname: profile.lastname,
          email: profile.email,
          phone: profile.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      updateUser({
        firstname: profile.firstname,
        lastname: profile.lastname,
        phone: profile.phone,
      });

      if (data.pendingEmail) {
        setPendingEmail(data.pendingEmail);
        setCode('');
        setStep('verifyEmail');
      } else {
        setNotice('Profile updated.');
      }
    });
  };

  const handleVerifyEmail = (e) => {
    e.preventDefault();
    run(async () => {
      const res = await fetch(`${API_BASE}/profile/email/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      updateUser({ email: pendingEmail });
      setProfile((p) => ({ ...p, email: pendingEmail }));
      setPendingEmail('');
      setCode('');
      setNotice('Email updated.');
      setStep('account');
    });
  };

  const handleCancelEmail = () =>
    run(async () => {
      await fetch(`${API_BASE}/profile/email/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingEmail('');
      setCode('');
      setNotice('Pending email change cancelled.');
      setStep('account');
    });

  const handlePassword = (e) => {
    e.preventDefault();
    const next = {};
    if (passwords.newpassword.length < 8) {
      next.newpassword = 'Use at least 8 characters.';
    }
    if (passwords.newpassword !== passwords.confirm) {
      next.confirm = 'The passwords do not match.';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    run(async () => {
      const res = await fetch(`${API_BASE}/profile/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldpassword: passwords.oldpassword,
          newpassword: passwords.newpassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');
      setPasswords({ oldpassword: '', newpassword: '', confirm: '' });
      setNotice('Password updated.');
      setStep('account');
    });
  };

  if (pageLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-neutral-500 text-sm">
        Loading profile…
      </div>
    );
  }

  return (
    <AuthShell title={copy[step][0]} text={copy[step][1]}>
      <div key={step} data-auth-step style={stepAnim}>
        {step === 'account' && (
          <form onSubmit={handleAccount} className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Account details
            </h2>
            <FormError>{error}</FormError>
            {notice && (
              <p className="text-sm font-medium text-neutral-800" role="status">
                {notice}
              </p>
            )}
            <div className="grid sm:grid-cols-2 gap-5">
              <Field
                id="firstname"
                label="First name"
                required
                autoComplete="given-name"
                value={profile.firstname}
                onChange={setField('firstname')}
              />
              <Field
                id="lastname"
                label="Last name"
                required
                autoComplete="family-name"
                value={profile.lastname}
                onChange={setField('lastname')}
              />
            </div>
            <Field
              id="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={profile.email}
              onChange={setField('email')}
              hint="Changing this will send a confirmation code to the new address."
            />
            <Field
              id="phone"
              label="Phone"
              type="tel"
              required
              autoComplete="tel"
              value={profile.phone}
              onChange={setField('phone')}
              placeholder="+213 555 000 000"
              error={errors.phone}
            />
            <PrimaryButton type="submit" loading={loading}>
              Save changes
            </PrimaryButton>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setError('');
                  setNotice('');
                  setPasswords({ oldpassword: '', newpassword: '', confirm: '' });
                  setStep('password');
                }}
                className="text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Change password
              </button>
              {pendingEmail && (
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setNotice('');
                    setStep('verifyEmail');
                  }}
                  className="text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Resume email change
                </button>
              )}
            </div>
          </form>
        )}

        {step === 'password' && (
          <form onSubmit={handlePassword} className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Change password
            </h2>
            <FormError>{error}</FormError>
            {notice && (
              <p className="text-sm font-medium text-neutral-800" role="status">
                {notice}
              </p>
            )}
            <Field
              id="oldpassword"
              label="Current password"
              type="password"
              required
              autoComplete="current-password"
              value={passwords.oldpassword}
              onChange={setPw('oldpassword')}
            />
            <Field
              id="newpassword"
              label="New password"
              type="password"
              required
              autoComplete="new-password"
              value={passwords.newpassword}
              onChange={setPw('newpassword')}
              error={errors.newpassword}
              hint="At least 8 characters."
            />
            <Field
              id="confirm"
              label="Confirm new password"
              type="password"
              required
              autoComplete="new-password"
              value={passwords.confirm}
              onChange={setPw('confirm')}
              error={errors.confirm}
            />
            <PrimaryButton type="submit" loading={loading}>
              Update password
            </PrimaryButton>
            <p className="text-sm text-neutral-500 text-center">
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setError('');
                  setNotice('');
                  setStep('account');
                }}
                className="font-medium text-neutral-900 underline underline-offset-4"
              >
                Back to account
              </button>
            </p>
          </form>
        )}

        {step === 'verifyEmail' && (
          <form onSubmit={handleVerifyEmail} className="space-y-5">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Confirm your new email
            </h2>
            <p className="text-sm text-neutral-500 -mt-2">
              We sent a 6-digit code to{' '}
              <span className="font-medium text-neutral-800">{pendingEmail}</span>. It expires in 15
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
              Confirm email
            </PrimaryButton>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleCancelEmail}
                className="text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Cancel change
              </button>
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setError('');
                  setNotice('');
                  setStep('account');
                }}
                className="text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Back to account
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthShell>
  );
}