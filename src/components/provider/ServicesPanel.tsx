'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plus, Edit, Trash2, DollarSign, Clock } from 'lucide-react';
import ServiceFormModal from './ServiceFormModal';

interface Service {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  minPrice: number;
  maxPrice: number;
  defaultDurationMinutes: number;
  isActive: boolean;
  createdAt: string;
  category: {
    id: string;
    name: string;
    icon: string | null;
  };
  _count?: {
    bookings: number;
  };
}

export const ServicesPanel: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/providers/services');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch services');
      }

      setServices(data.services);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddNew = () => {
    setEditingService(null);
    setShowModal(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      setDeleting(serviceId);
      const res = await fetch(`/api/providers/services/${serviceId}`, {
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
    } finally {
      setDeleting(null);
    }
  };

  const handleModalClose = (shouldRefresh?: boolean) => {
    setShowModal(false);
    setEditingService(null);
    if (shouldRefresh) {
      fetchServices();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <span className="ml-2 text-gray-600">Loading services...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 font-semibold">Error loading services</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={fetchServices}
          className="mt-3 text-sm text-red-700 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">My Services</h2>
          <p className="text-sm text-gray-600 mt-1">
            {services.length} service{services.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add New Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-gray-500 mb-4">You haven't created any services yet.</p>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <motion.div
              key={service.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition hover:shadow-md"
            >
              {/* Category Badge */}
              <div className="flex items-center gap-2 mb-3">
                {service.category.icon && (
                  <span className="text-xl">{service.category.icon}</span>
                )}
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {service.category.name}
                </span>
              </div>

              {/* Service Name */}
              <h3 className="font-semibold text-slate-800 text-lg mb-2">
                {service.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                {service.description}
              </p>

              {/* Details */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>
                    ${service.minPrice} - ${service.maxPrice}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>{service.defaultDurationMinutes} minutes</span>
                </div>
                {service._count && service._count.bookings > 0 && (
                  <p className="text-xs text-gray-500">
                    {service._count.bookings} booking{service._count.bookings !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    service.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition active:scale-95"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={deleting === service.id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting === service.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Service Form Modal */}
      {showModal && (
        <ServiceFormModal
          service={editingService}
          onClose={handleModalClose}
        />
      )}
    </motion.div>
  );
};
