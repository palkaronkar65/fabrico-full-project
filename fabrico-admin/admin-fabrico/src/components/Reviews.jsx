import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaReply } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const API = `${import.meta.env.VITE_API_URL}/api`;

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API}/reviews`);
      setReviews(res.data);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      const res = await axios.put(`${API}/reviews/${reviewId}/reply`, { replyText });
      setReviews(prev => prev.map(r => r._id === reviewId ? res.data : r));
      setReplyingTo(null);
      setReplyText('');
      toast.success('Reply added');
    } catch (err) {
      toast.error('Failed to add reply');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await axios.delete(`${API}/reviews/${reviewId}`);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      toast.success('Review deleted');
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  if (loading) return <div className="p-6 text-center">Loading reviews...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Product Reviews</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin Reply</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map(review => (
              <tr key={review._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {review.product?.name || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {review.user?.name} ({review.user?.email})
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                  {review.reviewText}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                  {replyingTo === review._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Reply..."
                        className="border rounded px-2 py-1 w-full text-sm"
                      />
                      <button
                        onClick={() => handleReply(review._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    review.adminReply || '—'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {!review.adminReply && (
                      <button
                        onClick={() => setReplyingTo(review._id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Reply"
                      >
                        <FaReply />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}