"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, MapPin, Calendar, Clock, User, Phone, Mail,
  Star, Briefcase, XCircle, Tag, FileText, MessageSquare,
} from "lucide-react";

interface BookingDetail {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  location: string;
  problemDescription: string;
  cancelledBy: string | null;
  cancellationReason: string | null;
  holdExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    name: string;
    description: string;
    minPrice: number;
    maxPrice: number;
    defaultDurationMinutes: number;
    category: { id: string; name: string };
  };
  seeker: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage: string | null;
    address: string;
    city: string | null;
  };
  provider: {
    id: string;
    businessName: string | null;
    averageRating: number;
    totalReviews: number;
    totalJobsCompleted: number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      profileImage: string | null;
    };
  };
  review: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
  providerResponse: {
    type: string;
    createdAt: string;
  } | null;
}

const statusColors: Record<string, string> = {
  HOLD: "bg-slate-100 text-slate-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  EN_ROUTE: "bg-indigo-100 text-indigo-700",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  AUTO_CANCELLED: "bg-orange-100 text-orange-700",
};

const formatStatus = (s: string) => s.replace(/_/g, " ");

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, []);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/admin/bookings/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch booking");
      const data = await res.json();
      setBooking(data.booking);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking || !cancelReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });
      if (!res.ok) throw new Error("Failed to cancel booking");
      setShowCancelModal(false);
      setCancelReason("");
      await fetchBooking();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const isCancellable = (status: string) =>
    !["COMPLETED", "CANCELLED", "AUTO_CANCELLED"].includes(status);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="ml-3 text-slate-500">Loading booking details...</span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-red-600 mb-4">{error || "Booking not found"}</p>
        <Link href="/admin/bookings" className="text-emerald-600 hover:underline">
          &larr; Back to bookings
        </Link>
      </div>
    );
  }

  const providerName = booking.provider.businessName || `${booking.provider.user.firstName} ${booking.provider.user.lastName}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600"
        >
          <ArrowLeft size={16} /> Back to Booking Management
        </Link>
        {isCancellable(booking.status) && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
          >
            <XCircle size={16} /> Cancel Booking
          </button>
        )}
      </div>

      {/* Booking header card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold">Booking #{booking.bookingNumber}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[booking.status] || "bg-gray-100"}`}>
                {formatStatus(booking.status)}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Created {new Date(booking.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Last updated</p>
            <p className="font-medium text-slate-700">
              {new Date(booking.updatedAt).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service details */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Briefcase size={18} /> Service Details
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-500">Service Name</p>
              <p className="font-medium">{booking.service.name}</p>
            </div>
            <div>
              <p className="text-slate-500">Description</p>
              <p className="text-slate-700">{booking.service.description}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-slate-500">Price Range</p>
                <p className="font-medium">
                  Rs. {Number(booking.service.minPrice).toLocaleString()} – Rs. {Number(booking.service.maxPrice).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Duration</p>
                <p className="font-medium">{booking.service.defaultDurationMinutes} min</p>
              </div>
            </div>
            <div>
              <p className="text-slate-500">Category</p>
              <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-600">
                {booking.service.category.name}
              </span>
            </div>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Calendar size={18} /> Schedule & Location
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-slate-400" />
              <div>
                <p className="text-slate-500">Date</p>
                <p className="font-medium">
                  {new Date(booking.scheduledStart).toLocaleDateString("en-US", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-slate-400" />
              <div>
                <p className="text-slate-500">Time</p>
                <p className="font-medium">
                  {new Date(booking.scheduledStart).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  {" – "}
                  {new Date(booking.scheduledEnd).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-slate-400" />
              <div>
                <p className="text-slate-500">Location</p>
                <p className="font-medium">{booking.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText size={16} className="text-slate-400 mt-0.5" />
              <div>
                <p className="text-slate-500">Problem Description</p>
                <p className="text-slate-700">{booking.problemDescription}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer (Seeker) */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <User size={18} /> Customer
          </h3>
          <div className="flex items-center gap-4 mb-3">
            {booking.seeker.profileImage ? (
              <img src={booking.seeker.profileImage} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-200" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-lg">
                {booking.seeker.firstName[0]}{booking.seeker.lastName[0]}
              </div>
            )}
            <div>
              <p className="font-semibold">{booking.seeker.firstName} {booking.seeker.lastName}</p>
              <Link href={`/admin/users/${booking.seeker.id}`} className="text-xs text-emerald-600 hover:underline">
                View profile
              </Link>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400" />
              <span>{booking.seeker.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400" />
              <span>{booking.seeker.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-slate-400" />
              <span>{booking.seeker.address}{booking.seeker.city ? `, ${booking.seeker.city}` : ""}</span>
            </div>
          </div>
        </div>

        {/* Provider */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Briefcase size={18} /> Provider
          </h3>
          <div className="flex items-center gap-4 mb-3">
            {booking.provider.user.profileImage ? (
              <img src={booking.provider.user.profileImage} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-200" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg">
                {booking.provider.user.firstName[0]}{booking.provider.user.lastName[0]}
              </div>
            )}
            <div>
              <p className="font-semibold">{providerName}</p>
              <Link href={`/admin/users/${booking.provider.user.id}`} className="text-xs text-emerald-600 hover:underline">
                View profile
              </Link>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400" />
              <span>{booking.provider.user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400" />
              <span>{booking.provider.user.phone}</span>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                <span className="font-medium">{Number(booking.provider.averageRating).toFixed(1)}</span>
                <span className="text-slate-400">({booking.provider.totalReviews})</span>
              </div>
              <span className="text-slate-400">|</span>
              <span>{booking.provider.totalJobsCompleted} jobs completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Provider response */}
      {booking.providerResponse && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-2">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquare size={18} /> Provider Response
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">Response:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              booking.providerResponse.type === "ACCEPTED"
                ? "bg-emerald-100 text-emerald-700"
                : booking.providerResponse.type === "REJECTED"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
            }`}>
              {booking.providerResponse.type.replace(/_/g, " ")}
            </span>
            <span className="text-slate-400">
              on {new Date(booking.providerResponse.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      )}

      {/* Cancellation info */}
      {booking.status === "CANCELLED" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-2">
          <h3 className="font-semibold text-lg text-red-700">Cancellation Details</h3>
          <div className="text-sm space-y-1">
            <p><span className="text-slate-500">Cancelled by:</span> <span className="font-medium capitalize">{booking.cancelledBy?.toLowerCase() || "Unknown"}</span></p>
            {booking.cancellationReason && (
              <p><span className="text-slate-500">Reason:</span> {booking.cancellationReason}</p>
            )}
          </div>
        </div>
      )}

      {/* Review */}
      {booking.review && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Star size={18} /> Review
          </h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={16}
                className={i < booking.review!.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"}
              />
            ))}
            <span className="ml-2 text-sm font-medium">{booking.review.rating}/5</span>
          </div>
          {booking.review.comment && (
            <p className="text-sm text-slate-700">{booking.review.comment}</p>
          )}
          <p className="text-xs text-slate-400">
            {new Date(booking.review.createdAt).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </div>
      )}

      {/* Cancel modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-red-600">Cancel Booking</h3>
            <p className="text-sm text-slate-600">
              You are about to cancel booking <strong>#{booking.bookingNumber}</strong>. This action cannot be undone.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason..."
              rows={3}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                className="px-4 py-2 rounded-md border text-sm hover:bg-slate-50"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                disabled={!cancelReason.trim() || actionLoading}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
