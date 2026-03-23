import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '../src/components/Providers';
import { Toaster } from 'sonner';
import { AudioProvider } from '../src/components/AudioProvider';

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
    'talentapp:project_verification': '2844d96db4ce5eb0c4c72102fdc7d40bc2881265600c39e4ebb60186ede8897762f0f73514bb5517c2d22cc402202b181cd93ef3452d9c92aa2fa8c7a082b81d'
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
        <AudioProvider>
          <Providers>
            {children}
            <Toaster 
              position="top-center" 
              visibleToasts={1}
              toastOptions={{
                className: 'pixel-font pixel-border w-[300px] min-h-[50px] text-center pixel-btn bg-[#e7f2eb] text-[#0f10f4] text-base shadow-lg shadow-[#8a6d00] flex items-center justify-center border-4 border-[#233e63] !rounded-none',
                style: {
                  background: '#e7f2eb',
                  color: '#0f10f4',
                  border: '4px solid #233e63',
                  borderRadius: '0px',
                  boxShadow: '0 10px 15px -3px rgba(138, 109, 0, 0.6)'
                }
              }}
            />
          </Providers>
        </AudioProvider>
      </body>
    </html>
  );
}
