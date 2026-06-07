'use client';

import Image from 'next/image';
import Link from 'next/link';
import { landingImages } from '@/lib/landing-images';
import { cn } from '@/lib/utils';

interface AuthPageShellProps {
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl';
  className?: string;
}

const maxWidthClass = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
} as const;

export default function AuthPageShell({
  children,
  maxWidth = 'md',
  className,
}: AuthPageShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F7F8]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(16,185,129,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#D1FAE5]/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#1E3A5F]/5 blur-3xl" />

      <div
        className={cn(
          'relative mx-auto flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-12',
          className
        )}
      >
        <Link
          href="/home"
          className="mb-8 flex flex-col items-center gap-2 transition-opacity hover:opacity-85 sm:mb-10"
        >
          <Image
            src={landingImages.logo}
            alt="Servizo"
            width={48}
            height={48}
            className="h-11 w-auto sm:h-12"
            priority
          />
          <span className="text-xs font-medium tracking-wide text-[#6B7280]">
            Trusted local services
          </span>
        </Link>

        <div className={cn('w-full', maxWidthClass[maxWidth])}>{children}</div>
      </div>
    </div>
  );
}
