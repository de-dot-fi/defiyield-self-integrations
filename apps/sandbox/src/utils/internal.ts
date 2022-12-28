import { SupportedChain } from '../types/module';

const internalChainIds: Record<SupportedChain, number> = {
  ethereum: 1,
  fantom: 4,
};

export function getInternalChainId(chain: SupportedChain): number {
  return internalChainIds[chain];
}
