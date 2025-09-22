import { redirect } from 'next/navigation';

import { isAuthenticated } from '../../services/auth/serverAuth';

/**
 * Chat page - authenticated users only
 * Renders ChatFrame component with authentication check
 */
export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect('/');
  }

  return <>{children}</>;
}
