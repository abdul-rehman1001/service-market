/**
 * Centralized image URLs for marketing and shared UI fallbacks.
 * Landing assets live on Cloudinary; local /public/images files were removed.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'deua6ipco';

export function buildCloudinaryUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
}

/** Legacy local filenames → Cloudinary (matches former public/images names). */
export const legacyImageRedirects: Record<string, string> = {
  'service1.png': buildCloudinaryUrl('seeker_levrko'),
  'service2.png': buildCloudinaryUrl('service2_hjd8r5'),
  'service3.png': buildCloudinaryUrl('AllInOne_mfamea'),
  'avatar1.png': buildCloudinaryUrl('seeker_levrko'),
  'avatar2.png': buildCloudinaryUrl('provider_juhjui'),
  'world-map.png': buildCloudinaryUrl('AllInOne_mfamea'),
  'logo-icon.png': '/images/Servizo.jpeg',
  'john.jpg': buildCloudinaryUrl('seeker_levrko'),
  'sarah.jpg': buildCloudinaryUrl('provider_juhjui'),
  'mike.jpg': buildCloudinaryUrl('AllInOne_mfamea'),
};

export const landingImages = {
  seeker: buildCloudinaryUrl('seeker_levrko'),
  provider: buildCloudinaryUrl('provider_juhjui'),
  allInOne: buildCloudinaryUrl('AllInOne_mfamea'),
  plumber: buildCloudinaryUrl('plumber_ztwowc'),
  electrician: buildCloudinaryUrl('electrician_qc71vv'),
  autoMechanic: buildCloudinaryUrl('autoMechanic_fafx18'),
  service1: buildCloudinaryUrl('seeker_levrko'),
  service2: buildCloudinaryUrl('service2_hjd8r5'),
  service3: buildCloudinaryUrl('AllInOne_mfamea'),
  defaultAvatar: buildCloudinaryUrl('seeker_levrko'),
  defaultAvatarAlt: buildCloudinaryUrl('provider_juhjui'),
  banner: buildCloudinaryUrl('AllInOne_mfamea'),
  logo: '/images/Servizo.jpeg',
  notificationIcon: '/images/Servizo.jpeg',
};
