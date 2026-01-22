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
    <div>
      <h2 className="text-2xl font-bold mb-4">Availability Management</h2>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Weekly Schedule</h3>
        {days.map((d, i) => (
          <div key={d.day} className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={d.isAvailable}
              onChange={() => toggleAvailability(i)}
            />
            <span className="w-24">{d.day}</span>
            <input
              type="time"
              value={d.startTime}
              onChange={(e) => updateTime(i, 'startTime', e.target.value)}
              disabled={!d.isAvailable}
              className="border px-2 py-1 rounded"
            />
            <span>to</span>
            <input
              type="time"
              value={d.endTime}
              onChange={(e) => updateTime(i, 'endTime', e.target.value)}
              disabled={!d.isAvailable}
              className="border px-2 py-1 rounded"
            />
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-2">Unavailable Dates (Holidays / Personal Time)</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="date"
            value={newUnavailable}
            onChange={(e) => setNewUnavailable(e.target.value)}
            className="border px-2 py-1 rounded"
          />
          <button
            onClick={addUnavailableDate}
            className="px-3 py-1 bg-emerald-600 text-white rounded"
          >
            Add
          </button>
        </div>

        <ul>
          {unavailableDates.map((date) => (
            <li key={date.toString()} className="flex items-center gap-2 mb-1">
              <span>{format(date, 'yyyy-MM-dd')}</span>
              <button
                onClick={() => removeUnavailableDate(date)}
                className="px-2 py-1 bg-red-500 text-white rounded text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded">
        Save Availability
      </button>
    </div>
  );
};
