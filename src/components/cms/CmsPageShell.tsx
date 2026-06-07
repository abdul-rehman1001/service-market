import type { LucideIcon } from "lucide-react";

interface CmsPageShellProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function CmsPageShell({ icon: Icon, title, description, children }: CmsPageShellProps) {
  return (
    <section className="min-h-[60vh] bg-[#F5F7F8] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#D1FAE5] bg-[#D1FAE5]/50 text-[#059669] shadow-sm">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E3A5F] sm:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#6B7280]">{description}</p>
          ) : null}
        </header>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_4px_24px_rgba(17,24,39,0.06)] sm:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}
