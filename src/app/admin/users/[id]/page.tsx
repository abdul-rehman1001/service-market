"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, Mail, Phone, MapPin, Calendar, Shield,
  ShieldCheck, ShieldAlert, Trash2, Star, Briefcase, CheckCircle, XCircle,
} from "lucide-react";

interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  city: string | null;
  address: string;
  profileImage: string | null;
  bio: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  phoneVerified: boolean;
  phoneVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  providerProfile: {
    id: string;
    businessName: string | null;
    yearsOfExperience: number;
    cnic: string | null;
    verificationStatus: string;
    averageRating: number;
    totalReviews: number;
    totalJobsCompleted: number;
    isAvailable: boolean;
    baseAddress: string;
    createdAt: string;
  } | null;
  _count: {
    bookingsAsSeeker: number;
    reviewsGiven: number;
    reviewsReceived: number;
    bookmarks: number;
  };
}

const statusColor: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  SUSPENDED: "bg-red-100 text-red-700",
  UNVERIFIED: "bg-yellow-100 text-yellow-700",
};

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${params.id}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!user) return;
    const newStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete user");
      router.push("/admin/users");
    } catch (err: any) {
      setError(err.message);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
        <span className="ml-3 text-slate-500">Loading user details...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-red-600 mb-4">{error || "User not found"}</p>
        <Link href="/admin/users" className="text-emerald-600 hover:underline">
          &larr; Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600"
        >
          <ArrowLeft size={16} /> Back to User Management
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleStatusToggle}
            disabled={actionLoading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition disabled:opacity-50 ${
              user.status === "SUSPENDED"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-amber-500 text-white hover:bg-amber-600"
            }`}
          >
            {user.status === "SUSPENDED" ? (
              <><ShieldCheck size={16} /> Activate Account</>
            ) : (
              <><ShieldAlert size={16} /> Suspend Account</>
            )}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            <Trash2 size={16} /> Delete Account
          </button>
        </div>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-6">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt=""
              className="w-20 h-20 rounded-full object-cover ring-2 ring-emerald-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-2xl">
              {user.firstName[0]}{user.lastName[0]}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor[user.status] || "bg-gray-100"}`}>
                {user.status}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                {user.role.toLowerCase()}
              </span>
            </div>
            {user.bio && <p className="text-sm text-slate-500 mt-1">{user.bio}</p>}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact & Personal Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg">Contact Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-slate-400" />
              <span>{user.email}</span>
              {user.emailVerified ? (
                <CheckCircle size={14} className="text-emerald-500" />
              ) : (
                <XCircle size={14} className="text-red-400" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-slate-400" />
              <span>{user.phone}</span>
              {user.phoneVerified ? (
                <CheckCircle size={14} className="text-emerald-500" />
              ) : (
                <XCircle size={14} className="text-red-400" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-slate-400" />
              <span>{user.address}{user.city ? `, ${user.city}` : ""}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-slate-400" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}</span>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg">Activity Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{user._count.bookingsAsSeeker}</p>
              <p className="text-xs text-slate-500 mt-1">Bookings Made</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{user._count.reviewsGiven}</p>
              <p className="text-xs text-slate-500 mt-1">Reviews Given</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{user._count.reviewsReceived}</p>
              <p className="text-xs text-slate-500 mt-1">Reviews Received</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{user._count.bookmarks}</p>
              <p className="text-xs text-slate-500 mt-1">Bookmarks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Provider-specific section */}
      {user.role === "PROVIDER" && user.providerProfile && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Briefcase size={18} /> Provider Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Business Name</p>
              <p className="font-medium">{user.providerProfile.businessName || "—"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">CNIC</p>
              <p className="font-medium">{user.providerProfile.cnic || "—"}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Experience</p>
              <p className="font-medium">{user.providerProfile.yearsOfExperience} years</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Verification Status</p>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                user.providerProfile.verificationStatus === "APPROVED"
                  ? "bg-emerald-100 text-emerald-700"
                  : user.providerProfile.verificationStatus === "REJECTED"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {user.providerProfile.verificationStatus}
              </span>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Rating</p>
              <p className="font-medium flex items-center gap-1">
                <Star size={14} className="text-yellow-500" />
                {Number(user.providerProfile.averageRating).toFixed(1)} ({user.providerProfile.totalReviews} reviews)
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Jobs Completed</p>
              <p className="font-medium">{user.providerProfile.totalJobsCompleted}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Availability</p>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                user.providerProfile.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}>
                {user.providerProfile.isAvailable ? "Available" : "Unavailable"}
              </span>
            </div>
            <div className="md:col-span-2">
              <p className="text-slate-500 mb-1">Base Address</p>
              <p className="font-medium">{user.providerProfile.baseAddress}</p>
            </div>
          </div>
        </div>
      )}

      {/* Verification details */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Shield size={18} /> Verification Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Email Verified:</span>
            {user.emailVerified ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle size={14} /> Yes
                {user.emailVerifiedAt && (
                  <span className="text-slate-400 ml-1">
                    ({new Date(user.emailVerifiedAt).toLocaleDateString()})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-red-500 flex items-center gap-1"><XCircle size={14} /> No</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Phone Verified:</span>
            {user.phoneVerified ? (
              <span className="text-emerald-600 flex items-center gap-1">
                <CheckCircle size={14} /> Yes
                {user.phoneVerifiedAt && (
                  <span className="text-slate-400 ml-1">
                    ({new Date(user.phoneVerifiedAt).toLocaleDateString()})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-red-500 flex items-center gap-1"><XCircle size={14} /> No</span>
            )}
          </div>
          <div>
            <span className="text-slate-500">Last Updated:</span>{" "}
            <span>{new Date(user.updatedAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
            })}</span>
          </div>
          <div>
            <span className="text-slate-500">User ID:</span>{" "}
            <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{user.id}</span>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl space-y-4">
            <h3 className="text-lg font-semibold text-red-600">Delete User</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete <strong>{user.firstName} {user.lastName}</strong>?
              This action cannot be undone. A confirmation email will be sent to the user.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-md border text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
