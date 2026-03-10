'use client';

import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { createConnector } from 'wagmi/connectors';
import { sdk } from '@farcaster/miniapp-sdk';

const FarcasterConnector = createConnector({
  id: 'farcaster',
  name: 'Farcaster',
  type: 'farcaster',
  async setup() {
    const provider = await sdk.wallet.getEthereumProvider();
    return {
      provider,
    };
  },
});

export const config = createConfig({
  chains: [base],
  connectors: [
    FarcasterConnector(),
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
