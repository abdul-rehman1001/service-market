'use client';

import { useState } from 'react';
import { Star, X, Loader, CheckCircle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  providerName: string;
  serviceName: string;
  onSuccess: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  bookingId,
  providerName,
  serviceName,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.length > 500) {
      setError('Comment must not exceed 500 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRating(0);
      setHoverRating(0);
      setComment('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Leave a Review</h3>
            <p className="text-emerald-50 text-sm mt-1">Share your experience</p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white hover:bg-emerald-600 p-2 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 mb-2">Review Submitted!</h4>
            <p className="text-slate-600">Thank you for your feedback</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Provider Info */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Provider</p>
              <p className="text-lg font-semibold text-slate-800 mt-1">{providerName}</p>
              <p className="text-sm text-slate-600">{serviceName}</p>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Rating <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-3 text-sm font-medium text-slate-700">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Comment <span className="text-slate-400">(Optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience..."
                maxLength={500}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              />
              <p className="text-xs text-slate-500 mt-2 text-right">
                {comment.length}/500 characters
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || rating === 0}
                className="flex-1 px-4 py-3 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
