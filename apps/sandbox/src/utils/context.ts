import axios from 'axios';
import { BigNumber } from 'bignumber.js';
import { Context } from '../types/module';

import { ChainProvider } from '../types/provider';
import logger from './logger';

export function createContext(chain: ChainProvider) {
  const context: Context = {
    axios: axios,
    BigNumber: BigNumber,
    logger: logger,
    ethers: chain.ethers,
    provider: chain.provider,
    ethcall: chain.ethcall,
    ethcallProvider: chain.ethcallProvider,
  };

  return context;
}
