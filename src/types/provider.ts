// src/types/provider.ts

import { ReactNode } from "react";

export interface Service {
  name: string;
  description: string;
  price: string;
}

export interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Provider {
  avgResponseTime: string;
  jobsCompleted: number;
  yearsOfExperience: number;
  price: ReactNode;
  id: number;
  name: string;
  role: string;
  rating: number;
  reviews: Review[];
  detailedDescription: string;
  avatar: string;
  category: string;
  subcategory: string;
  services: Service[];
  images: string[];
  timeSlots: string[];
  phone?: string;
  email?: string;
  location?: string;
  availability?: string[];
  averageRating?: number;
}
