import ProviderCard from "@/components/home/providers/ProviderCard";
import { Provider } from "@/components/home/providers/types";

interface Props {
  providers: Provider[];
}

export default function ProvidersList({ providers }: Props) {
  return (
    <div className="space-y-4">
      {providers.map((provider) => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
}
