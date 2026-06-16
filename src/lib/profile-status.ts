export type ProviderVerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

type ProfileStatusInput = {
  status: string;
  hasProviderProfile?: boolean;
  providerVerificationStatus?: ProviderVerificationStatus | string | null;
};

/**
 * Badge label + styles for the profile header.
 * Providers see CNIC/identity verification status; seekers see account status.
 */
export function getProfileStatusBadge(user: ProfileStatusInput): {
  label: string;
  className: string;
} {
  if (user.hasProviderProfile && user.providerVerificationStatus) {
    switch (user.providerVerificationStatus) {
      case 'APPROVED':
        return {
          label: 'Verified',
          className: 'border border-[#A7F3D0] bg-[#D1FAE5] text-[#007A52]',
        };
      case 'REJECTED':
        return {
          label: 'Verification rejected',
          className: 'border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]',
        };
      case 'PENDING':
      default:
        return {
          label: 'Pending verification',
          className: 'border border-[#FDE68A] bg-[#FFF4D6] text-[#8A5A00]',
        };
    }
  }

  if (user.status === 'ACTIVE') {
    return {
      label: 'Active',
      className: 'border border-[#A7F3D0] bg-[#D1FAE5] text-[#007A52]',
    };
  }

  if (user.status === 'SUSPENDED') {
    return {
      label: 'Suspended',
      className: 'border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]',
    };
  }

  return {
    label: 'Unverified',
    className: 'border border-[#FDE68A] bg-[#FFF4D6] text-[#8A5A00]',
  };
}
