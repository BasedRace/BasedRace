'use client';

import { createConfig, http, custom } from 'wagmi';
import { base } from 'wagmi/chains';
import { sdk } from '@farcaster/miniapp-sdk';

export const config = createConfig({
  chains: [base],
  connectors: [
    custom({
      id: 'farcaster',
      name: 'Farcaster',
      getProvider: async () => sdk.wallet.getEthereumProvider(),
    }),
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
