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
export const ADDRESS_MIN_LENGTH = 10;

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

/** Digits the user enters after the fixed +92 prefix (e.g. 3001234567). */
export const PAKISTAN_PHONE_NATIONAL_LENGTH = 10;

const PAKISTAN_PHONE_NATIONAL_REGEX = /^3\d{9}$/;

/** Stored in DB as E.164: +923XXXXXXXXX */
const PAKISTAN_MOBILE_E164_REGEX = /^\+923\d{9}$/;

/**
 * Normalizes user input to the national suffix (10 digits, leading 3).
 * Strips non-digits and common paste patterns (03…, 92…, +92…).
 */
export function formatPakistanPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('92') && digits.length > PAKISTAN_PHONE_NATIONAL_LENGTH) {
    digits = digits.slice(2);
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits.slice(0, PAKISTAN_PHONE_NATIONAL_LENGTH);
}

/**
 * Converts user suffix or legacy formats to E.164 (+923XXXXXXXXX) for storage.
 */
export function normalizePakistanPhone(phone: string): string {
  const trimmed = phone.trim();

  if (PAKISTAN_MOBILE_E164_REGEX.test(trimmed)) {
    return trimmed;
  }

  const digits = formatPakistanPhoneInput(trimmed);
  return `+92${digits}`;
}

export function validatePakistanPhone(phone: string): ValidationResult {
  const trimmed = phone.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Full E.164 (e.g. from API or normalized submit payload)
  if (trimmed.startsWith('+')) {
    if (!PAKISTAN_MOBILE_E164_REGEX.test(trimmed)) {
      return {
        isValid: false,
        error: 'Enter a valid Pakistan mobile number (e.g. 300 1234567)',
      };
    }
    return { isValid: true };
  }

  const digits = formatPakistanPhoneInput(trimmed);

  if (!digits) {
    return { isValid: false, error: 'Phone number is required' };
  }

  if (digits.length < PAKISTAN_PHONE_NATIONAL_LENGTH) {
    return {
      isValid: false,
      error: `Enter all ${PAKISTAN_PHONE_NATIONAL_LENGTH} digits after +92`,
    };
  }

  if (!digits.startsWith('3')) {
    return {
      isValid: false,
      error: 'Mobile number must start with 3 (e.g. 300 1234567)',
    };
  }

  if (!PAKISTAN_PHONE_NATIONAL_REGEX.test(digits)) {
    return {
      isValid: false,
      error: 'Enter a valid Pakistan mobile number (e.g. 300 1234567)',
    };
  }

  const e164 = `+92${digits}`;
  if (!PAKISTAN_MOBILE_E164_REGEX.test(e164)) {
    return {
      isValid: false,
      error: 'Enter a valid Pakistan mobile number (e.g. 300 1234567)',
    };
  }

  return { isValid: true };
}

const FAKE_ADDRESS_PATTERNS = [
  /^test$/i,
  /^abc+$/i,
  /^asdf+$/i,
  /^n\/?a$/i,
  /^none$/i,
  /^fake$/i,
  /^dummy$/i,
  /^address$/i,
  /^home$/i,
  /^my\s+address$/i,
  /^\d+$/,
  /^\.+$/,
  /^-+$/,
];

export function normalizeAddress(address: string): string {
  return address.trim().replace(/\s+/g, ' ');
}

export function validateFullName(name: string): ValidationResult {
  const trimmed = name.trim().replace(/\s+/g, ' ');

  if (!trimmed) {
    return { isValid: false, error: 'Full name is required' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Enter your full name' };
  }

  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: 'Enter a valid name' };
  }

  return { isValid: true };
}

function validateNamePart(
  value: string,
  fieldLabel: 'First name' | 'Last name'
): ValidationResult {
  const trimmed = value.trim().replace(/\s+/g, ' ');

  if (!trimmed) {
    return { isValid: false, error: `${fieldLabel} is required` };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: `${fieldLabel} must be at least 2 characters`,
    };
  }

  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: `Enter a valid ${fieldLabel.toLowerCase()}` };
  }

  return { isValid: true };
}

export function validateFirstName(firstName: string): ValidationResult {
  return validateNamePart(firstName, 'First name');
}

export function validateLastName(lastName: string): ValidationResult {
  const trimmed = lastName.trim().replace(/\s+/g, ' ');

  // Last name is optional — empty is stored as "" in the database.
  if (!trimmed) {
    return { isValid: true };
  }

  if (trimmed.length < 2) {
    return {
      isValid: false,
      error: 'Last name must be at least 2 characters',
    };
  }

  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: 'Enter a valid last name' };
  }

  return { isValid: true };
}

export function validateAddress(address: string): ValidationResult {
  const trimmed = normalizeAddress(address);

  if (!trimmed) {
    return { isValid: false, error: 'Address is required' };
  }

  if (trimmed.length < ADDRESS_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Address must be at least ${ADDRESS_MIN_LENGTH} characters`,
    };
  }

  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, error: 'Enter a valid street or area address' };
  }

  for (const pattern of FAKE_ADDRESS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { isValid: false, error: 'Please enter your real address' };
    }
  }

  const words = trimmed.split(/\s+/).filter((word) => word.length >= 2);
  if (words.length < 2) {
    return {
      isValid: false,
      error: 'Please include area and city (e.g. House 12, Gulberg, Lahore)',
    };
  }

  return { isValid: true };
}
