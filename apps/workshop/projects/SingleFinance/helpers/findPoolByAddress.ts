import { Pool } from '@defiyield/sandbox';
import { isSameAddr } from './isSameAddress';

export const findPoolByAddress = (pools: Pool[], addr: string): Pool | undefined =>
  pools.find((token) => isSameAddr(token.id, addr));
