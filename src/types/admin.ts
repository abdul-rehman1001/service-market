export type User = {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Blocked';
};

export type Provider = {
  id: string;
  name: string;
  services: number;
  status: 'Approved' | 'Pending';
};

export type Service = {
  id: string;
  title: string;
  provider: string;
  status: 'Active' | 'Inactive';
};

export type Booking = {
  id: string;
  user: string;
  provider: string;
  service: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
};

export type Review = {
  id: string;
  user: string;
  provider: string;
  rating: number;
  comment: string;
};
