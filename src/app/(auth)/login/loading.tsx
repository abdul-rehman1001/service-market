import AuthCard from '@/components/auth/AuthCard';
import AuthPageShell from '@/components/auth/AuthPageShell';

export default function LoginLoading() {
  return (
    <AuthPageShell>
      <AuthCard>
        <div className="animate-pulse space-y-6">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-6 w-24 rounded-full bg-[#E5E7EB]" />
            <div className="mx-auto h-8 w-48 rounded-lg bg-[#E5E7EB]" />
            <div className="mx-auto h-4 w-64 rounded-lg bg-[#F3F4F6]" />
          </div>
          <div className="space-y-4">
            <div className="h-12 rounded-xl bg-[#F3F4F6]" />
            <div className="h-12 rounded-xl bg-[#F3F4F6]" />
            <div className="h-16 rounded-xl bg-[#F3F4F6]" />
          </div>
          <div className="h-12 rounded-xl bg-[#D1FAE5]/60" />
          <div className="space-y-2 pt-2">
            <div className="mx-auto h-4 w-40 rounded bg-[#F3F4F6]" />
            <div className="mx-auto h-4 w-32 rounded bg-[#F3F4F6]" />
          </div>
        </div>
      </AuthCard>
    </AuthPageShell>
  );
}
