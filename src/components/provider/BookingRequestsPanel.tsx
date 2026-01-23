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
      requestedTime: new Date(new Date().getTime() + 10 * 60000).toISOString(),
      status: 'Pending',
    },
    {
      id: 'b2',
      customerName: 'Michael Chen',
      service: 'Washing Machine Repair',
      requestedTime: new Date(new Date().getTime() + 20 * 60000).toISOString(),
      status: 'Pending',
    },
  ]);

  // Auto-cancel pending requests >30 minutes
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
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const respond = (id: string, action: 'Accepted' | 'Rejected', reason?: string, alternateTime?: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action, reason, alternateTime } : r))
    );
  };

  // Status badge colors
  const statusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-emerald-100 text-emerald-800';
      case 'Rejected':
        return 'bg-rose-100 text-rose-800';
      case 'Auto-Cancelled':
        return 'bg-gray-100 text-gray-700';
      default:
        return '';
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">
          Booking Requests
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Review and respond to new booking requests
        </p>
      </div>

      {/* Booking List */}
      {requests.length === 0 ? (
        <p className="text-slate-500">No new booking requests.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((r) => (
            <li
              key={r.id}
              className="
                bg-white border border-slate-200 rounded-2xl p-5 shadow-md
                hover:shadow-lg transition-all duration-300 ease-out
              "
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                {/* Info */}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {r.customerName}{' '}
                    <span className="font-normal text-slate-600">requested {r.service}</span>
                  </p>
                  <p className="text-sm text-slate-500">
                    Requested Time: {format(new Date(r.requestedTime), 'PPPpp')}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(
                      r.status
                    )}`}
                  >
                    {r.status}
                  </span>
                  {r.reason && (
                    <p className="text-sm text-rose-600 font-medium">Reason: {r.reason}</p>
                  )}
                  {r.alternateTime && (
                    <p className="text-sm text-blue-600 font-medium">
                      Suggested Time: {r.alternateTime}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {r.status === 'Pending' && (
                  <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                    <button
                      className="
                        px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium
                        transition-all duration-200 hover:bg-emerald-700 active:scale-95 shadow
                      "
                      onClick={() => respond(r.id, 'Accepted')}
                    >
                      Accept
                    </button>

                    <button
                      className="
                        px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium
                        transition-all duration-200 hover:bg-rose-700 active:scale-95 shadow
                      "
                      onClick={() =>
                        respond(r.id, 'Rejected', prompt('Enter rejection reason:') || 'No reason provided')
                      }
                    >
                      Reject
                    </button>

                    <button
                      className="
                        px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium
                        transition-all duration-200 hover:bg-blue-700 active:scale-95 shadow
                      "
                      onClick={() =>
                        respond(
                          r.id,
                          'Rejected',
                          undefined,
                          prompt('Suggest alternate time (YYYY-MM-DD HH:MM):') || ''
                        )
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
      )}
    </section>
  );
};
