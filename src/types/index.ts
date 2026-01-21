// src/types/index.ts
export type Service = {
  id: string;
  title: string;
  durationMin: number;
  price?: number;
  status: 'Active' | 'Paused' | 'Inactive';
  image?: string;
};

export type Appointment = {
  id: string;
  time: string; // e.g. "09:00 AM"
  name: string;
  service: string;
  durationMin: number;
  status?: 'Upcoming' | 'CheckedIn' | 'Finished';
  avatar?: string;
};
