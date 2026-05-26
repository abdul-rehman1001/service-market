// src/components/home/providers/data.ts
import { landingImages } from "@/lib/landing-images";
import { Provider } from "./types";

export const allProviders: Provider[] = [
  {
    id: "1",
    userId: "1",
    name: "Ahmed",
    role: "Expert Plumber",
    rating: 4.9,
    reviews: 138,
    description: "Specializing in pipe repairs, leak fixes, and bathroom installations.",
    avatar: landingImages.defaultAvatar,
    category: "plumber",
    subcategory: "pipe_repair",
  },
  {
    id: "2",
    userId: "2",
    name: "Ahsan",
    role: "Professional Plumber",
    rating: 5.0,
    reviews: 95,
    description: "Expert in sink repairs, faucet installations, and drain cleaning.",
    avatar: landingImages.defaultAvatarAlt,
    category: "plumber",
    subcategory: "sink_issues",
  },
  // keep the rest exactly as-is
];
