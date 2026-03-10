'use client';

import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors'; // Use the standard injected connector
import { sdk } from '@farcaster/miniapp-sdk';

// Initialize the Farcaster Mini App SDK to ensure provider is ready
sdk.actions.ready().then(() => {
  console.log('Farcaster Mini App SDK is ready.');
}).catch(error => {
  console.error('Failed to initialize Farcaster Mini App SDK:', error);
});

export const config = createConfig({
  chains: [base],
  connectors: [
    injected(), // Wagmi should detect the Farcaster-provided EIP-1193 provider as injected
  ],
  transports: {
    [base.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
