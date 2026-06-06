'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plus, Edit, Trash2, Tag, Clock, ImageIcon } from 'lucide-react';
import ServiceFormModal from './ServiceFormModal';
import VerificationRequiredModal from './VerificationRequiredModal';
import { formatPKR } from '@/lib/utils';

function CategoryIcon({ icon }: { icon: string }) {
  const parts = icon.split(/[\s\n]+/).filter(Boolean);
  const glyphs = parts.length > 0 ? parts : [icon];

  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      {glyphs.map((glyph, index) => (
        <span
          key={`${glyph}-${index}`}
          className="inline-flex h-8 w-8 items-center justify-center text-xl leading-none"
        >
          {glyph}
        </span>
      ))}
    </span>
  );
}

interface Service {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  minPrice: number;
  maxPrice: number;
  defaultDurationMinutes: number;
  isActive: boolean;
  images: string[];
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
  const [showVerificationPrompt, setShowVerificationPrompt] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const isVerified = verificationStatus === 'APPROVED';

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

  const fetchVerificationStatus = async () => {
    try {
      const res = await fetch('/api/provider/dashboard');
      if (!res.ok) return;

      const data = await res.json();
      setVerificationStatus(data.provider?.verificationStatus ?? 'PENDING');
    } catch {
      setVerificationStatus('PENDING');
    }
  };

  useEffect(() => {
    fetchServices();
    fetchVerificationStatus();
  }, []);

  const handleAddNew = () => {
    if (!isVerified) {
      setShowVerificationPrompt(true);
      return;
    }

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
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2FA084]" />
        <span className="ml-2 text-[#1F6F5F]/70">Loading services...</span>
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
      {!isVerified && verificationStatus && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 sm:px-5">
          <p className="text-sm font-semibold text-amber-900">Identity verification required</p>
          <p className="mt-1 text-sm text-amber-800/90">
            Complete document verification before adding services to your profile.
          </p>
          <button
            type="button"
            onClick={() => setShowVerificationPrompt(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#2FA084] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F6F5F]"
          >
            Verify first
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1F6F5F]">My Services</h2>
          <p className="mt-1 text-sm text-[#1F6F5F]/65">
            {services.length} service{services.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2FA084] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1F6F5F] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add New Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#6FCF97]/50 bg-[#EEEEEE]/60 p-12 text-center">
          <p className="mb-4 text-[#1F6F5F]/70">You haven&apos;t created any services yet.</p>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-xl bg-[#2FA084] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F6F5F]"
          >
            <Plus className="w-4 h-4" />
            Create Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <motion.article
              key={service.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -4 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#6FCF97]/35 bg-white shadow-[0_8px_28px_-18px_rgba(31,111,95,0.55)] transition-shadow hover:shadow-[0_16px_40px_-20px_rgba(31,111,95,0.65)]"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden bg-[#EEEEEE]">
                {service.images.length > 0 ? (
                  <img
                    src={service.images[0]}
                    alt={service.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-[#1F6F5F]/45">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-xs font-medium">No image</span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1F6F5F]/55 via-transparent to-transparent" />
                {service.images.length > 1 && (
                  <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    +{service.images.length - 1}
                  </span>
                )}
                <span
                  className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
                    service.isActive
                      ? 'bg-[#6FCF97] text-[#1F6F5F]'
                      : 'bg-white/90 text-[#1F6F5F]/70'
                  }`}
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="mb-3">
                  <span className="inline-flex max-w-full items-center gap-2 rounded-xl border border-[#6FCF97]/40 bg-[#EEEEEE] px-3 py-2">
                    {service.category.icon ? <CategoryIcon icon={service.category.icon} /> : null}
                    <span className="min-w-0 text-xs font-semibold leading-snug text-[#1F6F5F] sm:text-[13px]">
                      {service.category.name}
                    </span>
                  </span>
                </div>

                <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-[#1F6F5F]">
                  {service.name}
                </h3>

                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#1F6F5F]/70">
                  {service.description}
                </p>

                <div className="mb-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-[#6FCF97]/30 bg-[#EEEEEE]/80 px-3 py-2.5">
                    <div className="mb-1 flex items-center gap-1.5 text-[#2FA084]">
                      <Tag className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#1F6F5F]/60">
                        Price
                      </span>
                    </div>
                    <p className="text-xs font-semibold leading-snug text-[#1F6F5F]">
                      {formatPKR(service.minPrice)} – {formatPKR(service.maxPrice)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#6FCF97]/30 bg-[#EEEEEE]/80 px-3 py-2.5">
                    <div className="mb-1 flex items-center gap-1.5 text-[#2FA084]">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#1F6F5F]/60">
                        Duration
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#1F6F5F]">
                      {service.defaultDurationMinutes} min
                    </p>
                  </div>
                </div>

                {service._count && service._count.bookings > 0 ? (
                  <p className="mb-4 text-xs font-medium text-[#2FA084]">
                    {service._count.bookings} booking{service._count.bookings !== 1 ? 's' : ''}
                  </p>
                ) : (
                  <div className="mb-4" />
                )}

                <div className="mt-auto flex gap-2 border-t border-[#EEEEEE] pt-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(service)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2FA084] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F6F5F] active:scale-[0.98]"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    disabled={deleting === service.id}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deleting === service.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </motion.article>
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

      {showVerificationPrompt && (
        <VerificationRequiredModal
          verificationStatus={verificationStatus ?? 'PENDING'}
          onClose={() => setShowVerificationPrompt(false)}
        />
      )}
    </motion.div>
  );
};
