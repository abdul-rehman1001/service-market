'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plus, Edit, Trash2, Tag, Clock, ImageIcon, Briefcase } from 'lucide-react';
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

      alert(
        data.action === 'deactivated'
          ? `${data.message}${data.details ? `\n${data.details}` : ''}`
          : data.message || 'Service deleted successfully'
      );
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
      <div className="flex h-64 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
        <span className="ml-2 text-sm font-medium text-[#6B7280]">Loading services...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-6">
        <p className="font-semibold text-[#EF4444]">Error loading services</p>
        <p className="mt-1 text-sm text-[#EF4444]/80">{error}</p>
        <button
          onClick={fetchServices}
          className="mt-3 text-sm font-semibold text-[#EF4444] hover:underline"
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
        <div className="rounded-2xl border border-[#FED7AA] bg-[#FFFBEB] px-4 py-4 sm:px-5">
          <p className="text-sm font-semibold text-[#9A3412]">Identity verification required</p>
          <p className="mt-1 text-sm text-[#B45309]">
            Complete document verification before adding services to your profile.
          </p>
          <button
            type="button"
            onClick={() => setShowVerificationPrompt(true)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(16,185,129,0.25)] transition hover:bg-[#059669]"
          >
            Verify first
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_12px_rgba(17,24,39,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669]">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1E3A5F]">My Services</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              {services.length} service{services.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Add New Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D1FAE5] bg-[#D1FAE5]/40 text-[#059669]">
            <Briefcase className="h-7 w-7" />
          </div>
          <p className="mb-4 text-[#6B7280]">You haven&apos;t created any services yet.</p>
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition hover:bg-[#059669]"
          >
            <Plus className="h-4 w-4" />
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
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(17,24,39,0.05)] transition-all duration-200 hover:border-[#10B981]/25 hover:shadow-[0_12px_32px_rgba(16,185,129,0.1)]"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden bg-[#F9FAFB]">
                {service.images.length > 0 ? (
                  <img
                    src={service.images[0]}
                    alt={service.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-[#9CA3AF]">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-xs font-medium">No image</span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1E3A5F]/40 via-transparent to-transparent" />
                {service.images.length > 1 && (
                  <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    +{service.images.length - 1}
                  </span>
                )}
                <span
                  className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
                    service.isActive
                      ? 'border border-[#D1FAE5] bg-[#D1FAE5] text-[#059669]'
                      : 'border border-[#E5E7EB] bg-white/95 text-[#6B7280]'
                  }`}
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="mb-3">
                  <span className="inline-flex max-w-full items-center gap-2 rounded-lg border border-[#D1FAE5] bg-[#D1FAE5]/30 px-3 py-1.5">
                    {service.category.icon ? <CategoryIcon icon={service.category.icon} /> : null}
                    <span className="min-w-0 text-xs font-semibold leading-snug text-[#059669] sm:text-[13px]">
                      {service.category.name}
                    </span>
                  </span>
                </div>

                <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-[#1E3A5F]">
                  {service.name}
                </h3>

                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-[#6B7280]">
                  {service.description}
                </p>

                <div className="mb-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5">
                    <div className="mb-1 flex items-center gap-1.5 text-[#10B981]">
                      <Tag className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
                        Price
                      </span>
                    </div>
                    <p className="text-xs font-semibold leading-snug text-[#111827]">
                      {formatPKR(service.minPrice)} – {formatPKR(service.maxPrice)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5">
                    <div className="mb-1 flex items-center gap-1.5 text-[#10B981]">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]">
                        Duration
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#111827]">
                      {service.defaultDurationMinutes} min
                    </p>
                  </div>
                </div>

                {service._count && service._count.bookings > 0 ? (
                  <p className="mb-4 text-xs font-semibold text-[#059669]">
                    {service._count.bookings} booking{service._count.bookings !== 1 ? 's' : ''}
                  </p>
                ) : (
                  <div className="mb-4" />
                )}

                <div className="mt-auto flex gap-2 border-t border-[#E5E7EB] pt-4">
                  <button
                    type="button"
                    onClick={() => handleEdit(service)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#10B981] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#059669] active:scale-[0.98]"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    disabled={deleting === service.id}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-sm font-semibold text-[#EF4444] transition hover:bg-[#FEE2E2] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
