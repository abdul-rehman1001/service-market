import { Loader2 } from "lucide-react";

export default function CmsPageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#F5F7F8] px-4">
      <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
    </div>
  );
}
