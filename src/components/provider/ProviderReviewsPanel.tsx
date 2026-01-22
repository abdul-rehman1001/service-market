'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface Review {
  id: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO string
  response?: string; // Provider response
}

export const ProviderReviewsPanel: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'r1',
      customerName: 'Sarah Jenkins',
      rating: 5,
      comment: 'Excellent work, very professional!',
      date: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      id: 'r2',
      customerName: 'Michael Chen',
      rating: 4,
      comment: 'Good service but arrived late.',
      date: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    },
  ]);

  const handleReply = (id: string) => {
    const review = reviews.find((r) => r.id === id);
    if (!review) return;

    const now = new Date();
    const reviewDate = new Date(review.date);
    const diffDays = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > 30) {
      alert('Cannot reply. More than 30 days have passed since this review.');
      return;
    }

    const response = prompt('Enter your response (max 100 characters):', review.response || '');
    if (response !== null) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, response: response.slice(0, 100) } : r))
      );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      {reviews.length === 0 && <p>No reviews yet.</p>}

      <ul className="space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="bg-white p-4 rounded-lg border shadow-sm">
            <p>
              <strong>{r.customerName}</strong> rated <strong>{r.rating} ⭐</strong>
            </p>
            <p className="text-gray-600">{r.comment}</p>
            <p className="text-sm text-gray-400">{format(new Date(r.date), 'PPP')}</p>

            {r.response && (
              <div className="mt-2 pl-4 border-l-2 border-emerald-500 text-gray-700">
                Provider Response: {r.response}
              </div>
            )}

            <button
              className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded text-sm"
              onClick={() => handleReply(r.id)}
            >
              {r.response ? 'Edit Response' : 'Reply'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
