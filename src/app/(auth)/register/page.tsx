import Link from 'next/link';
import { Briefcase, Search } from 'lucide-react';
import AuthCard from '@/components/auth/AuthCard';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthPageShell from '@/components/auth/AuthPageShell';
import RoleCard from '@/components/auth/RoleCard';

export default function RegisterChooseRole() {
  return (
    <AuthPageShell maxWidth="xl">
      <AuthCard>
        <AuthHeader
          badge="Get started"
          title="Create your account"
          subtitle="Start as a customer. You can add provider services later from the same account."
        />

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-5">
          <RoleCard
            href="/register/seeker"
            title="Service Seeker"
            description="Find verified professionals for home repairs, cleaning, and more."
            icon={<Search className="h-7 w-7" />}
            accent="emerald"
          />

          <RoleCard
            href="/register/provider"
            title="Service Provider"
            description="Offer your skills, manage bookings, and grow your business."
            icon={<Briefcase className="h-7 w-7" />}
            accent="navy"
          />
        </div>

        <p className="mt-8 text-center text-sm text-[#6B7280]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#10B981] transition hover:text-[#059669] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthPageShell>
  );
}
