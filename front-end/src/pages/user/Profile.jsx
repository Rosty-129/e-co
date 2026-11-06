import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthShell, Field, PrimaryButton, FormError, stepAnim } from '../../components/AuthUI';

const API_BASE = 'https://e-co-plao.vercel.app';

const copy = {
  account: ['Your profile', 'Update your details. Changing your email requires your current password.'],
  password: ['Change password', 'Use at least 8 characters.'],
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const token = localStorage.getItem('authtoken');

  const [step, setStep] = useState('account');

  const [profile, setProfile] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [originalEmail, setOriginalEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');

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
        setOriginalEmail(p.email || '');
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

  const emailChanged =
    profile.email.trim().toLowerCase() !== originalEmail.trim().toLowerCase();

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
    if (emailChanged && currentPassword.length === 0) {
      next.currentPassword = 'Enter your current password to change your email.';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    run(async () => {
      const body = {
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.email,
        phone: profile.phone,
      };
      if (emailChanged) body.currentPassword = currentPassword;

      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      updateUser({
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.email,
        phone: profile.phone,
      });
      setOriginalEmail(profile.email);
      setCurrentPassword('');
      setNotice(emailChanged ? 'Profile updated, including email.' : 'Profile updated.');
    });
  };

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
              hint="Changing your email requires your current password."
            />
            {emailChanged && (
              <Field
                id="currentPassword"
                label="Current password"
                type="password"
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={errors.currentPassword}
                hint="Required to confirm your email change."
              />
            )}
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
            <p className="text-sm text-neutral-500 text-center">
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setError('');
                  setNotice('');
                  setPasswords({ oldpassword: '', newpassword: '', confirm: '' });
                  setStep('password');
                }}
                className="font-medium text-neutral-900 underline underline-offset-4"
              >
                Change password
              </button>
            </p>
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
      </div>
    </AuthShell>
  );
}