'use client';

import ProviderDetailPage from '@/components/providerDetail/ProviderDetailPage';
import { Provider } from '@/types/provider';

const MOCK_PROVIDER: Provider = {
    id: 1,
    name: 'Ahmed Plumbing Services',
    role: 'Expert Plumber',
    avatar: '/images/avatar1.png',
    category: 'plumber',
    subcategory: 'pipe_repair',

    detailedDescription: 'Ahmed is a highly experienced plumber specializing in residential and commercial plumbing solutions. Known for reliability, quick response, and high-quality workmanship.',

    services: [
        {
            name: 'Pipe Repair',
            description: 'Fixing leaking or damaged pipes',
            price: '$50 - $150',
        },
        {
            name: 'Bathroom Installation',
            description: 'Complete bathroom fittings and fixtures',
            price: '$300+',
        },
        {
            name: 'Drain Cleaning',
            description: 'Clog removal and drain maintenance',
            price: '$80',
        },
    ],

    images: [
        '/images/work1.jpg',
        '/images/work2.jpg',
        '/images/work3.jpg',
    ],

    reviews: [
        {
            id: 1,
            name: 'John Doe',
            avatar: '/images/avatar2.png',
            rating: 5,
            comment: 'Excellent service, very professional and fast.',
            date: '2024-12-10',
        },
        {
            id: 2,
            name: 'Sarah Khan',
            avatar: '/images/avatar3.png',
            rating: 4,
            comment: 'Good work, fair pricing.',
            date: '2024-12-05',
        },
    ],

    averageRating: 4.5,
    location: 'San Francisco',
    phone: '+1 234 567 890',
    email: 'ahmed@plumbing.com',
    availability: ['Mon - Fri', '9:00 AM - 6:00 PM'],
    timeSlots: ['10:00 AM', '12:00 PM', '3:00 PM'],
    avgResponseTime: '',
    jobsCompleted: 0,
    yearsOfExperience: 0,
    price: undefined,
    rating: 0
};

export default function ProviderDetailTestPage() {
  return <ProviderDetailPage provider={MOCK_PROVIDER} />;
}
