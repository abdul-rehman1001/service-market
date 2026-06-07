'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthPageShell from '@/components/auth/AuthPageShell';
import ImageUploader from '@/components/auth/ImageUploader';
import Input from '@/components/auth/Input';
import PasswordInput from '@/components/auth/PasswordInput';
import PasswordRequirements from '@/components/auth/PasswordRequirements';
import {
  validateEmail,
  validatePassword,
} from '@/lib/validation/authValidation';
import { cn } from '@/lib/utils';

type AuthField = 'email' | 'password';
type FieldErrors = Partial<Record<AuthField, string>>;
type TouchedFields = Record<AuthField, boolean>;

export default function RegisterProvider() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    profileImage: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({
    email: false,
    password: false,
  });

  useEffect(() => {
    const redirectIfAuthenticated = async () => {
      try {
        const response = await fetch('/api/user', { cache: 'no-store' });
        if (!response.ok) return;

        const data = await response.json();
        if (data.user?.hasProviderProfile) {
          router.replace('/provider/dashboard');
          return;
        }

        router.replace('/become-provider');
      } catch {
        // Allow new registration flow
      } finally {
        setCheckingSession(false);
      }
    };

    redirectIfAuthenticated();
  }, [router]);

  const validateEmailField = (emailValue: string, showRequired: boolean): string => {
    const trimmedEmail = emailValue.trim();

    if (!trimmedEmail && !showRequired) {
      return '';
    }

    const validation = validateEmail(trimmedEmail);
    return validation.isValid ? '' : validation.error || 'Enter a valid email address';
  };

  const validatePasswordField = (passwordValue: string, showRequired: boolean): string => {
    if (!passwordValue && !showRequired) {
      return '';
    }

    const validation = validatePassword(passwordValue);
    return validation.isValid
      ? ''
      : validation.error || 'Please choose a stronger password';
  };

  const updateFieldValidation = (field: AuthField, value: string, showRequired: boolean) => {
    const nextError =
      field === 'email'
        ? validateEmailField(value, showRequired)
        : validatePasswordField(value, showRequired);

    setFieldErrors((prev) => ({ ...prev, [field]: nextError }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    if (name === 'email' || name === 'password') {
      updateFieldValidation(name, value, touchedFields[name]);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name !== 'email' && name !== 'password') {
      return;
    }

    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    updateFieldValidation(name, value, true);
  };

  const handleImageUpload = (imageUrl: string) => {
    setForm({ ...form, profileImage: imageUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nextFieldErrors: FieldErrors = {
      email: validateEmailField(form.email, true),
      password: validatePasswordField(form.password, true),
    };

    setTouchedFields({ email: true, password: true });
    setFieldErrors(nextFieldErrors);

    if (nextFieldErrors.email || nextFieldErrors.password) {
      setError('Please fix the highlighted fields before creating your account.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          profileImage: form.profileImage,
          address: form.address,
          role: 'PROVIDER',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      if (!data.user?.id) {
        setError('Registration failed: User ID not received');
        return;
      }

      console.log('Registration successful, redirecting with userId:', data.user.id);

      router.push(`/verify-email-registration?userId=${data.user.id}`);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <AuthPageShell>
        <AuthCard>
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
            <p className="text-sm text-[#6B7280]">Checking your account...</p>
          </div>
        </AuthCard>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell maxWidth="lg">
      <AuthCard>
        <AuthHeader
          badge="Provider account"
          title="Join as a service provider"
          subtitle="Offer your services with a new professional account"
        />

        {error ? (
          <div
            className="mt-5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-center text-sm text-[#EF4444]"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <ImageUploader onImageUpload={handleImageUpload} imageUrl={form.profileImage} />

          <Input
            placeholder="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            placeholder="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            required
          />
          {fieldErrors.email ? (
            <p className="-mt-2 text-sm text-[#EF4444]">{fieldErrors.email}</p>
          ) : null}
          <Input
            placeholder="Phone number (e.g., +923001234567)"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <Input
            placeholder="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
          <PasswordInput
            placeholder="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="new-password"
            aria-invalid={Boolean(fieldErrors.password)}
            required
          />
          {fieldErrors.password ? (
            <p className="-mt-2 text-sm text-[#EF4444]">{fieldErrors.password}</p>
          ) : null}

          <PasswordRequirements password={form.password} />

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition-all duration-200',
              'hover:bg-[#059669] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Create account
              </>
            )}
          </button>

          <div className="border-t border-[#E5E7EB] pt-5 text-center">
            <p className="text-sm text-[#6B7280]">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#10B981] transition hover:text-[#059669] hover:underline"
              >
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-sm">
              <Link
                href="/register"
                className="font-medium text-[#1E3A5F] transition hover:text-[#10B981] hover:underline"
              >
                ← Choose a different account type
              </Link>
            </p>
          </div>
        </form>
      </AuthCard>
    </AuthPageShell>
  );
}
