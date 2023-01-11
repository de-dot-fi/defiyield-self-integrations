import type { ethers } from 'ethers';
import type { Provider } from 'ethcall';
import type * as ethcall from 'ethcall';
import { SupportedChain } from './module';
import * as cardano from '../utils/cardano';

export interface ChainProvider {
  endpoint: string;
  chain: SupportedChain;
  cardano: typeof cardano;
  ethers: typeof ethers;
  provider: ethers.providers.BaseProvider;
  ethcall: typeof ethcall;
  ethcallProvider: Provider;
}

export type ProviderMap = Map<SupportedChain, ChainProvider>;
