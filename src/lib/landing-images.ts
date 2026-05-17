/**
 * Landing Page Images - Centralized Cloudinary URLs
 * This utility prevents code repetition and makes it easy to maintain image paths
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'deua6ipco';

// Base Cloudinary image URL builder
function buildCloudinaryUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
}

// Landing Page Images
export const landingImages = {
  // HeroCarousel images
  seeker: buildCloudinaryUrl('seeker_levrko'),
  provider: buildCloudinaryUrl('provider_juhjui'),
  allInOne: buildCloudinaryUrl('AllInOne_mfamea'),
  
  // Features section images
  plumber: buildCloudinaryUrl('plumber_ztwowc'),
  electrician: buildCloudinaryUrl('electrician_qc71vv'),
  autoMechanic: buildCloudinaryUrl('autoMechanic_fafx18'),
  
  // Hero section images
  service2: buildCloudinaryUrl('service2_hjd8r5'),
  
  // Logo (kept local as it's a UI element)
  logo: '/images/Servizo.jpeg',
};
