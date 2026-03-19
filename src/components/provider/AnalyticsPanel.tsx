'use client';

import { useState, useEffect } from 'react';
import { Loader, AlertCircle, TrendingUp, Calendar, DollarSign, Star } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BookingData {
  id: string;
  status: string;
  createdAt: string;
  service: {
    title: string;
    baseRate: number;
  };
}

const COLORS = {
  COMPLETED: '#10b981',
  IN_PROGRESS: '#3b82f6',
  CONFIRMED: '#8b5cf6',
  CANCELLED: '#ef4444',
  AUTO_CANCELLED: '#f97316',
  PENDING: '#eab308',
};

export const AnalyticsPanel: React.FC = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    inProgressBookings: 0,
    completionRate: 0,
    totalRevenue: 0,
  });
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/provider/bookings');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics data');
      }

      const bookingsData = data.bookings || [];
      setBookings(bookingsData);

      const total = bookingsData.length;
      const completed = bookingsData.filter((b: BookingData) => b.status === 'COMPLETED').length;
      const cancelled = bookingsData.filter((b: BookingData) => 
        ['CANCELLED', 'AUTO_CANCELLED'].includes(b.status)
      ).length;
      const inProgress = bookingsData.filter((b: BookingData) => 
        ['IN_PROGRESS', 'EN_ROUTE', 'CONFIRMED'].includes(b.status)
      ).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Calculate total revenue from completed bookings
      const totalRevenue = bookingsData
        .filter((b: BookingData) => b.status === 'COMPLETED')
        .reduce((sum: number, b: BookingData) => sum + (b.service?.baseRate || 0), 0);

      setStats({
        totalBookings: total,
        completedBookings: completed,
        cancelledBookings: cancelled,
        inProgressBookings: inProgress,
        completionRate,
        totalRevenue,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const getStatusDistribution = () => {
    const statusCounts: Record<string, number> = {};
    bookings.forEach((booking) => {
      statusCounts[booking.status] = (statusCounts[booking.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace('_', ' '),
      value,
    }));
  };

  const getMonthlyBookings = () => {
    const monthlyData: Record<string, number> = {};
    
    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return Object.entries(monthlyData)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6) // Last 6 months
      .map(([month, count]) => ({
        month,
        bookings: count,
      }));
  };

  const getRevenueOverTime = () => {
    const monthlyRevenue: Record<string, number> = {};
    
    bookings
      .filter((b) => b.status === 'COMPLETED')
      .forEach((booking) => {
        const date = new Date(booking.createdAt);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (booking.service?.baseRate || 0);
      });

    return Object.entries(monthlyRevenue)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6) // Last 6 months
      .map(([month, revenue]) => ({
        month,
        revenue,
      }));
  };

  const statusDistribution = getStatusDistribution();
  const monthlyBookings = getMonthlyBookings();
  const revenueOverTime = getRevenueOverTime();

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-800">
          Analytics Overview
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Job completion trends, revenue insights, and performance metrics
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-slate-200">
          <Loader className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold text-emerald-900 mt-1">{stats.totalBookings}</p>
                </div>
                <Calendar className="w-10 h-10 text-emerald-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Completed</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{stats.completedBookings}</p>
                </div>
                <Star className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold text-amber-900 mt-1">{stats.completionRate}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-amber-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">${stats.totalRevenue}</p>
                </div>
                <DollarSign className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bookings Over Time */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Bookings Trend</h3>
              {monthlyBookings.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyBookings}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500 py-12">No booking data available</p>
              )}
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Booking Status Distribution</h3>
              {statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => {
                        const status = entry.name.toUpperCase().replace(' ', '_');
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[status as keyof typeof COLORS] || '#94a3b8'} 
                          />
                        );
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500 py-12">No status data available</p>
              )}
            </div>

            {/* Revenue Over Time */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Revenue Trend</h3>
              {revenueOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                      }} 
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500 py-12">No revenue data available</p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
};
