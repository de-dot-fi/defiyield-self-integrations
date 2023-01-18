import type { ethers } from 'ethers';
import type { Provider } from 'ethcall';
import type * as ethcall from 'ethcall';
import { SupportedChain } from './module';
import * as cardano from '../utils/cardano';
import * as BufferLayout from 'buffer-layout';

export interface ChainProvider {
  endpoint: string;
  chain: SupportedChain;
  cardano: typeof cardano;
  ethers: typeof ethers;
  BufferLayout: typeof BufferLayout;
  provider: ethers.providers.BaseProvider;
  ethcall: typeof ethcall;
  ethcallProvider: Provider;
}

export type ProviderMap = Map<SupportedChain, ChainProvider>;
