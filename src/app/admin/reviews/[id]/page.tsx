"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Star, Trash2, User, Mail, Phone,
  Briefcase, Calendar, MapPin, Hash,
} from "lucide-react";
import { authenticatedFetch } from "@/lib/authenticatedFetch";

interface ReviewDetail {
  id: string;
  rating: number;
  comment: string | null;
  professionalism: number | null;
  punctuality: number | null;
  qualityOfWork: number | null;
  communication: number | null;
  valueForMoney: number | null;
  createdAt: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage: string | null;
  };
  reviewee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage: string | null;
  };
  booking: {
    id: string;
    bookingNumber: string;
    status: string;
    scheduledStart: string;
    location: string;
    service: {
      id: string;
      name: string;
      category: { name: string };
    };
  };
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"}
        />
      ))}
      <span className="ml-2 text-sm font-medium">{rating}/5</span>
    </div>
  );
}

function SubRatingBar({ label, value }: { label: string; value: number | null }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600 w-36">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2.5 max-w-[200px]">
        <div
          className="bg-yellow-500 h-2.5 rounded-full"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="text-sm font-medium w-8 text-right">{value}/5</span>
    </div>
  );
}

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReview();
  }, []);

  const fetchReview = async () => {
    try {
      const res = await authenticatedFetch(`/api/admin/reviews/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch review");
      const data = await res.json();
      setReview(data.review);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!review) return;
    setActionLoading(true);
    try {
      const res = await authenticatedFetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review");
      router.push("/admin/reviews");
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="ml-3 text-slate-500">Loading review details...</span>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-red-600 mb-4">{error || "Review not found"}</p>
        <Link href="/admin/reviews" className="text-emerald-600 hover:underline">
          &larr; Back to reviews
        </Link>
      </div>
    );
  }

  const hasSubRatings =
    review.professionalism !== null || review.punctuality !== null ||
    review.qualityOfWork !== null || review.communication !== null ||
    review.valueForMoney !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link
          href="/admin/reviews"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600"
        >
          <ArrowLeft size={16} /> Back to Review Management
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
        >
          <Trash2 size={16} /> Delete Review
        </button>
      </div>

      {/* Rating card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-yellow-600">{review.rating}</p>
            <Stars rating={review.rating} size={18} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-1">{review.booking.service.name}</h2>
            <p className="text-sm text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">
                {review.booking.service.category.name}
              </span>
              <span className="ml-3">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Comment */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h3 className="font-semibold text-lg">Comment</h3>
        {review.comment ? (
          <p className="text-slate-700 leading-relaxed">{review.comment}</p>
        ) : (
          <p className="text-slate-400 italic">No comment provided</p>
        )}
      </div>

      {/* Sub-ratings */}
      {hasSubRatings && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg">Detailed Ratings</h3>
          <div className="space-y-3">
            <SubRatingBar label="Professionalism" value={review.professionalism} />
            <SubRatingBar label="Punctuality" value={review.punctuality} />
            <SubRatingBar label="Quality of Work" value={review.qualityOfWork} />
            <SubRatingBar label="Communication" value={review.communication} />
            <SubRatingBar label="Value for Money" value={review.valueForMoney} />
          </div>
        </div>
      )}

      {/* Reviewer & Reviewee */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviewer */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <User size={18} /> Reviewer (Customer)
          </h3>
          <div className="flex items-center gap-4">
            {review.reviewer.profileImage ? (
              <img src={review.reviewer.profileImage} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-200" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-lg">
                {review.reviewer.firstName[0]}{review.reviewer.lastName[0]}
              </div>
            )}
            <div>
              <p className="font-semibold">{review.reviewer.firstName} {review.reviewer.lastName}</p>
              <Link href={`/admin/users/${review.reviewer.id}`} className="text-xs text-emerald-600 hover:underline">
                View profile
              </Link>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400" />
              <span>{review.reviewer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400" />
              <span>{review.reviewer.phone}</span>
            </div>
          </div>
        </div>

        {/* Reviewee (Provider) */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Briefcase size={18} /> Reviewee (Provider)
          </h3>
          <div className="flex items-center gap-4">
            {review.reviewee.profileImage ? (
              <img src={review.reviewee.profileImage} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-200" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
                {review.reviewee.firstName[0]}{review.reviewee.lastName[0]}
              </div>
            )}
            <div>
              <p className="font-semibold">{review.reviewee.firstName} {review.reviewee.lastName}</p>
              <Link href={`/admin/users/${review.reviewee.id}`} className="text-xs text-emerald-600 hover:underline">
                View profile
              </Link>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400" />
              <span>{review.reviewee.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400" />
              <span>{review.reviewee.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking reference */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Hash size={18} /> Booking Reference
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Booking #</p>
            <p className="font-mono font-medium">{review.booking.bookingNumber}</p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="font-medium capitalize">{review.booking.status.replace(/_/g, " ").toLowerCase()}</p>
          </div>
          <div>
            <p className="text-slate-500">Scheduled</p>
            <p className="font-medium">
              {new Date(review.booking.scheduledStart).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-slate-500">Location</p>
            <p className="font-medium">{review.booking.location}</p>
          </div>
          <div>
            <Link
              href={`/admin/bookings/${review.booking.id}`}
              className="text-emerald-600 hover:underline text-sm"
            >
              View booking details &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-red-600">Delete Review</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete this review? The provider&apos;s average rating will be recalculated. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-md border text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
