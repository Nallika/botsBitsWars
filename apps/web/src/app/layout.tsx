import type { Metadata } from 'next';
import '../styles/global.scss';

export const metadata: Metadata = {
  title: 'Skeleton App',
  description: 'Empty app to bootstrap your project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
