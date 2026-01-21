import { SeekerProfile } from './types';

interface Props {
  seeker: SeekerProfile;
}

export default function SeekerSection({ seeker }: Props) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-semibold mb-2">Account Activity</h3>
      <p className="text-gray-600">
        Member since {seeker.memberSince}
      </p>
    </div>
  );
}
