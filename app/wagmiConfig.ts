'use client';

import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { createClient } from 'viem';
import { sdk } from '@farcaster/miniapp-sdk';

// Custom Farcaster EIP-1193 Provider connector
const farcasterConnector = {
  id: 'farcaster',
  name: 'Farcaster',
  type: 'farcaster',
  getProvider: async () => sdk.getEip1193Provider(),
};

export const config = createConfig({
  chains: [base],
  connectors: [
    {
      id: farcasterConnector.id,
      name: farcasterConnector.name,
      type: 'eip1193', // Use eip1193 type for generic provider
      setup: async () => ({
        provider: await farcasterConnector.getProvider(),
      }),
    },
  ],
  transports: {
    [base.id]: http(),
  },
  client: ({ chain }) => createClient({
    chain,
    transport: http(),
  }),
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
