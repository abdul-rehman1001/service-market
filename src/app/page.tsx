import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { parseJwtPayload } from '@/lib/auth';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/cookies';

function redirectForActiveMode(role: string) {
  const normalizedRole = role.toUpperCase();

  if (normalizedRole === 'PROVIDER') {
    redirect('/provider/dashboard');
  }

  if (normalizedRole === 'ADMIN') {
    redirect('/admin');
  }

  redirect('/home');
}

export default async function RootPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken) {
    const auth = parseJwtPayload(accessToken);
    if (auth) {
      redirectForActiveMode(auth.role);
    }
  }

  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    redirect('/home');
  }

  redirect('/landing');
}

export const metadata = {
  title: 'Servizo - Service Marketplace',
  description: 'Find verified service providers near you',
};
