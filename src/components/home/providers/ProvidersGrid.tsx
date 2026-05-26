import { Provider } from "./types";
import ProviderCard from "./ProviderCard";

interface Props {
  providers: Provider[];
}

export default function ProvidersGrid({ providers }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
}
