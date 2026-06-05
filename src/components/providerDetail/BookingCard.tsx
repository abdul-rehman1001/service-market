'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clock, Tag } from 'lucide-react';
import { formatPKR } from '@/lib/utils';
import { ProviderProfileType } from '@/types/provider';
import { CountdownTimer } from '@/components/bookings/CountdownTimer';

interface Props {
  provider: ProviderProfileType;
}

type Slot = {
  startTime: string;
  endTime: string;
  start: string;
  end: string;
};

type BookingState = {
  id: string;
  status: string;
  holdExpiresAt?: string | null;
  providerResponseDeadline?: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  cancellationReason?: string | null;
};

const statusLabel = (status?: string | null) => {
  switch (status) {
    case 'HOLD':
      return 'Reserved';
    case 'PENDING':
      return 'Waiting for provider';
    case 'CONFIRMED':
      return 'Confirmed';
    case 'AUTO_CANCELLED':
      return 'Auto cancelled';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return 'Not started';
  }
};

const toDateLabel = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const toTimeLabel = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function BookingCard({ provider }: Props) {
  const minPrice = provider.services.length > 0
    ? Math.min(...provider.services.map((s) => Number(s.minPrice)))
    : 0;

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [booking, setBooking] = useState<BookingState | null>(null);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const fetchSlots = async () => {
    if (!selectedServiceId || !selectedDate) return;
    try {
      setSlotsLoading(true);
      setSlotsError(null);
      setSelectedSlot(null);
      const response = await fetch(
        `/api/providers/${provider.userId}/slots?serviceId=${selectedServiceId}&date=${selectedDate}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch slots');
      }
      setSlots(data.slots || []);
    } catch (error) {
      setSlotsError(error instanceof Error ? error.message : 'Failed to load slots');
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [selectedServiceId, selectedDate]);

  const refreshBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();
      if (response.ok) {
        setBooking(data.booking);
      }
    } catch (error) {
      console.error('Failed to refresh booking', error);
    }
  };

  useEffect(() => {
    if (!booking?.id) return undefined;
    const interval = setInterval(() => refreshBooking(booking.id), 15000);
    return () => clearInterval(interval);
  }, [booking?.id]);

  const handleReserve = async () => {
    if (!selectedServiceId || !selectedDate || !selectedSlot) {
      setStatusMessage('Select a service, date, and time slot before reserving.');
      return;
    }

    if (!location.trim() || !problemDescription.trim()) {
      setStatusMessage('Location and problem description are required.');
      return;
    }

    try {
      setReserveLoading(true);
      setStatusMessage(null);
      const response = await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          scheduledDate: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          location,
          problemDescription,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reserve slot');
      }
      setBooking(data.booking);
      setStatusMessage('Slot reserved. Confirm within 10 minutes.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to reserve slot');
    } finally {
      setReserveLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!booking?.id) return;
    try {
      setConfirmLoading(true);
      setStatusMessage(null);
      const response = await fetch(`/api/bookings/${booking.id}/confirm`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm booking');
      }
      setBooking(data.booking);
      setStatusMessage('Booking confirmed. Waiting for provider response.');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to confirm booking');
    } finally {
      setConfirmLoading(false);
    }
  };

  const holdExpired = booking?.status === 'HOLD' && booking.holdExpiresAt
    ? new Date(booking.holdExpiresAt) <= new Date()
    : false;

  return (
    <div className="space-y-5 rounded-3xl border border-[#E2E8F0]/80 bg-white/95 p-5 shadow-[0_4px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6 lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
            Booking
          </p>
          <h3 className="mt-1 text-lg font-bold tracking-tight text-[#0F172A] sm:text-xl">
            Book This Service
          </h3>
          <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
            Select date, pick a slot, reserve, then confirm.
          </p>
        </div>
        <div className="shrink-0 rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#0F172A] ring-1 ring-[#E2E8F0]">
          {statusLabel(booking?.status)}
        </div>
      </div>

      {minPrice > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <Tag className="h-5 w-5 text-[#10B981]" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-[#059669] sm:text-2xl">
              {formatPKR(minPrice)}
            </p>
            <p className="text-xs font-medium text-[#64748B]">Starting from</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
            Select Service *
          </label>
          <select
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3 text-sm text-[#0F172A] transition focus:border-[#10B981]/50 focus:outline-none focus:ring-4 focus:ring-[#10B981]/10"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            <option value="">Choose a service</option>
            {provider.services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - {formatPKR(service.minPrice)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
            Select Date *
          </label>
          <input
            type="date"
            min={minDate}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3 text-sm text-[#0F172A] transition focus:border-[#10B981]/50 focus:outline-none focus:ring-4 focus:ring-[#10B981]/10"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
            Available Slots *
          </label>
          {slotsLoading ? (
            <p className="text-sm text-[#64748B]">Loading slots...</p>
          ) : slotsError ? (
            <p className="text-sm text-rose-600">{slotsError}</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-[#64748B]">No slots available for the selected date.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start;
                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition sm:text-sm ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-md shadow-emerald-500/25'
                        : 'border border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#10B981]/40 hover:bg-emerald-50/50'
                    }`}
                  >
                    {slot.startTime} - {slot.endTime}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
            Location *
          </label>
          <input
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3 text-sm text-[#0F172A] transition focus:border-[#10B981]/50 focus:outline-none focus:ring-4 focus:ring-[#10B981]/10"
            placeholder="Street address or area"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">
            Problem Description *
          </label>
          <textarea
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white p-3 text-sm text-[#0F172A] transition focus:border-[#10B981]/50 focus:outline-none focus:ring-4 focus:ring-[#10B981]/10"
            placeholder="Describe your issue"
            rows={3}
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
          />
        </div>
      </div>

      {statusMessage && (
        <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
          {statusMessage}
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          className="w-full rounded-2xl bg-gradient-to-r from-[#10B981] to-[#059669] py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          onClick={handleReserve}
          disabled={reserveLoading || !provider.isAvailable}
        >
          {reserveLoading ? 'Reserving...' : 'Reserve Slot'}
        </button>

        {booking?.status === 'HOLD' && !holdExpired && (
          <button
            type="button"
            className="w-full rounded-2xl border-2 border-[#10B981] py-3 text-sm font-semibold text-[#059669] transition hover:bg-emerald-50/50 disabled:opacity-60"
            onClick={handleConfirm}
            disabled={confirmLoading}
          >
            {confirmLoading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        )}
      </div>

      {booking?.status && (
        <div className="space-y-3 border-t border-[#E2E8F0]/80 pt-4">
          <div className="flex items-center justify-between text-sm text-[#64748B]">
            <span>Reserved for</span>
            <span className="font-semibold text-[#0F172A]">
              {toDateLabel(booking.scheduledStart)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-[#64748B]">
            <span>Time</span>
            <span className="font-semibold text-[#0F172A]">
              {toTimeLabel(booking.scheduledStart)} - {toTimeLabel(booking.scheduledEnd)}
            </span>
          </div>

          {booking.status === 'HOLD' && booking.holdExpiresAt && (
            <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Hold expires in</span>
              </div>
              <CountdownTimer
                target={booking.holdExpiresAt}
                onExpire={() => refreshBooking(booking.id)}
              />
            </div>
          )}

          {booking.status === 'PENDING' && booking.providerResponseDeadline && (
            <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Waiting for provider</span>
              </div>
              <CountdownTimer target={booking.providerResponseDeadline} />
            </div>
          )}

          {booking.cancellationReason && (
            <div className="text-sm text-rose-600">{booking.cancellationReason}</div>
          )}

          <div className="grid grid-cols-3 gap-2 text-xs">
            {['Reserved', 'Waiting', 'Confirmed'].map((step, index) => {
              const stepActive =
                (index === 0 && ['HOLD', 'PENDING', 'CONFIRMED'].includes(booking.status)) ||
                (index === 1 && ['PENDING', 'CONFIRMED'].includes(booking.status)) ||
                (index === 2 && booking.status === 'CONFIRMED');
              return (
                <div
                  key={step}
                  className={`rounded-xl px-2 py-2 text-center font-semibold ${
                    stepActive
                      ? 'bg-emerald-50 text-[#059669] ring-1 ring-[#10B981]/30'
                      : 'bg-[#F8FAFC] text-[#94A3B8] ring-1 ring-[#E2E8F0]'
                  }`}
                >
                  {step}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2.5 border-t border-[#E2E8F0]/80 pt-4 text-sm text-[#64748B]">
        <div className="flex items-center justify-between">
          <span>Response window</span>
          <span className="font-semibold text-[#0F172A]">30 minutes</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Jobs completed</span>
          <span className="font-semibold text-[#0F172A]">
            {provider.completedBookingsCount}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Experience</span>
          <span className="font-semibold text-[#0F172A]">
            {provider.yearsOfExperience} years
          </span>
        </div>
      </div>
    </div>
  );
}
