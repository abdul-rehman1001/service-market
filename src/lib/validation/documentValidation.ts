// File validation utilities for document uploads

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const MAX_CNIC_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_CERTIFICATE_SIZE = 2 * 1024 * 1024; // 2MB

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
export const ALLOWED_PDF_TYPES = ['application/pdf'];

/**
 * Validate CNIC number format
 * Must be exactly 13 digits
 */
export function validateCNIC(cnic: string): FileValidationResult {
  const cnicRegex = /^\d{13}$/;
  
  if (!cnic) {
    return { isValid: false, error: 'CNIC number is required' };
  }

  if (!cnicRegex.test(cnic)) {
    return {
      isValid: false,
      error: 'CNIC must be exactly 13 digits',
    };
  }

  return { isValid: true };
}

/**
 * Validate CNIC image file
 */
export function validateCNICImage(
  file: File | { size: number; type: string }
): FileValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG and PNG images are allowed for CNIC',
    };
  }

  if (file.size > MAX_CNIC_SIZE) {
    return {
      isValid: false,
      error: 'CNIC image size must not exceed 5MB',
    };
  }

  return { isValid: true };
}

/**
 * Validate certificate PDF file
 */
export function validateCertificatePDF(
  file: File | { size: number; type: string }
): FileValidationResult {
  if (!ALLOWED_PDF_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only PDF files are allowed for certificates',
    };
  }

  if (file.size > MAX_CERTIFICATE_SIZE) {
    return {
      isValid: false,
      error: 'Certificate PDF size must not exceed 2MB',
    };
  }

  return { isValid: true };
}

/**
 * Generic file validator based on document type
 */
export function validateDocumentFile(
  documentType: 'CNIC_FRONT' | 'CNIC_BACK' | 'CERTIFICATE' | 'OTHER',
  file: File | { size: number; type: string }
): FileValidationResult {
  switch (documentType) {
    case 'CNIC_FRONT':
    case 'CNIC_BACK':
      return validateCNICImage(file);
    case 'CERTIFICATE':
      return validateCertificatePDF(file);
    default:
      // For OTHER types, allow images or PDFs up to 5MB
      if (
        ![...ALLOWED_IMAGE_TYPES, ...ALLOWED_PDF_TYPES].includes(file.type)
      ) {
        return {
          isValid: false,
          error: 'Invalid file type. Only images (JPEG, PNG) or PDF files are allowed',
        };
      }
      if (file.size > MAX_CNIC_SIZE) {
        return {
          isValid: false,
          error: 'File size must not exceed 5MB',
        };
      }
      return { isValid: true };
  }
}
