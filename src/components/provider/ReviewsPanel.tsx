'use client';

import { motion } from 'framer-motion';

interface Review {
  id: string;
  customerName: string;
  rating: number; // out of 5
  comment: string;
  response?: string;
}

export const ReviewsPanel: React.FC = () => {
  // Sample reviews (replace with API data)
  const reviews: Review[] = [
    { id: 'r1', customerName: 'Sarah Jenkins', rating: 5, comment: 'Great service! Very professional.' },
    { id: 'r2', customerName: 'John Doe', rating: 4, comment: 'Good work, but arrived a bit late.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Customer Reviews</h2>
        <p className="text-sm text-slate-500 mt-1">
          Respond to reviews (max 100 characters) and display below the original review
        </p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-slate-500">No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <motion.li
              key={review.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {review.customerName}{' '}
                    <span className="font-normal text-slate-600">rated {review.rating}/5</span>
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{review.comment}</p>
                  {review.response && (
                    <p className="mt-2 text-sm text-blue-600">Your response: {review.response}</p>
                  )}
                </div>
                <button
                  className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition active:scale-95"
                  onClick={() => {
                    const reply = prompt('Enter your response (max 100 characters):', review.response || '');
                    if (reply !== null) {
                      review.response = reply.slice(0, 100); // limit 100 chars
                      // Ideally, update the state or backend API here
                    }
                  }}
                >
                  Reply
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};
