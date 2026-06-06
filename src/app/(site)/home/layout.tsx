import { redirect } from 'next/navigation';
import {
  redirectPathForMode,
  resolveActiveModeFromCookies,
} from '@/lib/resolveActiveMode';

export const dynamic = 'force-dynamic';

export default async function HomeRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeMode = await resolveActiveModeFromCookies();

  if (activeMode && activeMode !== 'SEEKER') {
    redirect(redirectPathForMode(activeMode));
  }

  return <>{children}</>;
}
