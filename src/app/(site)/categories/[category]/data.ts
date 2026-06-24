// data.ts
import { landingImages } from "@/lib/landing-images";

export interface Provider {
  id: number;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  description: string;
  image: string;
}

export interface Subcategory {
  id: number;
  name: string;
}

// Providers
export const providers: Provider[] = [
  { id: 1, name: "John Doe", role: "Master Plumber", rating: 4.9, reviews: 128, description: "Expert in residential & commercial plumbing. 24/7 emergency support available.", image: landingImages.defaultAvatar },
  { id: 2, name: "Sarah Jane", role: "Web Developer", rating: 5.0, reviews: 92, description: "Full-stack developer specializing in modern web applications and e-commerce platforms.", image: landingImages.defaultAvatarAlt },
  { id: 3, name: "Mike Ross", role: "Personal Trainer", rating: 4.8, reviews: 210, description: "Certified trainer focused on strength conditioning and personalized fitness programs.", image: landingImages.allInOne },
];


export const categoriesData: Record<string, Subcategory[]> = {
  Plumbing: [
    { id: 1, name: "Residential Plumbing" },
    { id: 2, name: "Commercial Plumbing" },
    { id: 3, name: "Emergency Plumbing" },
  ],
  "Web Development": [
    { id: 4, name: "Frontend Development" },
    { id: 5, name: "Backend Development" },
    { id: 6, name: "Full-Stack Development" },
  ],
  "Fitness Training": [
    { id: 7, name: "Personal Training" },
    { id: 8, name: "Group Training" },
    { id: 9, name: "Yoga & Pilates" },
  ],
};
