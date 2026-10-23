import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5005';

export default function AdminProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
  });
  const [pwd, setPwd] = useState({ oldpassword: '', newpassword: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authtoken');
    fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        const u = data.all || {};
        setForm({
          firstname: u.firstname || user?.firstname || '',
          lastname: u.lastname || user?.lastname || '',
          email: u.email || user?.email || '',
          phone: u.phone || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const token = localStorage.getItem('authtoken');
      const res = await fetch(`${API}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setMsg('Profile updated.');
    } catch (e) {
      setErr(e.message);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (pwd.newpassword !== pwd.confirm) return setErr('Passwords do not match.');
    if (pwd.newpassword.length < 8) return setErr('Use at least 8 characters.');
    try {
      const token = localStorage.getItem('authtoken');
      const res = await fetch(`${API}/profile/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldpassword: pwd.oldpassword, newpassword: pwd.newpassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password change failed');
      setMsg('Password updated.');
      setPwd({ oldpassword: '', newpassword: '', confirm: '' });
    } catch (e) {
      setErr(e.message);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading profile...</p>;

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-medium text-black">Admin Profile</h1>

      {msg && <p className="p-3 bg-black/5 border-2 border-black rounded text-black text-sm">{msg}</p>}
      {err && <p className="p-3 bg-red-50 border-2 border-red-700 rounded text-red-700 text-sm">{err}</p>}

      <form onSubmit={saveProfile} className="border-2 border-black rounded-lg p-6 bg-white space-y-4">
        <h2 className="font-medium text-black">Personal Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">First Name</label>
            <input
              value={form.firstname}
              onChange={(e) => setForm({ ...form, firstname: e.target.value })}
              className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Last Name</label>
            <input
              value={form.lastname}
              onChange={(e) => setForm({ ...form, lastname: e.target.value })}
              className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-black mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-black mb-1">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 border-2 border-black bg-black text-white font-medium rounded hover:bg-white hover:text-black transition"
        >
          Save Profile
        </button>
      </form>

      <form onSubmit={changePassword} className="border-2 border-black rounded-lg p-6 bg-white space-y-4">
        <h2 className="font-medium text-black">Change Password</h2>
        <div>
          <label className="block text-xs font-semibold text-black mb-1">Current Password</label>
          <input
            type="password"
            value={pwd.oldpassword}
            onChange={(e) => setPwd({ ...pwd, oldpassword: e.target.value })}
            className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-black mb-1">New Password</label>
            <input
              type="password"
              value={pwd.newpassword}
              onChange={(e) => setPwd({ ...pwd, newpassword: e.target.value })}
              className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-black mb-1">Confirm</label>
            <input
              type="password"
              value={pwd.confirm}
              onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
              className="w-full p-2 border-2 border-black rounded bg-white text-sm text-gray-800 focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 border-2 border-black bg-black text-white font-medium rounded hover:bg-white hover:text-black transition"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}