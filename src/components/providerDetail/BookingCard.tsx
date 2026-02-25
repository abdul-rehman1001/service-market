import React, { useState } from 'react';
import { ProviderProfileType } from '@/types/provider';
import { Calendar, Clock, MessageCircle, DollarSign } from 'lucide-react';

interface Props {
  provider: ProviderProfileType;
}

export default function BookingCard({ provider }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    service: '',
    date: '',
    time: '',
    message: '',
  });

  const minPrice = provider.services.length > 0
    ? Math.min(...provider.services.map(s => Number(s.minPrice)))
    : 0;

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

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const handleSubmit = () => {
    if (!form.service || !form.date || !form.time) {
      alert('Please fill in all required fields');
      return;
    }
    alert(`Booking Request Sent!\nService: ${form.service}\nDate: ${form.date}\nTime: ${form.time}`);
    setForm({ service: '', date: '', time: '', message: '' });
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4 sticky top-6">
      <h3 className="text-lg font-semibold">Book This Service</h3>
      
      {minPrice > 0 && (
        <div className="flex items-center gap-2 text-emerald-600">
          <DollarSign className="w-5 h-5" />
          <div>
            <p className="text-2xl font-bold">${minPrice.toFixed(2)}</p>
            <p className="text-xs text-gray-500">Starting from</p>
          </div>
        </div>
      )}

      {!showForm ? (
        <div className="flex flex-col gap-3">
          <button
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
            onClick={() => setShowForm(true)}
            disabled={!provider.isAvailable || provider.services.length === 0}
          >
            <Calendar className="w-5 h-5" />
            {provider.isAvailable ? 'Book Now' : 'Currently Unavailable'}
          </button>
          <button
            className="w-full border-2 border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Send Message
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Service *</label>
            <select
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
            >
              <option value="">Choose a service</option>
              {provider.services.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} - ${Number(s.minPrice).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date *</label>
            <select
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            >
              <option value="">Choose a date</option>
              {generateDates().map((d) => (
                <option key={d} value={d}>
                  {new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Time *</label>
            <select
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            >
              <option value="">Choose a time</option>
              {timeSlots.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Message</label>
            <textarea
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Describe your requirements (optional)"
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              className="flex-1 border-2 border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              onClick={handleSubmit}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Provider Info */}
      <div className="pt-4 border-t space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Response Time:</span>
          <span className="font-medium">Within 24h</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Jobs Completed:</span>
          <span className="font-medium">{provider.completedBookingsCount}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Experience:</span>
          <span className="font-medium">{provider.yearsOfExperience} years</span>
        </div>
      </div>
    </div>
  );
}
