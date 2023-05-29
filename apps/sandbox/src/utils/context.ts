import axios from 'axios';
import { BigNumber } from 'bignumber.js';
import { Context } from '../types/module';

import { ChainProvider } from '../types/provider';
import logger from './logger';

export function createContext(provider: ChainProvider) {
  const context: Context = {
    BigNumber: BigNumber,
    axios: axios,
    logger: logger,
    ...provider,
  };

  return context;
}
