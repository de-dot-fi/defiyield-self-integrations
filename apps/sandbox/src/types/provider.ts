import type { ethers } from 'ethers';
import type { Provider } from 'ethcall';
import type * as ethcall from 'ethcall';
import { SupportedChain } from './module';

export interface ChainProvider {
  ethers: typeof ethers;
  provider: ethers.providers.BaseProvider;
  ethcall: typeof ethcall;
  ethcallProvider: Provider;
}

export type ProviderMap = Map<SupportedChain, ChainProvider>;
