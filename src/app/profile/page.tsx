'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  User,
  Camera,
  Lock,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { getModeDisplayLabel } from '@/lib/auth';
import ProfileModeSwitcher from '@/components/profile/ProfileModeSwitcher';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  activeMode?: string;
  hasProviderProfile?: boolean;
  canSwitchMode?: boolean;
  status: string;
  city?: string;
  address?: string;
  profileImage?: string;
  bio?: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    city: '',
    address: '',
    bio: '',
    profileImage: '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch user profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await res.json();
      setUser(data.user);
      setProfileForm({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        city: data.user.city || '',
        address: data.user.address || '',
        bio: data.user.bio || '',
        profileImage: data.user.profileImage || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setUser(data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, we'll store base64. In production, upload to cloud storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, profileImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setProfileForm({ ...profileForm, profileImage: '' });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center bg-[#F5F7F9]">
          <Loader2 className="h-8 w-8 animate-spin text-[#009966]" />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen items-center justify-center bg-[#F5F7F9]">
          <p className="text-[#BE123C]">Failed to load profile</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#F5F7F9] py-5 sm:py-7 lg:py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Header Card */}
          <div className="mb-5 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_12px_32px_-24px_rgba(31,41,55,0.5)] sm:mb-6 sm:p-6">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
              <div className="relative">
                {profileForm.profileImage ? (
                  <img
                    src={profileForm.profileImage}
                    alt="Profile"
                    className="h-20 w-20 rounded-full border-4 border-[#D1FAE5] object-cover sm:h-24 sm:w-24"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#D1FAE5] bg-[#009966] text-2xl font-bold text-white sm:h-24 sm:w-24 sm:text-3xl">
                    {user.firstName[0]}
                    {user.lastName?.[0] ?? ''}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#009966]">Profile</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1F2937] sm:text-3xl">
                  {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                </h1>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start sm:gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#D1FAE5] px-3 py-1 text-xs font-semibold text-[#007A52] sm:text-sm">
                    <Shield className="h-4 w-4" />
                    {getModeDisplayLabel(user.activeMode || user.role)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${
                      user.status === 'ACTIVE'
                        ? 'border border-[#A7F3D0] bg-[#D1FAE5] text-[#007A52]'
                        : 'border border-[#FDE68A] bg-[#FFF4D6] text-[#8A5A00]'
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <ProfileModeSwitcher
              activeMode={user.activeMode || user.role}
              canSwitchMode={user.canSwitchMode}
              onSwitched={fetchProfile}
              theme="light"
            />
          </div>

          {!user.hasProviderProfile && user.role !== 'ADMIN' && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Offer services on Servizo</p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Use the same account to become a provider and switch between customer and provider mode anytime.
                  </p>
                </div>
                <Link
                  href="/become-provider"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Briefcase className="h-4 w-4" />
                  Become a provider
                </Link>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-2 shadow-[0_10px_28px_-24px_rgba(31,41,55,0.45)]">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 rounded-xl px-4 py-3 text-center text-sm font-semibold transition sm:text-base ${
                  activeTab === 'profile'
                    ? 'bg-[#009966] text-white'
                    : 'text-[#6B7280] hover:bg-[#F5F7F9] hover:text-[#1F2937]'
                }`}
              >
                <User className="mr-2 inline-block h-5 w-5" />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 rounded-xl px-4 py-3 text-center text-sm font-semibold transition sm:text-base ${
                  activeTab === 'password'
                    ? 'bg-[#009966] text-white'
                    : 'text-[#6B7280] hover:bg-[#F5F7F9] hover:text-[#1F2937]'
                }`}
              >
                <Lock className="mr-2 inline-block h-5 w-5" />
                Change Password
              </button>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`mb-6 rounded-xl border p-4 text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-[#D1FAE5] text-[#007A52] border-[#A7F3D0]'
                  : 'bg-[#FFF1F2] text-[#BE123C] border-[#FECACA]'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_12px_32px_-24px_rgba(31,41,55,0.45)] sm:p-6">
              <form onSubmit={handleProfileSubmit}>
                {/* Avatar Section */}
                <div className="mb-8">
                  <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">
                    Profile Picture
                  </h3>
                  <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
                    <div className="relative">
                      {profileForm.profileImage ? (
                        <img
                          src={profileForm.profileImage}
                          alt="Profile"
                          className="h-28 w-28 rounded-full border-4 border-[#E5E7EB] object-cover sm:h-32 sm:w-32"
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#E5E7EB] bg-[#009966] text-3xl font-bold text-white sm:h-32 sm:w-32 sm:text-4xl">
                          {profileForm.firstName[0]}
                          {profileForm.lastName?.[0] ?? ''}
                        </div>
                      )}
                    </div>
                    <div className="flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#009966] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#007A52] sm:w-56">
                          <Camera className="h-4 w-4" />
                          Upload New Photo
                        </span>
                      </label>
                      {profileForm.profileImage && (
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#BE123C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#9F1239] sm:w-56"
                        >
                          <XCircle className="h-4 w-4" />
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="my-8 border-[#E5E7EB]" />

                {/* Personal Information */}
                <h3 className="mb-4 text-lg font-semibold text-[#1F2937]">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, firstName: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#009966]"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                      Last Name <span className="text-[#6B7280]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, lastName: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#009966]"
                    />
                  </div>

                  {/* Email - Read Only */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                      Email <span className="text-[#6B7280]">(Cannot be changed)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full cursor-not-allowed rounded-xl border border-[#E5E7EB] bg-[#F5F7F9] px-4 py-2.5 pl-10 text-sm text-[#6B7280]"
                      />
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    </div>
                  </div>

                  {/* Phone - Read Only */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                      Phone <span className="text-[#6B7280]">(Cannot be changed)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={user.phone}
                        disabled
                        className="w-full cursor-not-allowed rounded-xl border border-[#E5E7EB] bg-[#F5F7F9] px-4 py-2.5 pl-10 text-sm text-[#6B7280]"
                      />
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                      City
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, city: e.target.value })
                        }
                        className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 pl-10 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#009966]"
                        placeholder="Enter your city"
                      />
                      <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                      Address
                    </label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, address: e.target.value })
                      }
                      className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#009966]"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                      Bio
                    </label>
                    <div className="relative">
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, bio: e.target.value })
                        }
                        rows={4}
                        className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 pl-10 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#009966]"
                        placeholder="Tell us about yourself..."
                      />
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-[#6B7280]" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-[#E5E7EB] pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-[#009966] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#007A52] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-[0_12px_32px_-24px_rgba(31,41,55,0.45)] sm:p-6">
              <h3 className="mb-6 text-lg font-semibold text-[#1F2937]">
                Change Your Password
              </h3>
              <form onSubmit={handlePasswordSubmit} className="max-w-md">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={passwordForm.oldPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            oldPassword: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 pr-10 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#009966]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]"
                      >
                        {showOldPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 pr-10 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#009966]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      Must be 8+ characters with uppercase, lowercase, number, and
                      special character
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#1F2937]">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2.5 pr-10 text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#009966]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-[#E5E7EB] pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-[#009966] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#007A52] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-5 w-5" />
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
