import { Review } from '@/types/admin';

export const ReviewsTable = ({ reviews }: { reviews: Review[] }) => (
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b">
        <th>User</th><th>Provider</th><th>Rating</th><th>Comment</th>
      </tr>
    </thead>
    <tbody>
      {reviews.map(r => (
        <tr key={r.id} className="border-b">
          <td>{r.user}</td>
          <td>{r.provider}</td>
          <td>{r.rating}⭐</td>
          <td>{r.comment}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
