'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AlertCircle, Clock, Calendar, CheckCircle2, Loader2, X, Plus } from 'lucide-react';

const DAYS_OF_WEEK = [
  { index: 0, name: 'Sunday', abbr: 'Sun' },
  { index: 1, name: 'Monday', abbr: 'Mon' },
  { index: 2, name: 'Tuesday', abbr: 'Tue' },
  { index: 3, name: 'Wednesday', abbr: 'Wed' },
  { index: 4, name: 'Thursday', abbr: 'Thu' },
  { index: 5, name: 'Friday', abbr: 'Fri' },
  { index: 6, name: 'Saturday', abbr: 'Sat' },
];

interface Service {
  id: string;
  name: string;
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  serviceId: string;
  service: { name: string };
}

interface UnavailableDate {
  id: string;
  date: string;
  reason?: string;
}

type AlertType = 'success' | 'error' | 'info';

export const AvailabilityPanel: React.FC = () => {
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);

  // Form state
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [unavailableDate, setUnavailableDate] = useState<string>('');
  const [unavailableReason, setUnavailableReason] = useState<string>('');

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, availRes, unavailRes] = await Promise.all([
        fetch('/api/providers/services'),
        fetch('/api/providers/availability'),
        fetch('/api/providers/unavailability'),
      ]);

      if (!servicesRes.ok || !availRes.ok || !unavailRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const servicesData = await servicesRes.json();
      const availData = await availRes.json();
      const unavailData = await unavailRes.json();

      setServices(servicesData.services || []);
      setAvailability(availData.availability || []);
      setUnavailableDates(unavailData.unavailableDates || []);

      if (servicesData.services?.length > 0) {
        setSelectedService(servicesData.services[0].id);
      }
    } catch (error) {
      showAlert('error', 'Failed to load data. Please refresh the page.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: AlertType, message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const formatSlotRange = (slot: AvailabilitySlot) => {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 'Invalid date';
    }

    return `${format(start, 'EEEE, d MMMM yyyy')} | ${format(start, 'hh:mm a')} – ${format(end, 'hh:mm a')}`;
  };

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
      .filter(
        (slot) =>
          slot.dayOfWeek === selectedDay &&
          slot.serviceId === selectedService
      )
      .some((slot) => {
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);
        const slotStartMinutes = slotStart.getHours() * 60 + slotStart.getMinutes();
        const slotEndMinutes = slotEnd.getHours() * 60 + slotEnd.getMinutes();

        return startMinutes < slotEndMinutes && endMinutes > slotStartMinutes;
      });
  };

  const handleAddAvailability = async () => {
    if (!selectedService || !startTime || !endTime) {
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
        body: JSON.stringify({
          serviceId: selectedService,
          dayOfWeek: selectedDay,
          startTime,
          endTime,
        }),
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
      const response = await fetch(`/api/providers/availability/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      showAlert('success', 'Availability deleted');
      await fetchData();
    } catch (error) {
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
      const response = await fetch(`/api/providers/unavailability/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      showAlert('success', 'Unavailable date removed');
      await fetchData();
    } catch (error) {
      showAlert('error', 'Failed to delete unavailable date');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading availability settings...</p>
        </div>
      </section>
    );
  }

  const groupedAvailability = DAYS_OF_WEEK.map(day => ({
    ...day,
    slots: availability
      .filter(a => a.dayOfWeek === day.index)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
  }));

  const minUnavailableDate = format(new Date(), 'yyyy-MM-dd');

  return (
    <section className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="relative">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-8 h-8 text-green-600" />
            Availability Management
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Set your working hours and mark days when you're unavailable
          </p>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div
          className={`p-4 rounded-lg border flex items-start gap-3 ${
            alert.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : alert.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{alert.message}</p>
        </div>
      )}

      {/* Weekly Schedule Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Weekly Schedule
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Add Availability Form */}
          <div className="bg-green-50 border-2 border-dashed border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-3">Add Working Hours</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Day
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d.index} value={d.index}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Start
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  End
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAddAvailability}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-slate-400 transition flex items-center justify-center gap-2 text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Availability Grid by Day */}
          <div className="space-y-3">
            {groupedAvailability.map((day) => (
              <div
                key={day.index}
                className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{day.name}</h4>
                    <p className="text-sm text-slate-500">
                      {day.slots.length === 0 ? 'No working hours set' : `${day.slots.length} time slot(s)`}
                    </p>
                  </div>
                </div>

                {day.slots.length > 0 ? (
                  <div className="space-y-2">
                    {day.slots.map((slot) => {
                      return (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between bg-slate-50 rounded-lg p-3 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {formatSlotRange(slot)}
                              </p>
                              <p className="text-xs text-slate-500">{slot.service.name}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteAvailability(slot.id)}
                            disabled={saving}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Not available on this day</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unavailable Dates Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-green-600" />
            Unavailable Dates
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Add Unavailable Date Form */}
          <div className="bg-green-50 border-2 border-dashed border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 mb-3">Mark Days as Unavailable</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={unavailableDate}
                  min={minUnavailableDate}
                  onChange={(e) => setUnavailableDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reason (optional)
                </label>
                <input
                  type="text"
                  value={unavailableReason}
                  onChange={(e) => setUnavailableReason(e.target.value)}
                  placeholder="e.g., Leave"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAddUnavailableDate}
                  disabled={saving}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-slate-400 transition flex items-center justify-center gap-2 text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Unavailable Dates List */}
          {unavailableDates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unavailableDates.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-slate-50 rounded-lg p-3 group border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {format(new Date(item.date), 'EEEE, d MMMM yyyy')}
                      </p>
                      {item.reason && (
                        <p className="text-xs text-slate-500">{item.reason}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteUnavailableDate(item.id)}
                    disabled={saving}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-4">
              No unavailable dates marked. You're available as per your weekly schedule.
            </p>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          <strong>💡 Tip:</strong> Set your weekly working hours above, then mark specific dates when you're unavailable. Customers will see your availability when booking services.
        </p>
      </div>
    </section>
  );
};
