'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import {
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle2,
  Loader2,
  X,
  Plus,
  RefreshCw,
  CalendarDays,
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { index: 0, name: 'Sunday', abbr: 'Sun' },
  { index: 1, name: 'Monday', abbr: 'Mon' },
  { index: 2, name: 'Tuesday', abbr: 'Tue' },
  { index: 3, name: 'Wednesday', abbr: 'Wed' },
  { index: 4, name: 'Thursday', abbr: 'Thu' },
  { index: 5, name: 'Friday', abbr: 'Fri' },
  { index: 6, name: 'Saturday', abbr: 'Sat' },
];

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface UnavailableDate {
  id: string;
  date: string;
  reason?: string;
}

type AlertType = 'success' | 'error' | 'info';

const inputClass =
  'w-full rounded-xl border border-[#6FCF97]/45 bg-white px-3 py-2.5 text-sm text-[#1F6F5F] shadow-sm transition focus:border-[#2FA084] focus:outline-none focus:ring-2 focus:ring-[#2FA084]/25';

const labelClass = 'mb-1.5 block text-xs font-semibold text-[#1F6F5F]';

const primaryBtnClass =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2FA084] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1F6F5F] disabled:cursor-not-allowed disabled:opacity-50';

export const AvailabilityPanel: React.FC = () => {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [unavailableDate, setUnavailableDate] = useState<string>('');
  const [unavailableReason, setUnavailableReason] = useState<string>('');

  const showAlert = useCallback((type: AlertType, message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [availRes, unavailRes] = await Promise.all([
        fetch('/api/providers/availability'),
        fetch('/api/providers/unavailability'),
      ]);

      if (!availRes.ok || !unavailRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const availData = await availRes.json();
      const unavailData = await unavailRes.json();

      setAvailability(availData.availability || []);
      setUnavailableDates(unavailData.unavailableDates || []);
    } catch (error) {
      showAlert('error', 'Failed to load data. Please refresh the page.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const timeValueToMinutes = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.getUTCHours() * 60 + date.getUTCMinutes();
  };

  const formatTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Invalid time';
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    return format(new Date(0, 0, 0, hours, minutes), 'hh:mm a');
  };

  const formatSlotRange = (slot: AvailabilitySlot) =>
    `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`;

  const validateTimes = (): boolean => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      showAlert('error', 'End time must be after start time');
      return false;
    }
    return true;
  };

  const hasOverlap = () => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return availability
      .filter((slot) => slot.dayOfWeek === selectedDay)
      .some((slot) => {
        const slotStartMinutes = timeValueToMinutes(slot.startTime);
        const slotEndMinutes = timeValueToMinutes(slot.endTime);
        if (slotStartMinutes === null || slotEndMinutes === null) return false;
        return startMinutes < slotEndMinutes && endMinutes > slotStartMinutes;
      });
  };

  const handleAddAvailability = async () => {
    if (!startTime || !endTime) {
      showAlert('error', 'Please fill all fields');
      return;
    }
    if (!validateTimes()) return;
    if (hasOverlap()) {
      showAlert('error', 'Time slot overlaps with existing availability');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/providers/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayOfWeek: selectedDay, startTime, endTime }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save availability');
      }

      showAlert('success', 'Availability saved successfully!');
      await fetchData();
      setStartTime('09:00');
      setEndTime('17:00');
    } catch (error) {
      showAlert('error', error instanceof Error ? error.message : 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/providers/availability/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      showAlert('success', 'Availability deleted');
      await fetchData();
    } catch {
      showAlert('error', 'Failed to delete availability');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUnavailableDate = async () => {
    if (!unavailableDate) {
      showAlert('error', 'Please select a date');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/providers/unavailability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: unavailableDate,
          reason: unavailableReason || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      showAlert('success', 'Unavailable date added successfully!');
      await fetchData();
      setUnavailableDate('');
      setUnavailableReason('');
    } catch (error) {
      showAlert('error', error instanceof Error ? error.message : 'Failed to add unavailable date');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUnavailableDate = async (id: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/providers/unavailability/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      showAlert('success', 'Unavailable date removed');
      await fetchData();
    } catch {
      showAlert('error', 'Failed to delete unavailable date');
    } finally {
      setSaving(false);
    }
  };

  const groupedAvailability = useMemo(
    () =>
      DAYS_OF_WEEK.map((day) => ({
        ...day,
        slots: availability
          .filter((a) => a.dayOfWeek === day.index)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
      })),
    [availability]
  );

  const summary = useMemo(() => {
    const daysWithHours = groupedAvailability.filter((d) => d.slots.length > 0).length;
    const totalSlots = availability.length;
    return { daysWithHours, totalSlots, blockedDates: unavailableDates.length };
  }, [groupedAvailability, availability.length, unavailableDates.length]);

  const minUnavailableDate = format(new Date(), 'yyyy-MM-dd');

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#6FCF97]/35 bg-white py-16">
        <Loader2 className="h-9 w-9 animate-spin text-[#2FA084]" />
        <p className="text-sm text-[#1F6F5F]/65">Loading availability…</p>
      </section>
    );
  }

  return (
    <section className="w-full space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#1F6F5F] sm:text-2xl">Availability</h2>
          <p className="mt-1 text-sm text-[#1F6F5F]/65">
            Set weekly working hours and mark days you are off
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={saving}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[#6FCF97]/50 bg-white px-3.5 py-2 text-sm font-semibold text-[#1F6F5F] shadow-sm transition hover:border-[#2FA084] hover:bg-[#EEEEEE] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-3 sm:gap-4">
        <div className="rounded-2xl border border-[#6FCF97]/35 bg-gradient-to-br from-white to-[#6FCF97]/10 p-4">
          <p className="text-xs font-semibold text-[#1F6F5F]/65">Active days</p>
          <p className="mt-1 text-2xl font-bold text-[#1F6F5F]">{summary.daysWithHours}/7</p>
        </div>
        <div className="rounded-2xl border border-[#6FCF97]/35 bg-gradient-to-br from-white to-[#6FCF97]/10 p-4">
          <p className="text-xs font-semibold text-[#1F6F5F]/65">Time slots</p>
          <p className="mt-1 text-2xl font-bold text-[#1F6F5F]">{summary.totalSlots}</p>
        </div>
        <div className="rounded-2xl border border-[#6FCF97]/35 bg-gradient-to-br from-white to-[#EEEEEE]/80 p-4">
          <p className="text-xs font-semibold text-[#1F6F5F]/65">Blocked dates</p>
          <p className="mt-1 text-2xl font-bold text-[#1F6F5F]">{summary.blockedDates}</p>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            alert.type === 'success'
              ? 'border-[#6FCF97]/50 bg-[#6FCF97]/15 text-[#1F6F5F]'
              : alert.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-[#6FCF97]/40 bg-[#EEEEEE] text-[#1F6F5F]'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{alert.message}</p>
        </div>
      )}

      {/* Weekly schedule */}
      <div className="overflow-hidden rounded-2xl border border-[#6FCF97]/35 bg-white shadow-sm">
        <div className="border-b border-[#6FCF97]/25 bg-gradient-to-r from-[#EEEEEE]/80 to-white px-4 py-3.5 sm:px-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-[#1F6F5F] sm:text-lg">
            <Calendar className="h-5 w-5 text-[#2FA084]" />
            Weekly schedule
          </h3>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {/* Add form */}
          <div className="rounded-2xl border border-dashed border-[#6FCF97]/50 bg-[#EEEEEE]/50 p-4 sm:p-5">
            <h4 className="mb-3 text-sm font-bold text-[#1F6F5F]">Add working hours</h4>

            {/* Day pills — quick select on mobile */}
            <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d.index}
                  type="button"
                  onClick={() => setSelectedDay(d.index)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    selectedDay === d.index
                      ? 'bg-[#2FA084] text-white shadow-sm'
                      : 'bg-white text-[#1F6F5F] ring-1 ring-[#6FCF97]/40 hover:bg-[#6FCF97]/15'
                  }`}
                >
                  {d.abbr}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <label htmlFor="avail-day" className={labelClass}>
                  Day
                </label>
                <select
                  id="avail-day"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className={inputClass}
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.index} value={d.index}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="avail-start" className={labelClass}>
                  Start
                </label>
                <input
                  id="avail-start"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="avail-end" className={labelClass}>
                  End
                </label>
                <input
                  id="avail-end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  onClick={handleAddAvailability}
                  disabled={saving}
                  className={primaryBtnClass}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add hours
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Days list */}
          <div className="space-y-3">
            {groupedAvailability.map((day) => (
              <div
                key={day.index}
                className={`rounded-xl border p-3.5 transition sm:p-4 ${
                  day.slots.length > 0
                    ? 'border-[#6FCF97]/40 bg-gradient-to-r from-[#6FCF97]/8 to-white'
                    : 'border-[#EEEEEE] bg-[#EEEEEE]/40'
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-[#1F6F5F]">{day.name}</h4>
                    <p className="text-xs text-[#1F6F5F]/55">
                      {day.slots.length === 0
                        ? 'No hours set'
                        : `${day.slots.length} slot${day.slots.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  {day.slots.length > 0 && (
                    <span className="rounded-full bg-[#2FA084] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Open
                    </span>
                  )}
                </div>

                {day.slots.length > 0 ? (
                  <div className="space-y-2">
                    {day.slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-[#6FCF97]/25 bg-white px-3 py-2.5"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2FA084]/15">
                            <Clock className="h-4 w-4 text-[#2FA084]" />
                          </div>
                          <p className="truncate text-sm font-semibold text-[#1F6F5F]">
                            {formatSlotRange(slot)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAvailability(slot.id)}
                          disabled={saving}
                          className="shrink-0 rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          aria-label="Remove slot"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#1F6F5F]/50">Not available this day</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unavailable dates */}
      <div className="overflow-hidden rounded-2xl border border-[#6FCF97]/35 bg-white shadow-sm">
        <div className="border-b border-[#6FCF97]/25 bg-gradient-to-r from-[#EEEEEE]/80 to-white px-4 py-3.5 sm:px-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-[#1F6F5F] sm:text-lg">
            <CalendarDays className="h-5 w-5 text-[#2FA084]" />
            Unavailable dates
          </h3>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="rounded-2xl border border-dashed border-[#6FCF97]/50 bg-[#EEEEEE]/50 p-4 sm:p-5">
            <h4 className="mb-3 text-sm font-bold text-[#1F6F5F]">Mark a day off</h4>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <label htmlFor="unavail-date" className={labelClass}>
                  Date
                </label>
                <input
                  id="unavail-date"
                  type="date"
                  value={unavailableDate}
                  min={minUnavailableDate}
                  onChange={(e) => setUnavailableDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="unavail-reason" className={labelClass}>
                  Reason <span className="font-normal text-[#1F6F5F]/50">(optional)</span>
                </label>
                <input
                  id="unavail-reason"
                  type="text"
                  value={unavailableReason}
                  onChange={(e) => setUnavailableReason(e.target.value)}
                  placeholder="e.g. Holiday"
                  className={inputClass}
                />
              </div>
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <button
                  type="button"
                  onClick={handleAddUnavailableDate}
                  disabled={saving}
                  className={primaryBtnClass}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add date
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {unavailableDates.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {unavailableDates.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[#6FCF97]/30 bg-[#EEEEEE]/60 px-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
                      <Calendar className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1F6F5F]">
                        {format(new Date(item.date), 'EEE, MMM d, yyyy')}
                      </p>
                      {item.reason && (
                        <p className="truncate text-xs text-[#1F6F5F]/60">{item.reason}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteUnavailableDate(item.id)}
                    disabled={saving}
                    className="shrink-0 rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    aria-label="Remove date"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#6FCF97]/35 bg-[#EEEEEE]/40 py-8 text-center text-sm text-[#1F6F5F]/60">
              No blocked dates. Customers can book based on your weekly schedule.
            </p>
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-xl border border-[#6FCF97]/35 bg-[#6FCF97]/12 px-4 py-3.5">
        <p className="text-sm leading-relaxed text-[#1F6F5F]/85">
          <span className="font-semibold text-[#1F6F5F]">Tip:</span> Add your weekly hours first,
          then block specific dates for holidays or time off. Customers see this when booking.
        </p>
      </div>
    </section>
  );
};
