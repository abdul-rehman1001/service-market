import { ProfileUser } from './types';

interface Props {
  user: ProfileUser;
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function ProfileTabs({ user, activeTab, onChange }: Props) {
  const tabs =
    user.role === 'provider'
      ? ['overview', 'services']
      : ['overview', 'activity'];

  return (
    <div className="flex gap-6 border-b mt-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`pb-3 text-sm font-medium capitalize ${
            activeTab === tab
              ? 'border-b-2 border-emerald-600 text-emerald-600'
              : 'text-gray-600'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
