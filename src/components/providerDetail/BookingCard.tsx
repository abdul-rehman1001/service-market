import React, { useState } from 'react';
import { Provider } from '@/types/provider';

interface Props {
  provider: Provider;
}

export default function BookingCard({ provider }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    service: '',
    date: '',
    time: '',
    message: '',
  });

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleSubmit = () => {
    alert(`Booking Confirmed!\nService: ${form.service}\nDate: ${form.date}\nTime: ${form.time}`);
    setForm({ service: '', date: '', time: '', message: '' });
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4 sticky top-6">
      <h3 className="text-lg font-semibold">Book This Service</h3>
      <p className="text-xl font-bold text-blue-600">{provider.price}</p>

      {!showForm ? (
        <div className="flex flex-col gap-2">
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            onClick={() => setShowForm(true)}
          >
            Book Now
          </button>
          <button
            className="w-full border border-gray-300 py-2 rounded hover:bg-gray-100 transition"
          >
            Send Message
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <select
            className="w-full border p-2 rounded"
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
          >
            <option value="">Select Service</option>
            {provider.services.map((s, i) => (
              <option key={i} value={s.name}>
                {s.name} - {s.price}
              </option>
            ))}
          </select>

          <select
            className="w-full border p-2 rounded"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          >
            <option value="">Select Date</option>
            {generateDates().map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            className="w-full border p-2 rounded"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          >
            <option value="">Select Time</option>
            {provider.timeSlots.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>

          <textarea
            className="w-full border p-2 rounded"
            placeholder="Message (optional)"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />

          <div className="flex gap-2">
            <button
              className="flex-1 border py-2 rounded hover:bg-gray-100 transition"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
              onClick={handleSubmit}
            >
              Confirm Booking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
