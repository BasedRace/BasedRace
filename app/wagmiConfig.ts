'use client';

import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { custom } from 'wagmi/connectors';
import { sdk } from '@farcaster/miniapp-sdk';

export const config = createConfig({
  chains: [base],
  connectors: [
    custom({
      id: 'farcaster',
      name: 'Farcaster',
      provider: sdk.wallet.getEthereumProvider(),
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
