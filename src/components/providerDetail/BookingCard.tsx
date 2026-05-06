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
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5 sticky top-6 border border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Book This Service</h3>
          <p className="text-xs text-slate-500">Select date, pick a slot, reserve, then confirm.</p>
        </div>
        <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {statusLabel(booking?.status)}
        </div>
      </div>

      {minPrice > 0 && (
        <div className="flex items-center gap-2 text-emerald-600">
          <Tag className="w-5 h-5" />
          <div>
            <p className="text-2xl font-bold">{formatPKR(minPrice)}</p>
            <p className="text-xs text-gray-500">Starting from</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Service *</label>
          <select
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date *</label>
          <input
            type="date"
            min={minDate}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots *</label>
          {slotsLoading ? (
            <p className="text-sm text-slate-500">Loading slots...</p>
          ) : slotsError ? (
            <p className="text-sm text-rose-600">{slotsError}</p>
          ) : slots.length === 0 ? (
            <p className="text-sm text-slate-500">No slots available for the selected date.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start;
                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-700'
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
          <input
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Street address or area"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description *</label>
          <textarea
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Describe your issue"
            rows={3}
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
          />
        </div>
      </div>

      {statusMessage && (
        <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          {statusMessage}
        </div>
      )}

      <div className="space-y-3">
        <button
          className="w-full bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-slate-400"
          onClick={handleReserve}
          disabled={reserveLoading || !provider.isAvailable}
        >
          {reserveLoading ? 'Reserving...' : 'Reserve Slot'}
        </button>

        {booking?.status === 'HOLD' && !holdExpired && (
          <button
            className="w-full border-2 border-emerald-600 text-emerald-700 py-2.5 rounded-lg hover:bg-emerald-50 transition-colors font-medium disabled:opacity-60"
            onClick={handleConfirm}
            disabled={confirmLoading}
          >
            {confirmLoading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        )}
      </div>

      {booking?.status && (
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Reserved for</span>
            <span className="font-medium text-slate-900">{toDateLabel(booking.scheduledStart)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Time</span>
            <span className="font-medium text-slate-900">
              {toTimeLabel(booking.scheduledStart)} - {toTimeLabel(booking.scheduledEnd)}
            </span>
          </div>

          {booking.status === 'HOLD' && booking.holdExpiresAt && (
            <div className="flex items-center justify-between text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
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
            <div className="flex items-center justify-between text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
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
                  className={`rounded-lg px-2 py-1 text-center border ${
                    stepActive
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                      : 'border-slate-200 text-slate-500'
                  }`}
                >
                  {step}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="pt-3 border-t space-y-2 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Response window</span>
          <span className="font-medium text-slate-900">30 minutes</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Jobs Completed</span>
          <span className="font-medium text-slate-900">{provider.completedBookingsCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Experience</span>
          <span className="font-medium text-slate-900">{provider.yearsOfExperience} years</span>
        </div>
      </div>
    </div>
  );
}
