    import { ProviderProfile } from './types';

interface Props {
  provider: ProviderProfile;
}

export default function ProviderSection({ provider }: Props) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-semibold mb-4">Services Offered</h3>

      <div className="flex flex-wrap gap-2">
        {provider.services.map((service) => (
          <span
            key={service}
            className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm"
          >
            {service}
          </span>
        ))}
      </div>
    </div>
  );
}
    