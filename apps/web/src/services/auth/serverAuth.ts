import { cookies } from 'next/headers';

/**
 * Server-side authentication check using Next.js cookies
 * This can only be used in Server Components, Server Actions, or Route Handlers
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const authToken = cookieStore.get('auth-token');

  return !!authToken?.value;
}
