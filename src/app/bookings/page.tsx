'use client';

import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Star, MapPin, Clock, User, MessageSquare, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { ReviewModal } from '@/components/bookings/ReviewModal';
import { motion, AnimatePresence } from 'framer-motion';

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
      return 'bg-[#F5F7F9] text-[#6B7280] border border-[#E5E7EB]';
    case 'PENDING':
      return 'bg-[#FFF4D6] text-[#8A5A00] border border-[#FDE68A]';
    case 'CONFIRMED':
      return 'bg-[#D1FAE5] text-[#007A52] border border-[#99F6C8]';
    case 'EN_ROUTE':
      return 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]';
    case 'IN_PROGRESS':
      return 'bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0]';
    case 'COMPLETED':
      return 'bg-[#D1FAE5] text-[#007A52] border border-[#A7F3D0]';
    case 'CANCELLED':
      return 'bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]';
    case 'AUTO_CANCELLED':
      return 'bg-white text-[#BE123C] border border-[#FDA4AF]';
    default:
      return 'bg-[#F5F7F9] text-[#6B7280] border border-[#E5E7EB]';
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
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    bookingId: string;
    providerName: string;
    serviceName: string;
  }>({
    isOpen: false,
    bookingId: '',
    providerName: '',
    serviceName: '',
  });

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
    <div className="min-h-screen bg-[#F5F7F9] text-[#1F2937]">
      <Header />
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 shadow-[0_10px_30px_-22px_rgba(31,41,55,0.45)] sm:mb-6 sm:p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#009966]">My bookings</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1F2937] sm:text-3xl">
            Manage all your service appointments
          </h1>
          <p className="mt-1 text-sm text-[#6B7280] sm:text-base">
            Track status, message providers, and leave reviews after completion.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          <StatCard label="Total Bookings" value={stats.total} accent="text-[#1F2937]" />
          <StatCard label="Pending" value={stats.pending} accent="text-[#8A5A00]" />
          <StatCard label="Completed" value={stats.completed} accent="text-[#007A52]" />
          <StatCard label="Cancelled" value={stats.cancelled} accent="text-[#BE123C]" />
        </div>

        {/* Tabs */}
        <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-2 shadow-[0_8px_26px_-24px_rgba(31,41,55,0.5)] sm:mt-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                activeTab === tab.key
                  ? 'bg-[#009966] text-white border-[#009966] shadow-sm'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#009966]/40 hover:text-[#007A52]'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>

        {/* Content */}
        <div className="mt-4 pb-12 sm:mt-5">
        {loading ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-8 text-center sm:p-10">
            <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#009966]" />
              <p className="text-sm font-medium text-[#6B7280]">Loading bookings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#FECACA] bg-[#FFF1F2] p-6 text-center">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-[#BE123C]" />
            <p className="font-medium text-[#BE123C]">{error}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-[#FFFFFF] p-10 text-center sm:p-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F7F9]">
              <Clock className="h-8 w-8 text-[#6B7280]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1F2937]">No bookings found</h3>
            <p className="mt-2 text-sm text-[#6B7280]">
              {activeTab === 'ALL'
                ? "You haven't booked any services yet"
                : `No ${activeTab.toLowerCase()} bookings`}
            </p>
            {activeTab === 'ALL' && (
              <Link href="/categories" className="inline-block mt-4">
                <button className="rounded-xl bg-[#009966] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A52] focus:outline-none focus:ring-2 focus:ring-[#009966] focus:ring-offset-2">
                  Browse Services
                </button>
              </Link>
            )}
          </div>
        ) : (
          <motion.div
            layout
            className="space-y-4"
          >
            {filteredBookings.map((booking) => {
              const isExpanded = expandedId === booking.id;
              const isCompleted = booking.status === 'COMPLETED';
              const hasReview = booking.review;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_14px_34px_-28px_rgba(31,41,55,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-30px_rgba(31,41,55,0.55)]"
                >
                  {/* Main Content */}
                  <div className="p-4 sm:p-5 lg:p-6">
                    <div className="mb-4 flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                        {/* Provider Avatar */}
                        <div className="shrink-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#009966] text-base font-bold text-white shadow-sm sm:h-14 sm:w-14 sm:text-lg">
                            {booking.provider.user.firstName.charAt(0)}
                            {booking.provider.user.lastName.charAt(0)}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-semibold text-[#1F2937] sm:text-lg">
                              {booking.provider.businessName ||
                                `${booking.provider.user.firstName} ${booking.provider.user.lastName}`}
                            </h3>
                            {booking.provider.averageRating > 0 && (
                              <div className="flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#FFFFFF] px-2 py-1">
                                <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                                <span className="text-xs font-semibold text-[#1F2937]">
                                  {booking.provider.averageRating.toFixed(1)}
                                </span>
                                <span className="text-xs text-[#6B7280]">
                                  ({booking.provider.totalReviews})
                                </span>
                              </div>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-[#6B7280]">{booking.service.name}</p>

                          <p className="mt-2 text-xs text-[#6B7280]">
                            Booking #{booking.bookingNumber}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        {statusIcon(booking.status)}
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:py-1.5 sm:text-xs ${statusBadge(
                            booking.status
                          )}`}
                        >
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Date & Time */}
                      <div className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-3">
                        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#6B7280]" />
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wide text-[#6B7280]">
                            Scheduled On
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#1F2937]">
                            {format(new Date(booking.scheduledStart), 'PPP')}
                          </p>
                          <p className="mt-1 text-xs text-[#6B7280]">
                            {format(new Date(booking.scheduledStart), 'p')} -{' '}
                            {format(new Date(booking.scheduledEnd), 'p')}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-3">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#6B7280]" />
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-wide text-[#6B7280]">
                            Location
                          </p>
                          <p className="mt-1 truncate text-sm font-medium text-[#1F2937]">
                            {booking.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-[#F5F7F9] px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-[#6B7280]">
                        Estimated Price
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#009966]">
                        Rs. {booking.service.minPrice.toLocaleString()} -{' '}
                        {booking.service.maxPrice.toLocaleString()}
                      </p>
                    </div>

                    {/* Cancellation Reason */}
                    {['CANCELLED', 'AUTO_CANCELLED'].includes(booking.status) &&
                      booking.cancellationReason && (
                        <div className="mb-4 rounded-lg border border-[#FECACA] bg-[#FFF1F2] p-3">
                          <p className="text-xs font-medium text-[#BE123C]">
                            Cancellation Reason
                          </p>
                          <p className="mt-1 text-sm text-[#BE123C]">
                            {booking.cancellationReason}
                          </p>
                        </div>
                      )}

                    {/* Problem Description */}
                    <div className="mb-4">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                        className="text-sm font-semibold text-[#009966] transition hover:text-[#007A52]"
                      >
                        {isExpanded ? '- Hide Details' : '+ View Details'}
                      </button>
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.p
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="mt-3 rounded-lg border border-[#E5E7EB] bg-[#F5F7F9] p-3 text-sm text-[#1F2937]"
                          >
                            {booking.problemDescription}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 border-t border-[#E5E7EB] pt-4 sm:flex-row">
                      <Link href={`/messages?bookingId=${booking.id}`} className="flex-1">
                        <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#1F2937] transition hover:border-[#009966]/40 hover:text-[#007A52] focus:outline-none focus:ring-2 focus:ring-[#009966] focus:ring-offset-2">
                          <MessageSquare className="h-4 w-4" />
                          Message Provider
                        </button>
                      </Link>

                      {isCompleted && !hasReview && (
                        <button
                          onClick={() =>
                            setReviewModal({
                              isOpen: true,
                              bookingId: booking.id,
                              providerName:
                                booking.provider.businessName ||
                                `${booking.provider.user.firstName} ${booking.provider.user.lastName}`,
                              serviceName: booking.service.name,
                            })
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#009966] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#007A52] focus:outline-none focus:ring-2 focus:ring-[#009966] focus:ring-offset-2"
                        >
                          <Star className="h-4 w-4" />
                          Leave Review
                        </button>
                      )}

                      {hasReview && (
                        <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#A7F3D0] bg-[#D1FAE5] px-4 py-2.5">
                          <Star className="h-4 w-4 fill-[#007A52] text-[#007A52]" />
                          <span className="text-sm font-medium text-[#007A52]">Review Left</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() =>
          setReviewModal({ isOpen: false, bookingId: '', providerName: '', serviceName: '' })
        }
        bookingId={reviewModal.bookingId}
        providerName={reviewModal.providerName}
        serviceName={reviewModal.serviceName}
        onSuccess={() => {
          // Refresh bookings to show updated review status
          fetch('/api/bookings')
            .then((res) => res.json())
            .then((data) => {
              if (data.bookings) {
                setBookings(data.bookings);
              }
            })
            .catch((err) => console.error('Failed to refresh bookings:', err));
        }}
      />
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_8px_24px_-22px_rgba(31,41,55,0.45)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">{label}</p>
      <p className={`mt-1 text-2xl font-bold sm:text-3xl ${accent || "text-[#1F2937]"}`}>{value}</p>
    </div>
  );
}
