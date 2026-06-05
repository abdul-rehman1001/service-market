import { Provider } from "./types";
import ProviderCard from "./ProviderCard";

interface Props {
  providers: Provider[];
}

export default function ProvidersGrid({ providers }: Props) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
}
