"use client";

import { FormEvent, useEffect, useState } from "react";
import { Camera, CheckCircle, Loader2, Mail, Save, Shield } from "lucide-react";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  city?: string;
  address?: string;
  bio?: string;
  profileImage?: string;
}

interface ProfileFormState {
  firstName: string;
  lastName: string;
  city: string;
  address: string;
  bio: string;
  profileImage: string;
}

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | ""; text: string }>({
    type: "",
    text: "",
  });
  const [form, setForm] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    city: "",
    address: "",
    bio: "",
    profileImage: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await res.json();
        const profile: UserProfile | undefined = data?.user;
        if (!profile) throw new Error("Profile data is missing");

        setUser(profile);
        setForm({
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          city: profile.city || "",
          address: profile.address || "",
          bio: profile.bio || "",
          profileImage: profile.profileImage || "",
        });
      } catch (error) {
        setMessage({ type: "error", text: "Could not load profile details." });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, profileImage: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Unable to save profile");
      }

      setUser(data.user);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (error) {
      setMessage({ type: "error", text: "Could not save profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="flex h-72 flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[var(--admin-green)]" size={34} />
        <p className="text-sm text-[var(--admin-green)]/70">Loading profile…</p>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-6">
      <div className="admin-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          {form.profileImage ? (
            <img
              src={form.profileImage}
              alt={`${form.firstName} ${form.lastName}`.trim() || "Admin"}
              className="h-20 w-20 rounded-2xl object-cover ring-2 ring-[var(--admin-beige)]/80"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--admin-green)] text-2xl font-bold text-white">
              {form.firstName[0] || "A"}
              {form.lastName[0] || ""}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[var(--admin-green-dark)]">
              {(user?.firstName || form.firstName) + " " + (user?.lastName || form.lastName)}
            </h2>
            <p className="mt-1 flex items-center justify-center gap-2 break-all text-sm text-[var(--admin-green)]/70 sm:justify-start">
              <Mail size={15} />
              {user?.email || "admin@servicemarket.com"}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--admin-green-muted)] px-3 py-1 text-xs font-semibold text-[var(--admin-green-dark)]">
              <Shield size={13} />
              {user?.role || "ADMIN"}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-card rounded-2xl p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-green-dark)]">First Name</label>
            <input
              value={form.firstName}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              className="w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-4 py-2.5 text-sm text-[var(--admin-green-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-green-dark)]">Last Name</label>
            <input
              value={form.lastName}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              className="w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-4 py-2.5 text-sm text-[var(--admin-green-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-green-dark)]">City</label>
            <input
              value={form.city}
              onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              className="w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-4 py-2.5 text-sm text-[var(--admin-green-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-green-dark)]">Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-4 py-2.5 text-sm text-[var(--admin-green-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-green-dark)]">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="w-full rounded-xl border border-[var(--admin-beige)]/60 bg-white px-4 py-2.5 text-sm text-[var(--admin-green-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-green)]/20"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-[var(--admin-green-dark)]">Profile Picture</label>
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--admin-green)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--admin-green-dark)] sm:w-auto">
              <Camera size={16} />
              Upload Photo
              <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
            </label>
          </div>
        </div>

        {message.text ? (
          <div
            className={`mt-5 rounded-xl border px-3 py-2 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end border-t border-[var(--admin-beige)]/50 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--admin-green)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--admin-green-dark)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
