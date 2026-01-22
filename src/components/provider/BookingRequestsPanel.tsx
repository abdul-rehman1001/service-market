'use client';

import { useState, useEffect } from 'react';
import { format, addMinutes, isAfter } from 'date-fns';

interface BookingRequest {
  id: string;
  customerName: string;
  service: string;
  requestedTime: string; // ISO string
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Auto-Cancelled';
  reason?: string;
  alternateTime?: string;
}

export const BookingRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<BookingRequest[]>([
    {
      id: 'b1',
      customerName: 'Sarah Jenkins',
      service: 'AC Repair',
      requestedTime: new Date(new Date().getTime() + 10 * 60000).toISOString(), // 10 min from now
      status: 'Pending',
    },
    {
      id: 'b2',
      customerName: 'Michael Chen',
      service: 'Washing Machine Repair',
      requestedTime: new Date(new Date().getTime() + 20 * 60000).toISOString(), // 20 min from now
      status: 'Pending',
    },
  ]);

  // Auto-cancel logic for pending requests >30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setRequests((prev) =>
        prev.map((r) => {
          if (r.status === 'Pending' && isAfter(new Date(), addMinutes(new Date(r.requestedTime), 30))) {
            return { ...r, status: 'Auto-Cancelled' };
          }
          return r;
        })
      );
    }, 60000); // check every 1 min
    return () => clearInterval(interval);
  }, []);

  const respond = (id: string, action: 'Accepted' | 'Rejected', reason?: string, alternateTime?: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action, reason, alternateTime } : r))
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Booking Requests</h2>

      {requests.length === 0 && <p>No new booking requests.</p>}

      <ul className="space-y-4">
        {requests.map((r) => (
          <li key={r.id} className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p>
                  <strong>{r.customerName}</strong> requested <strong>{r.service}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  Requested Time: {format(new Date(r.requestedTime), 'PPPpp')}
                </p>
                <p className="text-sm text-gray-500">Status: {r.status}</p>
                {r.reason && <p className="text-sm text-red-500">Reason: {r.reason}</p>}
                {r.alternateTime && <p className="text-sm text-blue-500">Suggested Time: {r.alternateTime}</p>}
              </div>

              {r.status === 'Pending' && (
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 bg-emerald-600 text-white rounded"
                    onClick={() => respond(r.id, 'Accepted')}
                  >
                    Accept
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() =>
                      respond(r.id, 'Rejected', prompt('Enter rejection reason:') || 'No reason provided')
                    }
                  >
                    Reject
                  </button>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() =>
                      respond(r.id, 'Rejected', undefined, prompt('Suggest alternate time (YYYY-MM-DD HH:MM):') || '')
                    }
                  >
                    Suggest Alternate
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
