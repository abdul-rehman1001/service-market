'use client';

import { useState } from 'react';
import { format } from 'date-fns';

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface DayAvailability {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export const AvailabilityPanel: React.FC = () => {
  const [days, setDays] = useState<DayAvailability[]>([
    { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'Saturday', startTime: '10:00', endTime: '14:00', isAvailable: true },
    { day: 'Sunday', startTime: '00:00', endTime: '00:00', isAvailable: false },
  ]);

  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [newUnavailable, setNewUnavailable] = useState<string>('');

  const toggleAvailability = (index: number) => {
    const updated = [...days];
    updated[index].isAvailable = !updated[index].isAvailable;
    setDays(updated);
  };

  const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...days];
    updated[index][field] = value;
    setDays(updated);
  };

  const addUnavailableDate = () => {
    if (!newUnavailable) return;
    const date = new Date(newUnavailable);
    if (!unavailableDates.find(d => d.getTime() === date.getTime())) {
      setUnavailableDates([...unavailableDates, date]);
      setNewUnavailable('');
    }
  };

  const removeUnavailableDate = (date: Date) => {
    setUnavailableDates(unavailableDates.filter(d => d.getTime() !== date.getTime()));
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
          Availability Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure your weekly schedule and unavailable dates
        </p>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition hover:shadow-md">
        <h3 className="font-medium text-slate-700 mb-3">Weekly Schedule</h3>
        <div className="space-y-2">
          {days.map((d, i) => (
            <div key={d.day} className="flex flex-wrap items-center gap-2">
              <input
                type="checkbox"
                checked={d.isAvailable}
                onChange={() => toggleAvailability(i)}
                className="w-4 h-4 accent-emerald-600 transition duration-200"
              />
              <span className="w-24 text-slate-700">{d.day}</span>
              <input
                type="time"
                value={d.startTime}
                onChange={(e) => updateTime(i, 'startTime', e.target.value)}
                disabled={!d.isAvailable}
                className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-500 transition duration-150"
              />
              <span className="text-slate-500">to</span>
              <input
                type="time"
                value={d.endTime}
                onChange={(e) => updateTime(i, 'endTime', e.target.value)}
                disabled={!d.isAvailable}
                className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-500 transition duration-150"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Unavailable Dates */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition hover:shadow-md">
        <h3 className="font-medium text-slate-700 mb-3">Unavailable Dates</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <input
            type="date"
            value={newUnavailable}
            onChange={(e) => setNewUnavailable(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-emerald-500 transition duration-150"
          />
          <button
            onClick={addUnavailableDate}
            className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm font-medium transition hover:bg-emerald-700 active:scale-95"
          >
            Add
          </button>
        </div>

        <ul className="space-y-1">
          {unavailableDates.map((date) => (
            <li key={date.toString()} className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-100">
              <span>{format(date, 'yyyy-MM-dd')}</span>
              <button
                onClick={() => removeUnavailableDate(date)}
                className="px-2 py-0.5 bg-rose-500 text-white rounded text-xs transition hover:bg-rose-600 active:scale-95"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Save Button */}
      <button className="px-5 py-2 bg-emerald-600 text-white rounded-md font-medium transition hover:bg-emerald-700 active:scale-95">
        Save Availability
      </button>
    </section>
  );
};
