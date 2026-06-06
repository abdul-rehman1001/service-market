'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Loader2,
  Upload,
  Trash2,
  Wrench,
  ImageIcon,
  Tag,
  Clock,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string | null;
  isActive: boolean;
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
}

interface ServiceFormModalProps {
  service?: Service | null;
  onClose: (shouldRefresh?: boolean) => void;
}

const inputClass =
  'w-full rounded-xl border border-[#6FCF97]/45 bg-white px-4 py-3 text-sm text-[#1F6F5F] shadow-sm transition placeholder:text-[#1F6F5F]/40 focus:border-[#2FA084] focus:outline-none focus:ring-2 focus:ring-[#2FA084]/25';

const labelClass = 'mb-1.5 block text-sm font-semibold text-[#1F6F5F]';

export default function ServiceFormModal({ service, onClose }: ServiceFormModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    categoryId: service?.categoryId || '',
    minPrice: service?.minPrice?.toString() || '',
    maxPrice: service?.maxPrice?.toString() || '',
    defaultDurationMinutes: service?.defaultDurationMinutes?.toString() || '',
    isActive: service?.isActive ?? true,
    images: service?.images || [],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await fetch('/api/categories');
        const data = await res.json();

        if (res.ok && data.success) {
          setCategories(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, submitting]);

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      setUploadingImages(true);

      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          alert(`Invalid file type: ${file.name}. Only JPEG, PNG, and WebP are allowed.`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`File too large: ${file.name}. Max size is 5MB.`);
          continue;
        }

        const formDataForUpload = new FormData();
        formDataForUpload.append('file', file);
        formDataForUpload.append(
          'upload_preset',
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'service_market_upload'
        );
        formDataForUpload.append('folder', 'service-market/services');

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formDataForUpload }
        );

        const uploadData = await uploadRes.json();

        if (uploadRes.ok && uploadData.secure_url) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, uploadData.secure_url],
          }));
        } else {
          alert(`Failed to upload ${file.name}`);
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload images');
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Service name is required');
      return;
    }

    if (!formData.description.trim()) {
      alert('Service description is required');
      return;
    }

    if (!formData.categoryId) {
      alert('Please select a category');
      return;
    }

    const minPrice = parseFloat(formData.minPrice);
    const maxPrice = parseFloat(formData.maxPrice);
    const duration = parseInt(formData.defaultDurationMinutes, 10);

    if (isNaN(minPrice) || minPrice < 0) {
      alert('Please enter a valid minimum price');
      return;
    }

    if (isNaN(maxPrice) || maxPrice < 0) {
      alert('Please enter a valid maximum price');
      return;
    }

    if (minPrice > maxPrice) {
      alert('Minimum price cannot exceed maximum price');
      return;
    }

    if (isNaN(duration) || duration <= 0) {
      alert('Please enter a valid duration in minutes');
      return;
    }

    setSubmitting(true);

    try {
      const url = service
        ? `/api/providers/services/${service.id}`
        : '/api/providers/services';

      const method = service ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          categoryId: formData.categoryId,
          minPrice,
          maxPrice,
          defaultDurationMinutes: duration,
          isActive: formData.isActive,
          images: formData.images,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save service');
      }

      alert(service ? 'Service updated successfully!' : 'Service created successfully!');
      onClose(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save service';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = Boolean(service);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[#1F6F5F]/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-form-title"
      onClick={() => !submitting && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-[#6FCF97]/40 bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 border-b border-[#E5E7EB] bg-[#F5F7F8] px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2FA084] text-white shadow-md">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 id="service-form-title" className="text-lg font-bold text-[#1F6F5F] sm:text-xl">
                  {isEdit ? 'Edit Service' : 'Add New Service'}
                </h2>
                <p className="mt-0.5 text-xs text-[#1F6F5F]/65 sm:text-sm">
                  {isEdit
                    ? 'Update your service details below'
                    : 'Fill in the details to list a new service'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onClose()}
              disabled={submitting}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#6FCF97]/40 bg-white text-[#1F6F5F] transition hover:bg-[#EEEEEE] disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            {/* Basic info */}
            <section className="rounded-2xl border border-[#6FCF97]/30 bg-[#EEEEEE]/50 p-4 sm:p-5">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#1F6F5F]">
                Basic information
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="service-name" className={labelClass}>
                    Service name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="service-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g. AC Repair & Gas Refill"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="service-description" className={labelClass}>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="service-description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe what you offer, what's included, etc."
                    rows={4}
                    className={`${inputClass} resize-none`}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="service-category" className={labelClass}>
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="service-category"
                    value={formData.categoryId}
                    onChange={(e) => handleChange('categoryId', e.target.value)}
                    className={inputClass}
                    disabled={loadingCategories}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon ? `${category.icon} ` : ''}
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {loadingCategories && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#1F6F5F]/60">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading categories…
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="rounded-2xl border border-[#6FCF97]/30 bg-[#EEEEEE]/50 p-4 sm:p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#1F6F5F]">
                <Tag className="h-4 w-4 text-[#2FA084]" />
                Pricing & duration
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="min-price" className={labelClass}>
                    Min price (Rs) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="min-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minPrice}
                    onChange={(e) => handleChange('minPrice', e.target.value)}
                    placeholder="0"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="max-price" className={labelClass}>
                    Max price (Rs) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="max-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxPrice}
                    onChange={(e) => handleChange('maxPrice', e.target.value)}
                    placeholder="0"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="duration" className={labelClass}>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#2FA084]" />
                      Duration (minutes) <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.defaultDurationMinutes}
                    onChange={(e) => handleChange('defaultDurationMinutes', e.target.value)}
                    placeholder="e.g. 90"
                    className={inputClass}
                    required
                  />
                  <p className="mt-1.5 text-xs text-[#1F6F5F]/60">
                    Typical time needed to complete this service
                  </p>
                </div>
              </div>
            </section>

            {/* Images */}
            <section className="rounded-2xl border border-[#6FCF97]/30 bg-[#EEEEEE]/50 p-4 sm:p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#1F6F5F]">
                <ImageIcon className="h-4 w-4 text-[#2FA084]" />
                Photos
              </h3>
              <div className="space-y-3">
                <div className="rounded-xl border-2 border-dashed border-[#6FCF97]/55 bg-white p-5 text-center transition hover:border-[#2FA084] hover:bg-[#6FCF97]/10 sm:p-6">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    disabled={uploadingImages}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex cursor-pointer flex-col items-center gap-2 ${uploadingImages ? 'pointer-events-none opacity-70' : ''}`}
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="h-7 w-7 animate-spin text-[#2FA084]" />
                        <span className="text-sm font-medium text-[#1F6F5F]">Uploading…</span>
                      </>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6FCF97]/25">
                          <Upload className="h-6 w-6 text-[#2FA084]" />
                        </div>
                        <span className="text-sm font-semibold text-[#1F6F5F]">
                          Tap to upload photos
                        </span>
                        <span className="text-xs text-[#1F6F5F]/60">
                          JPEG, PNG, WebP · max 5MB each
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
                    {formData.images.map((image, index) => (
                      <div
                        key={image}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-[#6FCF97]/35 bg-[#EEEEEE]"
                      >
                        <img
                          src={image}
                          alt={`Service ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute inset-0 flex items-center justify-center bg-[#1F6F5F]/55 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <span className="flex items-center gap-1.5 rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-semibold text-white">
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-[#1F6F5F]/60">
                  {formData.images.length} photo{formData.images.length !== 1 ? 's' : ''} added
                </p>
              </div>
            </section>

            {/* Active toggle */}
            <button
              type="button"
              onClick={() => handleChange('isActive', !formData.isActive)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#6FCF97]/35 bg-white px-4 py-3.5 text-left transition hover:border-[#2FA084]/50 sm:px-5"
            >
              <div>
                <p className="text-sm font-semibold text-[#1F6F5F]">Service visible to customers</p>
                <p className="mt-0.5 text-xs text-[#1F6F5F]/60">
                  {formData.isActive
                    ? 'Active, shown in search & bookings'
                    : 'Inactive, hidden from customers'}
                </p>
              </div>
              {formData.isActive ? (
                <ToggleRight className="h-8 w-8 shrink-0 text-[#2FA084]" />
              ) : (
                <ToggleLeft className="h-8 w-8 shrink-0 text-[#1F6F5F]/40" />
              )}
            </button>
          </div>

          {/* Footer actions */}
          <div className="shrink-0 border-t border-[#6FCF97]/30 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => onClose()}
                disabled={submitting}
                className="w-full rounded-xl border border-[#6FCF97]/50 bg-[#EEEEEE] px-4 py-3 text-sm font-semibold text-[#1F6F5F] transition hover:bg-[#EEEEEE]/80 disabled:opacity-50 sm:w-auto sm:min-w-[120px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingImages}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2FA084] px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1F6F5F] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[160px]"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting
                  ? 'Saving…'
                  : isEdit
                    ? 'Update Service'
                    : 'Create Service'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
