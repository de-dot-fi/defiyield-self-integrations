import type { ethers } from 'ethers';
import type { Provider } from 'ethcall';
import type * as ethcall from 'ethcall';
import { SupportedChain } from './module';
import * as cardano from '../utils/cardano';
import * as BufferLayout from '../utils/solana';
import * as solanaWeb3 from '@solana/web3.js';

export interface ChainProvider {
  endpoint: string;
  chain: SupportedChain;
  cardano: typeof cardano;
  ethers: typeof ethers;
  solana: {
    BufferLayout: typeof BufferLayout;
    web3: typeof solanaWeb3;
  };
  provider: ethers.providers.BaseProvider;
  ethcall: typeof ethcall;
  ethcallProvider: Provider;
}

export type ProviderMap = Map<SupportedChain, ChainProvider>;
