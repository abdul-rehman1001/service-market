'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '@/components/auth/AuthCard';
import Input from '@/components/auth/Input';
import PasswordInput from '@/components/auth/PasswordInput';
import ImageUploader from '@/components/auth/ImageUploader';
import {
  getPasswordRuleStatus,
  validateEmail,
  validatePassword,
} from '@/lib/validation/authValidation';

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
      // Send registration request
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
          role: 'PROVIDER', // fixed role
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      // Ensure we have userId before redirecting
      if (!data.user?.id) {
        setError('Registration failed: User ID not received');
        return;
      }

      console.log('Registration successful, redirecting with userId:', data.user.id);

      // Redirect to email verification page with userId only
      router.push(`/verify-email-registration?userId=${data.user.id}`);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8]">
        <p className="text-sm text-gray-500">Checking your account...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f5f7f8] px-4 py-10 md:py-16 lg:py-20">
      <AuthCard>
        <h2 className="text-3xl font-bold text-center">Service Provider</h2>
        <p className="text-center mt-1 text-gray-500">Offer your services with a new account</p>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <ImageUploader onImageUpload={handleImageUpload} imageUrl={form.profileImage} />
          
          <Input
            placeholder="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            placeholder="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            required
          />
          {fieldErrors.email && (
            <p className="-mt-2 text-sm text-red-600">{fieldErrors.email}</p>
          )}
          <Input
            placeholder="Phone Number (e.g., +92300123456)"
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
          {fieldErrors.password && (
            <p className="-mt-2 text-sm text-red-600">{fieldErrors.password}</p>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">
              Password requirements
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              {getPasswordRuleStatus(form.password).map((rule) => (
                <li
                  key={rule.key}
                  className={rule.passed ? 'text-emerald-600' : 'text-gray-500'}
                >
                  <span
                    className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${
                      rule.passed ? 'bg-emerald-600' : 'bg-gray-400'
                    }`}
                  />
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="mt-5 border-t border-gray-200 pt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </form>
      </AuthCard>
    </div>
  );
}
