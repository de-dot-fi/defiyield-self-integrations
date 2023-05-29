import { Address, SupportedChain } from '@defiyield/sandbox';

type Pool = { factory: Address };
type Pools = Partial<Record<SupportedChain, Pool>>;

export const WHITE_WHALE_POOLS: Pools = {
  juno: {
    factory: 'juno14m9rd2trjytvxvu4ldmqvru50ffxsafs8kequmfky7jh97uyqrxqs5xrnx',
  },
  'terra-2': {
    factory: 'terra1f4cr4sr5eulp3f2us8unu6qv8a5rhjltqsg7ujjx6f2mrlqh923sljwhn3',
  },
} as const;
