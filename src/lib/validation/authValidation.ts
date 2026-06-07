export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordRuleStatus {
  key: string;
  label: string;
  passed: boolean;
}

export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PASSWORD_RULES = [
  {
    key: 'length',
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (password: string) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    key: 'uppercase',
    label: 'At least one uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    key: 'lowercase',
    label: 'At least one lowercase letter',
    test: (password: string) => /[a-z]/.test(password),
  },
  {
    key: 'number',
    label: 'At least one number',
    test: (password: string) => /\d/.test(password),
  },
  {
    key: 'special',
    label: 'At least one special character',
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
  {
    key: 'spaces',
    label: 'No spaces',
    test: (password: string) => !/\s/.test(password),
  },
] as const;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): ValidationResult {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { isValid: false, error: 'Enter a valid email address' };
  }

  return { isValid: true };
}

export function getPasswordRuleStatus(password: string): PasswordRuleStatus[] {
  return PASSWORD_RULES.map((rule) => ({
    key: rule.key,
    label: rule.label,
    passed: rule.test(password),
  }));
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  const failedRules = getPasswordRuleStatus(password).filter((rule) => !rule.passed);

  if (failedRules.length > 0) {
    return {
      isValid: false,
      error:
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character (no spaces).',
    };
  }

  return { isValid: true };
}

/** Pakistan mobile in E.164: +92 followed by 10 digits starting with 3 */
const PAKISTAN_MOBILE_E164_REGEX = /^\+923\d{9}$/;

/**
 * Normalizes common Pakistan mobile inputs to +923XXXXXXXXX.
 * Accepts: +923001234567, 923001234567, 03001234567, 3001234567
 */
export function normalizePakistanPhone(phone: string): string {
  const raw = phone.trim().replace(/[\s\-().]/g, '');
  if (!raw) return '';

  if (raw.startsWith('+92')) {
    const national = raw.slice(3).replace(/\D/g, '');
    return `+92${national}`;
  }

  const digits = raw.replace(/\D/g, '');

  if (digits.startsWith('92') && digits.length >= 12) {
    return `+92${digits.slice(2, 12)}`;
  }
  if (digits.startsWith('0') && digits.length >= 11) {
    return `+92${digits.slice(1, 11)}`;
  }
  if (digits.startsWith('3') && digits.length >= 10) {
    return `+92${digits.slice(0, 10)}`;
  }

  return raw.startsWith('+') ? raw : `+${digits}`;
}

export function validatePakistanPhone(phone: string): ValidationResult {
  const trimmed = phone.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required' };
  }

  const normalized = normalizePakistanPhone(trimmed);

  if (!PAKISTAN_MOBILE_E164_REGEX.test(normalized)) {
    return {
      isValid: false,
      error: 'Enter a valid Pakistan mobile number (e.g. 03001234567 or +923001234567)',
    };
  }

  return { isValid: true };
}
