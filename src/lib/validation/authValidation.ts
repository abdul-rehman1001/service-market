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
