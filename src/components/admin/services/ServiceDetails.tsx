"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  ArrowLeft,
  Clock,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Briefcase,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

interface ServiceDetailData {
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
    description: string | null;
  };
  provider: {
    id: string;
    businessName: string | null;
    verificationStatus: string;
    averageRating: string;
    totalReviews: number;
    totalJobsCompleted: number;
    isAvailable: boolean;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      profileImage: string | null;
      city: string | null;
      status: string;
    };
  };
  bookings: {
    id: string;
    bookingNumber: string;
    status: string;
    scheduledStart: string;
    scheduledEnd: string;
    createdAt: string;
    seeker: {
      firstName: string;
      lastName: string;
    };
  }[];
  _count: {
    bookings: number;
  };
}

interface Props {
  serviceId: string;
}

export default function ServiceDetails({ serviceId }: Props) {
  const router = useRouter();
  const [service, setService] = useState<ServiceDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    minPrice: "",
    maxPrice: "",
    defaultDurationMinutes: "",
    isActive: true,
  });

  const fetchService = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/services/${serviceId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch service");
      }

      setService(data.service);
      setEditForm({
        name: data.service.name,
        description: data.service.description,
        minPrice: data.service.minPrice,
        maxPrice: data.service.maxPrice,
        defaultDurationMinutes: String(data.service.defaultDurationMinutes),
        isActive: data.service.isActive,
      });
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [serviceId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          minPrice: editForm.minPrice,
          maxPrice: editForm.maxPrice,
          defaultDurationMinutes: editForm.defaultDurationMinutes,
          isActive: editForm.isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update service");
      }

      alert("Service updated successfully");
      setEditing(false);
      fetchService();
    } catch (err: any) {
      alert("Failed to update: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!service) return;
    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to toggle status");
      }

      fetchService();
    } catch (err: any) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this service? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error + (data.details ? `\n${data.details}` : ""));
        return;
      }

      alert("Service deleted successfully");
      router.push("/admin/services");
    } catch (err: any) {
      alert("Failed to delete service: " + err.message);
    }
  };

  const formatPrice = (price: string) => {
    return formatPKR(price, 0);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBookingStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      CONFIRMED: "bg-blue-100 text-blue-700",
      EN_ROUTE: "bg-indigo-100 text-indigo-700",
      IN_PROGRESS: "bg-purple-100 text-purple-700",
      COMPLETED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-red-100 text-red-700",
      AUTO_CANCELLED: "bg-gray-200 text-gray-600",
      HOLD: "bg-orange-100 text-orange-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        <span className="ml-2 text-gray-600">Loading service details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-600 font-semibold">Error</p>
        <p className="text-sm text-gray-600 mt-1">{error}</p>
        <button
          onClick={fetchService}
          className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!service) return null;

  const providerName =
    service.provider.businessName ||
    `${service.provider.user.firstName} ${service.provider.user.lastName}`;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Services
      </Link>

      {/* Header with Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {service.name}
              </h2>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  service.isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {service.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Created {formatDate(service.createdAt)} · Updated{" "}
              {formatDate(service.updatedAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEditing(!editing)}
              className="px-3 py-2 border rounded-md text-sm flex items-center gap-1.5 hover:bg-gray-50"
            >
              <Edit3 className="w-4 h-4" />
              {editing ? "Cancel Edit" : "Edit"}
            </button>
            <button
              onClick={handleToggleStatus}
              className="px-3 py-2 border rounded-md text-sm flex items-center gap-1.5 hover:bg-gray-50 text-blue-600"
            >
              {service.isActive ? (
                <ToggleRight className="w-4 h-4" />
              ) : (
                <ToggleLeft className="w-4 h-4" />
              )}
              {service.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-2 bg-red-600 text-white rounded-md text-sm flex items-center gap-1.5 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Edit Service</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={editForm.defaultDurationMinutes}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    defaultDurationMinutes: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price (Rs.)
              </label>
              <input
                type="number"
                value={editForm.minPrice}
                onChange={(e) =>
                  setEditForm({ ...editForm, minPrice: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price (Rs.)
              </label>
              <input
                type="number"
                value={editForm.maxPrice}
                onChange={(e) =>
                  setEditForm({ ...editForm, maxPrice: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={4}
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={editForm.isActive}
              onChange={(e) =>
                setEditForm({ ...editForm, isActive: e.target.checked })
              }
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Service is active
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700 flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Service Information</h3>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                {service.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Price Range</p>
                  <p className="text-sm font-medium">
                    {formatPrice(service.minPrice)} –{" "}
                    {formatPrice(service.maxPrice)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium">
                    {service.defaultDurationMinutes} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-medium">
                    {service.category.icon && (
                      <span className="mr-1">{service.category.icon}</span>
                    )}
                    {service.category.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Service Images */}
            {service.images && service.images.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4" />
                  Service Images ({service.images.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {service.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-24 h-24 rounded-md overflow-hidden border hover:opacity-80 transition"
                    >
                      <img
                        src={img}
                        alt={`Service image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Recent Bookings ({service._count.bookings} total)
            </h3>

            {service.bookings.length === 0 ? (
              <p className="text-sm text-gray-500">No bookings for this service yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Booking #</th>
                      <th className="text-left p-2">Seeker</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Scheduled</th>
                      <th className="text-left p-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.bookings.map((booking) => (
                      <tr key={booking.id} className="border-t">
                        <td className="p-2 font-mono text-xs">
                          {booking.bookingNumber}
                        </td>
                        <td className="p-2">
                          {booking.seeker.firstName} {booking.seeker.lastName}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${getBookingStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-2 text-xs">
                          {formatDate(booking.scheduledStart)}
                        </td>
                        <td className="p-2 text-xs">
                          {formatDate(booking.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar — Provider Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Provider Information</h3>

            <div className="flex items-center gap-3">
              {service.provider.user.profileImage ? (
                <img
                  src={service.provider.user.profileImage}
                  alt={providerName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium text-lg">
                  {service.provider.user.firstName.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{providerName}</p>
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                    service.provider.verificationStatus === "APPROVED"
                      ? "bg-emerald-100 text-emerald-700"
                      : service.provider.verificationStatus === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {service.provider.verificationStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                {service.provider.user.email}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {service.provider.user.phone}
              </div>
              {service.provider.user.city && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {service.provider.user.city}
                </div>
              )}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">
                  {Number(service.provider.averageRating).toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({service.provider.totalReviews} reviews)
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="w-4 h-4 text-gray-400" />
                {service.provider.totalJobsCompleted} jobs completed
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`w-2 h-2 rounded-full ${
                    service.provider.isAvailable
                      ? "bg-emerald-500"
                      : "bg-gray-400"
                  }`}
                />
                {service.provider.isAvailable ? "Available" : "Unavailable"}
              </div>
            </div>

            <Link
              href={`/admin/users`}
              className="block text-center w-full mt-2 px-3 py-2 border rounded-md text-sm text-emerald-600 hover:bg-emerald-50"
            >
              View Provider in Users
            </Link>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <h3 className="font-semibold text-gray-900">Service Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-md p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {service._count.bookings}
                </p>
                <p className="text-xs text-gray-500">Total Bookings</p>
              </div>
              <div className="bg-gray-50 rounded-md p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {service.images.length}
                </p>
                <p className="text-xs text-gray-500">Images</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
