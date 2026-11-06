import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Pencil, Trash2, X, Check } from 'lucide-react';

const API = 'https://e-co-plao.vercel.app';

export default function ProductReviews({ productId }) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newReview, setNewReview] = useState('');
  const [posting, setPosting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // ── Load all reviews for this product (every user's) ──────
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API}/review?productid=${productId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load reviews');
      const all = Array.isArray(data) ? data : data.newone || [];
      setReviews(all);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // ── Create ────────────────────────────────────────────────
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.trim() || !user) return;

    setPosting(true);
    setError('');
    try {
      const token = localStorage.getItem('authtoken');
      const res = await fetch(`${API}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newReview.trim(),
          productid: Number(productId),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post review');

      setNewReview('');
      await loadReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  // ── Update ────────────────────────────────────────────────
  const startEdit = (r) => {
    setEditingId(r.id);
    setEditText(r.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;
    setSavingEdit(true);
    setError('');
    try {
      const token = localStorage.getItem('authtoken');
      const res = await fetch(`${API}/review/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: editText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update review');

      cancelEdit();
      await loadReviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    setError('');
    try {
      const token = localStorage.getItem('authtoken');
      const res = await fetch(`${API}/review/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete review');

      await loadReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  // ── Helpers ───────────────────────────────────────────────
  const canEdit = (r) => user && Number(r.userid) === Number(user.id);

  const displayName = (r) =>
    r.user?.firstname
      ? `${r.user.firstname} ${r.user.lastname || ''}`.trim()
      : r.user?.email
      ? r.user.email
      : `User #${r.userid}`;

  const formatDate = (r) =>
    r.createdAt
      ? new Date(r.createdAt).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '';

  return (
    <section className="grid md:grid-cols-[1fr_1.6fr] gap-10 lg:gap-16 border-t border-neutral-200 pt-14">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Customer reviews
        </h2>
        <p className="mt-2 text-neutral-500">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      <div>
        {/* Form / login prompt */}
        {user ? (
          <form onSubmit={handleAddReview} className="mb-8">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Share what you thought of this product"
              rows="3"
              className="w-full resize-none rounded-2xl border border-neutral-300 bg-white p-4 text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-800 focus:ring-4 focus:ring-neutral-200 transition"
            />
            <button
              type="submit"
              disabled={!newReview.trim() || posting}
              className="mt-3 rounded-full bg-neutral-800 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {posting ? 'Posting…' : 'Post review'}
            </button>
          </form>
        ) : (
          <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
            <Link to="/login" className="font-medium text-neutral-900 underline">
              Sign in
            </Link>{' '}
            to write a review.
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* List — every user's reviews */}
        {loading ? (
          <p className="text-neutral-500">Loading reviews…</p>
        ) : reviews.length === 0 ? (
          <p className="text-neutral-500">No reviews yet — be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl bg-white border border-neutral-200 p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="grid place-items-center h-9 w-9 rounded-full bg-neutral-200 text-sm font-semibold text-neutral-700">
                    {displayName(r).charAt(0).toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-900">
                      {displayName(r)}
                    </p>
                    <p className="text-xs text-neutral-400">{formatDate(r)}</p>
                  </div>

                  {canEdit(r) && editingId !== r.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(r)}
                        aria-label="Edit review"
                        className="grid place-items-center h-8 w-8 rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        aria-label="Delete review"
                        className="grid place-items-center h-8 w-8 rounded-full text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {editingId === r.id ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows="3"
                      className="w-full resize-none rounded-2xl border border-neutral-300 bg-white p-4 text-neutral-800 focus:outline-none focus:border-neutral-800 focus:ring-4 focus:ring-neutral-200 transition"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(r.id)}
                        disabled={!editText.trim() || savingEdit}
                        className="inline-flex items-center gap-2 rounded-full bg-neutral-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Check size={15} />
                        {savingEdit ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:border-neutral-800 transition-colors"
                      >
                        <X size={15} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-600 leading-relaxed">{r.text}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}