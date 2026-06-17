'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
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
  Loader2,
  Eye,
  EyeOff,
  XCircle,
} from 'lucide-react';
import { getModeDisplayLabel } from '@/lib/auth';
import { getProfileStatusBadge } from '@/lib/profile-status';
import ProfileModeSwitcher from '@/components/profile/ProfileModeSwitcher';
import { authenticatedFetch } from '@/lib/authenticatedFetch';

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
  providerVerificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  status: string;
  city?: string;
  address?: string;
  profileImage?: string;
  bio?: string;
}

const inputClass =
  'w-full rounded-xl border border-[#6FCF97]/45 bg-white px-4 py-2.5 text-sm text-[#1F6F5F] shadow-sm transition focus:border-[#2FA084] focus:outline-none focus:ring-2 focus:ring-[#2FA084]/25';

const labelClass = 'mb-1.5 block text-sm font-semibold text-[#1F6F5F]';

export const ProviderProfilePanel: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [message, setMessage] = useState<{ type: '' | 'success' | 'error'; text: string }>({
    type: '',
    text: '',
  });

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    city: '',
    address: '',
    bio: '',
    profileImage: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authenticatedFetch('/api/profile');
      if (!res.ok) {
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
      setMessage({ type: '', text: '' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await authenticatedFetch('/api/profile', {
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
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to update profile';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await authenticatedFetch('/api/profile/change-password', {
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
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Failed to change password';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileForm((prev) => ({ ...prev, profileImage: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#6FCF97]/35 bg-white py-16">
        <Loader2 className="h-9 w-9 animate-spin text-[#2FA084]" />
        <p className="text-sm text-[#1F6F5F]/70">Loading profile…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
        Failed to load profile. Please refresh the page.
      </section>
    );
  }

  const statusBadge = getProfileStatusBadge(user);

  return (
    <section className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1F6F5F] sm:text-2xl">My Profile</h2>
        <p className="mt-1 text-sm text-[#1F6F5F]/70">Manage your account details and password</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#6FCF97]/35 bg-white shadow-sm">
        <div className="border-b border-[#6FCF97]/25 bg-[#EEEEEE] p-4 sm:p-5">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
            {profileForm.profileImage ? (
              <img
                src={profileForm.profileImage}
                alt="Profile"
                className="h-20 w-20 rounded-full border-4 border-[#6FCF97] object-cover sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#6FCF97] bg-[#2FA084] text-2xl font-bold text-white sm:h-24 sm:w-24">
                {user.firstName[0]}
                {user.lastName?.[0] ?? ''}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-[#1F6F5F] sm:text-2xl">
                {[user.firstName, user.lastName].filter(Boolean).join(' ')}
              </h3>
              <p className="mt-1 flex items-center justify-center gap-2 text-sm text-[#1F6F5F]/70 sm:justify-start">
                <Mail className="h-4 w-4 shrink-0 text-[#2FA084]" />
                <span className="truncate">{user.email}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full border border-[#6FCF97]/40 bg-[#6FCF97]/20 px-3 py-1 text-xs font-semibold text-[#1F6F5F]">
                  <Shield className="h-3.5 w-3.5" />
                  {getModeDisplayLabel(user.activeMode || user.role)}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge.className}`}
                >
                  {statusBadge.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileModeSwitcher
        activeMode={user.activeMode || user.role}
        canSwitchMode={user.canSwitchMode}
        onSwitched={fetchProfile}
        theme="dashboard"
      />

      <div className="rounded-2xl border border-[#6FCF97]/35 bg-white p-2 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-[#2FA084] text-white shadow-md'
                : 'text-[#1F6F5F] hover:bg-[#EEEEEE]'
            }`}
          >
            <User className="h-4 w-4" />
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'password'
                ? 'bg-[#2FA084] text-white shadow-md'
                : 'text-[#1F6F5F] hover:bg-[#EEEEEE]'
            }`}
          >
            <Lock className="h-4 w-4" />
            Password
          </button>
        </div>
      </div>

      {message.text && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            message.type === 'success'
              ? 'border-[#6FCF97]/50 bg-[#6FCF97]/15 text-[#1F6F5F]'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {activeTab === 'profile' && (
        <form
          onSubmit={handleProfileSubmit}
          className="overflow-hidden rounded-2xl border border-[#6FCF97]/35 bg-white p-4 shadow-sm sm:p-6"
        >
          <h3 className="mb-4 text-base font-bold text-[#1F6F5F]">Profile picture</h3>
          <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            {profileForm.profileImage ? (
              <img
                src={profileForm.profileImage}
                alt="Profile"
                className="h-24 w-24 rounded-full border-4 border-[#6FCF97]/50 object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#6FCF97]/50 bg-[#2FA084] text-3xl font-bold text-white">
                {profileForm.firstName[0]}
                {profileForm.lastName?.[0] ?? ''}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2FA084] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1F6F5F] sm:w-auto">
                  <Camera className="h-4 w-4" />
                  Upload photo
                </span>
              </label>
              {profileForm.profileImage && (
                <button
                  type="button"
                  onClick={() => setProfileForm((prev) => ({ ...prev, profileImage: '' }))}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  <XCircle className="h-4 w-4" />
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <hr className="mb-6 border-[#EEEEEE]" />

          <h3 className="mb-4 text-base font-bold text-[#1F6F5F]">Personal information</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>First name *</label>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Last name <span className="font-normal text-[#1F6F5F]/55">(optional)</span>
              </label>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Email <span className="font-normal text-[#1F6F5F]/55">(read-only)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2FA084]" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className={`${inputClass} cursor-not-allowed bg-[#EEEEEE] pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Phone <span className="font-normal text-[#1F6F5F]/55">(read-only)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2FA084]" />
                <input
                  type="tel"
                  value={user.phone}
                  disabled
                  className={`${inputClass} cursor-not-allowed bg-[#EEEEEE] pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2FA084]" />
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, city: e.target.value }))}
                  className={`${inputClass} pl-10`}
                  placeholder="Your city"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                className={inputClass}
                placeholder="Your address"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Bio</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-[#2FA084]" />
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className={`${inputClass} resize-none pl-10`}
                  placeholder="Tell customers about yourself…"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-[#EEEEEE] pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2FA084] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1F6F5F] disabled:opacity-50 sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'password' && (
        <form
          onSubmit={handlePasswordSubmit}
          className="overflow-hidden rounded-2xl border border-[#6FCF97]/35 bg-white p-4 shadow-sm sm:p-6"
        >
          <h3 className="mb-6 text-base font-bold text-[#1F6F5F]">Change password</h3>
          <div className="mx-auto max-w-md space-y-4">
            {(['oldPassword', 'newPassword', 'confirmPassword'] as const).map((field, idx) => {
              const labels = ['Current password *', 'New password *', 'Confirm new password *'];
              const show =
                idx === 0 ? showOldPassword : idx === 1 ? showNewPassword : showConfirmPassword;
              const setShow =
                idx === 0
                  ? setShowOldPassword
                  : idx === 1
                    ? setShowNewPassword
                    : setShowConfirmPassword;
              return (
                <div key={field}>
                  <label className={labelClass}>{labels[idx]}</label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      value={passwordForm[field]}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                      className={`${inputClass} pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F6F5F]/55 hover:text-[#1F6F5F]"
                    >
                      {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {field === 'newPassword' && (
                    <p className="mt-1 text-xs text-[#1F6F5F]/55">
                      8+ characters with uppercase, lowercase, number, and special character
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end border-t border-[#EEEEEE] pt-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2FA084] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1F6F5F] disabled:opacity-50 sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Changing…
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  Change password
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};
