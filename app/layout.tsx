import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '../src/components/Providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Based Race',
  description: 'Play, Mint, and Rewarded!',
  other: {
    'base:app_id': '69b157c7c3360530fd09a86e',
    'fc:frame': JSON.stringify({
      version: "next",
      imageUrl: `https://basedrace.vercel.app/logo.png`,
      button: {
        title: "Let's Race!",
        action: {
          type: "launch_frame",
          name: "Based Race",
          url: `https://basedrace.vercel.app/`,
          splashImageUrl: `https://basedrace.vercel.app/logo.png`,
          splashBackgroundColor: "#FFFFFF",
        },
      },
      noindex: false,
    }),
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ margin: 0, padding: 0, height: '100%' }}>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', height: '100%', width: '100%', position: 'fixed' }}>
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
