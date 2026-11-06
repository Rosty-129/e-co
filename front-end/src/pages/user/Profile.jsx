import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, User, Lock, CheckCircle2 } from 'lucide-react';

// Same host as AuthContext's API_URL (which is '.../auth'), but profile lives at '.../profile'
const API_BASE = 'https://e-co-plao.vercel.app';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const token = localStorage.getItem('authtoken');

  const [profile, setProfile] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const [passwords, setPasswords] = useState({
    oldpassword: '',
    newpassword: '',
    confirmpassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Load profile on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!token) {
        setLoading(false);
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
      } catch (err) {
        if (!cancelled) setProfileMsg({ type: 'error', text: err.message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setProfileMsg({ type: '', text: '' });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setProfileMsg({ type: 'error', text: 'You must be logged in.' });
      return;
    }
    setSavingProfile(true);
    setProfileMsg({ type: '', text: '' });
    try {
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

      // Keep navbar / auth context in sync
      updateUser({
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: profile.email,
        phone: profile.phone,
      });

      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPasswordMsg({ type: '', text: '' });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setPasswordMsg({ type: 'error', text: 'You must be logged in.' });
      return;
    }
    if (passwords.newpassword !== passwords.confirmpassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwords.newpassword.length < 6) {
      setPasswordMsg({
        type: 'error',
        text: 'New password must be at least 6 characters.',
      });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg({ type: '', text: '' });
    try {
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
      setPasswords({ oldpassword: '', newpassword: '', confirmpassword: '' });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-gray-500 text-sm">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6"
      >
        <ArrowLeft size={16} /> Back to home
      </Link>

      <h1 className="text-2xl font-medium mb-6 text-black">My Profile</h1>

      <div className="space-y-6">
        {/* --- Profile info --- */}
        <form
          onSubmit={handleProfileSubmit}
          className="border-2 border-black rounded-lg p-6 bg-white space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-black/10 pb-3">
            <User size={18} />
            <h2 className="font-medium text-lg text-black">Account details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstname"
                required
                value={profile.firstname}
                onChange={handleProfileChange}
                className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastname"
                required
                value={profile.lastname}
                onChange={handleProfileChange}
                className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={profile.email}
              onChange={handleProfileChange}
              className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              placeholder="e.g. +1 555-0199"
              value={profile.phone}
              onChange={handleProfileChange}
              className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
            />
          </div>

          {profileMsg.text && (
            <p
              className={`text-xs font-medium flex items-center gap-1.5 ${
                profileMsg.type === 'success' ? 'text-green-700' : 'text-red-600'
              }`}
            >
              {profileMsg.type === 'success' && <CheckCircle2 size={14} />}
              {profileMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full sm:w-auto px-6 py-2.5 bg-black text-white font-medium rounded text-sm border-2 border-black hover:bg-white hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        {/* --- Change password --- */}
        <form
          onSubmit={handlePasswordSubmit}
          className="border-2 border-black rounded-lg p-6 bg-white space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-black/10 pb-3">
            <Lock size={18} />
            <h2 className="font-medium text-lg text-black">Change password</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="oldpassword"
              required
              value={passwords.oldpassword}
              onChange={handlePasswordChange}
              className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                New Password
              </label>
              <input
                type="password"
                name="newpassword"
                required
                value={passwords.newpassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmpassword"
                required
                value={passwords.confirmpassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
              />
            </div>
          </div>

          {passwordMsg.text && (
            <p
              className={`text-xs font-medium flex items-center gap-1.5 ${
                passwordMsg.type === 'success' ? 'text-green-700' : 'text-red-600'
              }`}
            >
              {passwordMsg.type === 'success' && <CheckCircle2 size={14} />}
              {passwordMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={savingPassword}
            className="w-full sm:w-auto px-6 py-2.5 bg-black text-white font-medium rounded text-sm border-2 border-black hover:bg-white hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingPassword ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}