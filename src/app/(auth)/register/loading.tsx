import AuthCard from '@/components/auth/AuthCard';
import AuthPageShell from '@/components/auth/AuthPageShell';

export default function RegisterLoading() {
  return (
    <AuthPageShell maxWidth="xl">
      <AuthCard>
        <div className="animate-pulse space-y-6">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-6 w-24 rounded-full bg-[#E5E7EB]" />
            <div className="mx-auto h-8 w-56 rounded-lg bg-[#E5E7EB]" />
            <div className="mx-auto h-4 w-72 rounded-lg bg-[#F3F4F6]" />
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="h-52 flex-1 rounded-2xl bg-[#F3F4F6]" />
            <div className="h-52 flex-1 rounded-2xl bg-[#F3F4F6]" />
          </div>
          <div className="mx-auto h-4 w-48 rounded bg-[#F3F4F6]" />
        </div>
      </AuthCard>
    </AuthPageShell>
  );
}
