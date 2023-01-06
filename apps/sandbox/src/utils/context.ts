import axios from 'axios';
import { BigNumber } from 'bignumber.js';
import { Context } from '../types/module';

import { ChainProvider } from '../types/provider';
import logger from './logger';
import * as cardano from './cardano';

export function createContext(chain: ChainProvider) {
  const context: Context = {
    axios: axios,
    cardano: cardano,
    BigNumber: BigNumber,
    logger: logger,
    ethers: chain.ethers,
    provider: chain.provider,
    ethcall: chain.ethcall,
    ethcallProvider: chain.ethcallProvider,
  };

  return context;
}
