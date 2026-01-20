import { Sparkles } from "lucide-react";

interface Props {
  count: number;
}

export default function ProvidersAIBadge({ count }: Props) {
  return (
    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3">
      <Sparkles className="w-5 h-5 text-emerald-600" />
      <div>
        <p className="text-sm font-medium text-emerald-900">
          AI-filtered results
        </p>
        <p className="text-xs text-emerald-700">
          {count} providers found
        </p>
      </div>
    </div>
  );
}
