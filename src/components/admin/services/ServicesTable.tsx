'use client';

import { useState, useEffect, useCallback } from 'react';
import ServiceRow from './ServiceRow';
import { Loader2, Search, X } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  minPrice: string;
  maxPrice: string;
  defaultDurationMinutes: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
  provider: {
    id: string;
    businessName: string | null;
    verificationStatus: string;
    averageRating: string;
    totalReviews: number;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      profileImage: string | null;
    };
  };
  _count: {
    bookings: number;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function ServicesTable() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);
      params.set('sort', sortBy);
      params.set('order', order);
      params.set('page', String(page));
      params.set('limit', String(limit));

      const res = await fetch(`/api/admin/services?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch services');
      }

      setServices(data.services);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, sortBy, order, page]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch {
      // Non-critical, ignore
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error + (data.details ? `\n${data.details}` : ''));
        return;
      }

      alert('Service deleted successfully');
      fetchServices();
    } catch (err: any) {
      alert('Failed to delete service: ' + err.message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update service');
      }

      fetchServices();
    } catch (err: any) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
    setSortBy('createdAt');
    setOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = search || categoryFilter || statusFilter;

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, provider..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="min-w-[130px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort */}
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="createdAt">Date Created</option>
              <option value="updatedAt">Last Updated</option>
              <option value="name">Name</option>
              <option value="minPrice">Price</option>
            </select>
          </div>

          {/* Order */}
          <div className="min-w-[100px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
            <select
              value={order}
              onChange={(e) => { setOrder(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
            >
              Search
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-3 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-100 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        {total} service{total !== 1 ? 's' : ''} found
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          <span className="ml-2 text-gray-600">Loading services...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-red-600 text-center">
            <p className="font-semibold">Error loading services</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchServices}
              className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && services.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-500 text-center">
            {hasActiveFilters
              ? 'No services match your filters. Try adjusting your search.'
              : 'No services found.'}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && services.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Service</th>
                  <th className="text-left p-3">Provider</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Price Range</th>
                  <th className="text-left p-3">Bookings</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <ServiceRow
                    key={service.id}
                    service={service}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow px-4 py-3">
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
