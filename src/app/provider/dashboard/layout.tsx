import { guardProviderRoute } from '@/lib/guardProviderRoute';

export const dynamic = 'force-dynamic';

export default async function ProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await guardProviderRoute();
  return <>{children}</>;
}
