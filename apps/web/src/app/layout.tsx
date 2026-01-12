import type { Metadata } from 'next';

import '../styles/global.scss';

export const metadata: Metadata = {
  title: 'BotsBitsWars',
  description: 'Compare responses from different AI models',
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
