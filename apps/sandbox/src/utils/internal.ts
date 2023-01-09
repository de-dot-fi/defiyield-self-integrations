import { SupportedChain } from '../types/module';

const internalChainIds: Record<SupportedChain, number> = {
  ethereum: 1,
  binance: 2,
  polygon: 3,
  fantom: 4,
  arbitrum: 5,
  avalanche: 6,
  gnosis: 7,
  celo: 8,
  moonriver: 9,
  harmony: 10,
  heco: 11,
  okx: 13,
  cronos: 14,
  boba: 15,
  kucoin: 16,
  optimism: 17,
  aurora: 18,
  klaytn: 20,
  fuse: 21,
  cardano: 22,
  iotex: 29,
  kava: 41,
  metis: 23,
  milkomeda: 30,
  moonbeam: 31,
};

export function getInternalChainId(chain: SupportedChain): number {
  return internalChainIds[chain];
}
