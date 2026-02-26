'use client';

import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Star, MapPin, Clock, User, MessageSquare, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';

interface Provider {
  id: string;
  businessName?: string;
  averageRating: number;
  totalReviews: number;
  user: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
}

interface Service {
  id: string;
  name: string;
  minPrice: number;
  maxPrice: number;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
}

interface Booking {
  id: string;
  bookingNumber: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  location: string;
  problemDescription: string;
  cancellationReason?: string;
  provider: Provider;
  service: Service;
  review?: Review | null;
  createdAt: string;
}

const TABS = [
  { key: 'ALL', label: 'All Bookings', statuses: [] },
  { key: 'PENDING', label: 'Pending', statuses: ['PENDING', 'HOLD'] },
  { key: 'CONFIRMED', label: 'Confirmed', statuses: ['CONFIRMED'] },
  { key: 'IN_PROGRESS', label: 'In Progress', statuses: ['IN_PROGRESS', 'EN_ROUTE'] },
  { key: 'COMPLETED', label: 'Completed', statuses: ['COMPLETED'] },
  { key: 'CANCELLED', label: 'Cancelled', statuses: ['CANCELLED', 'AUTO_CANCELLED'] },
];

const statusBadge = (status: string) => {
  switch (status) {
    case 'HOLD':
      return 'bg-slate-100 text-slate-700';
    case 'PENDING':
      return 'bg-amber-100 text-amber-800';
    case 'CONFIRMED':
      return 'bg-emerald-100 text-emerald-800';
    case 'EN_ROUTE':
      return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS':
      return 'bg-sky-100 text-sky-800';
    case 'COMPLETED':
      return 'bg-purple-100 text-purple-800';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800';
    case 'AUTO_CANCELLED':
      return 'border border-rose-400 text-rose-700 bg-white';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'PENDING':
    case 'HOLD':
      return <AlertCircle className="w-5 h-5 text-amber-600" />;
    case 'CONFIRMED':
    case 'EN_ROUTE':
    case 'IN_PROGRESS':
      return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    case 'COMPLETED':
      return <CheckCircle className="w-5 h-5 text-purple-600" />;
    case 'CANCELLED':
    case 'AUTO_CANCELLED':
      return <XCircle className="w-5 h-5 text-rose-600" />;
    default:
      return null;
  }
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/bookings');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch bookings');
        }
        setBookings(data.bookings || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'ALL') return bookings;
    const tab = TABS.find((t) => t.key === activeTab);
    if (!tab) return [];
    return bookings.filter((booking) => tab.statuses.includes(booking.status));
  }, [bookings, activeTab]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => ['PENDING', 'HOLD'].includes(b.status)).length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      cancelled: bookings.filter((b) => ['CANCELLED', 'AUTO_CANCELLED'].includes(b.status)).length,
    };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      {/* Stats */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total Bookings</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Pending</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Completed</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Cancelled</p>
            <p className="text-3xl font-bold text-rose-600 mt-1">{stats.cancelled}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 rounded-full text-sm font-medium border transition whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin" />
              <p className="text-slate-500">Loading bookings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
            <p className="text-rose-800 font-medium">{error}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No bookings found</h3>
            <p className="text-sm text-slate-500 mt-2">
              {activeTab === 'ALL'
                ? "You haven't booked any services yet"
                : `No ${activeTab.toLowerCase()} bookings`}
            </p>
            {activeTab === 'ALL' && (
              <Link href="/categories" className="inline-block mt-4">
                <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-medium">
                  Browse Services
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const isExpanded = expandedId === booking.id;
              const isCompleted = booking.status === 'COMPLETED';
              const hasReview = booking.review;

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Main Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Provider Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                            {booking.provider.user.firstName.charAt(0)}
                            {booking.provider.user.lastName.charAt(0)}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-slate-800 truncate">
                              {booking.provider.businessName ||
                                `${booking.provider.user.firstName} ${booking.provider.user.lastName}`}
                            </h3>
                            {booking.provider.averageRating > 0 && (
                              <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span className="text-xs font-semibold text-slate-700">
                                  {booking.provider.averageRating.toFixed(1)}
                                </span>
                                <span className="text-xs text-slate-500">
                                  ({booking.provider.totalReviews})
                                </span>
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-slate-600 mt-1">{booking.service.name}</p>

                          <p className="text-xs text-slate-500 mt-2">
                            Booking #{booking.bookingNumber}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        {statusIcon(booking.status)}
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusBadge(
                            booking.status
                          )}`}
                        >
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Date & Time */}
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Scheduled On
                          </p>
                          <p className="text-sm font-medium text-slate-800 mt-1">
                            {format(new Date(booking.scheduledStart), 'PPP')}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {format(new Date(booking.scheduledStart), 'p')} -{' '}
                            {format(new Date(booking.scheduledEnd), 'p')}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Location
                          </p>
                          <p className="text-sm font-medium text-slate-800 mt-1 truncate">
                            {booking.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="py-3 bg-slate-50 px-4 rounded-lg mb-4">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Estimated Price
                      </p>
                      <p className="text-lg font-bold text-emerald-600 mt-1">
                        Rs. {booking.service.minPrice.toLocaleString()} -{' '}
                        {booking.service.maxPrice.toLocaleString()}
                      </p>
                    </div>

                    {/* Cancellation Reason */}
                    {['CANCELLED', 'AUTO_CANCELLED'].includes(booking.status) &&
                      booking.cancellationReason && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg mb-4">
                          <p className="text-xs text-rose-700 font-medium">
                            Cancellation Reason
                          </p>
                          <p className="text-sm text-rose-700 mt-1">
                            {booking.cancellationReason}
                          </p>
                        </div>
                      )}

                    {/* Problem Description */}
                    <div
                      className="mb-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    >
                      <button className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 transition">
                        {isExpanded ? '- Hide Details' : '+ View Details'}
                      </button>
                      {isExpanded && (
                        <p className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-200">
                          {booking.problemDescription}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <Link href={`/messages?bookingId=${booking.id}`} className="flex-1">
                        <button className="w-full px-4 py-2.5 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-700 transition flex items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Message Provider
                        </button>
                      </Link>

                      {isCompleted && !hasReview && (
                        <Link href={`/bookings/${booking.id}/review`} className="flex-1">
                          <button className="w-full px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2">
                            <Star className="w-4 h-4" />
                            Leave Review
                          </button>
                        </Link>
                      )}

                      {hasReview && (
                        <div className="flex-1 px-4 py-2.5 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center gap-2">
                          <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
                          <span className="text-sm text-purple-700 font-medium">Review Left</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
