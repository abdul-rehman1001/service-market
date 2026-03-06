'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Loader, AlertCircle, Star } from 'lucide-react';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  professionalism?: number;
  punctuality?: number;
  qualityOfWork?: number;
  communication?: number;
  valueForMoney?: number;
  createdAt: string;
  serviceName?: string;
  reviewer?: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

export const ReviewsPanel: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<string | null>(null);

  // Get provider ID and fetch reviews
  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const res = await fetch('/api/provider/dashboard');
        const data = await res.json();
        if (data.provider?.id) {
          setProviderId(data.provider.id);
          fetchReviews(data.provider.id);
        }
      } catch (err) {
        console.error('Failed to fetch provider info:', err);
        setError('Failed to load provider information');
      }
    };
    fetchProviderData();
  }, []);

  const fetchReviews = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/providers/${id}/reviews?limit=50`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch reviews');
      }

      // Format reviews for display
      const formattedReviews = (data.reviews || []).map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        professionalism: review.professionalism,
        punctuality: review.punctuality,
        qualityOfWork: review.qualityOfWork,
        communication: review.communication,
        valueForMoney: review.valueForMoney,
        createdAt: review.createdAt,
        serviceName: review.serviceName,
        customerName: review.reviewer ? `${review.reviewer.firstName} ${review.reviewer.lastName}` : 'Anonymous',
        reviewer: review.reviewer,
      }));

      setReviews(formattedReviews);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Customer Reviews</h2>
        <p className="text-sm text-slate-500 mt-1">
          View feedback and ratings from your customers
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <p className="text-slate-500">No reviews yet. Build your reputation by providing great service!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Reviews</p>
                <p className="text-2xl font-semibold text-slate-800">{reviews.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold text-slate-800">
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                  </p>
                  <div className="flex gap-0.5">
                    {renderRatingStars(
                      Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ul className="space-y-4">
            {reviews.map((review) => (
              <motion.li
                key={review.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Header with name and rating */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {review.customerName}
                      </p>
                      {review.serviceName && (
                        <p className="text-xs text-slate-500">for {review.serviceName}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {renderRatingStars(review.rating)}
                      <p className="text-xs text-slate-500 mt-1">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-sm text-slate-700">{review.comment}</p>

                  {/* Detailed Ratings if available */}
                  {(review.professionalism ||
                    review.punctuality ||
                    review.qualityOfWork ||
                    review.communication ||
                    review.valueForMoney) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                      {review.professionalism && (
                        <div className="text-xs">
                          <p className="text-slate-600">Professionalism</p>
                          <p className="font-semibold text-slate-800">{review.professionalism}/5</p>
                        </div>
                      )}
                      {review.punctuality && (
                        <div className="text-xs">
                          <p className="text-slate-600">Punctuality</p>
                          <p className="font-semibold text-slate-800">{review.punctuality}/5</p>
                        </div>
                      )}
                      {review.qualityOfWork && (
                        <div className="text-xs">
                          <p className="text-slate-600">Quality of Work</p>
                          <p className="font-semibold text-slate-800">{review.qualityOfWork}/5</p>
                        </div>
                      )}
                      {review.communication && (
                        <div className="text-xs">
                          <p className="text-slate-600">Communication</p>
                          <p className="font-semibold text-slate-800">{review.communication}/5</p>
                        </div>
                      )}
                      {review.valueForMoney && (
                        <div className="text-xs">
                          <p className="text-slate-600">Value for Money</p>
                          <p className="font-semibold text-slate-800">{review.valueForMoney}/5</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};
