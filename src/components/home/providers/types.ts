export interface Service {
  id: string;
  name: string;
  description: string;
}

export interface Provider {
  id: string;
  userId: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  description: string;
  avatar: string;
  mainService?: Service;
  allServices?: Service[];
  category?: string;
  subcategory?: string;
}
