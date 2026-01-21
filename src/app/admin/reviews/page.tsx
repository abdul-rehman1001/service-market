import { ReviewsTable } from '@/components/admin/tables/ReviewsTable';
import { Review } from '@/types/admin';

const reviews: Review[] = [
  {
    id: '1',
    user: 'Sarah Jenkins',
    provider: 'Emma Wilson',
    rating: 5,
    comment: 'Excellent service!',
  },
  {
    id: '2',
    user: 'Michael Chen',
    provider: 'David Miller',
    rating: 3,
    comment: 'Good but room for improvement.',
  },
];

export default function ReviewsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reviews</h1>

      <div className="bg-white rounded-lg border p-4">
        <ReviewsTable reviews={reviews} />
      </div>
    </div>
  );
}
