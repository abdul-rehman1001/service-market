'use client';

import SearchResults from '@/components/home/services/services';
import { Provider } from '@/components/home/providers/types';

// Sample data - Replace with actual API call
const SAMPLE_PROVIDERS: Provider[] = [
   {
    id: 1,
    name: "Ahmed",
    role: "Expert Plumber",
    rating: 4.9,
    reviews: 138,
    description: "Specializing in pipe repairs, leak fixes, and bathroom installations.",
    avatar: "/images/avatar1.png",
    category: "plumber",
    subcategory: "pipe_repair",
  },
  {
    id: 2,
    name: "Ahsan",
    role: "Professional Plumber",
    rating: 5.0,
    reviews: 95,
    description: "Expert in sink repairs, faucet installations, and drain cleaning.",
    avatar: "/images/avatar2.png",
    category: "plumber",
    subcategory: "sink_issues",
  },
];

export default function SearchResultsPage() {
  return (
    <SearchResults
      searchQuery="Plumbers"
      location="San Francisco"
      providers={SAMPLE_PROVIDERS}
      totalResults={24}
    />
  );
}