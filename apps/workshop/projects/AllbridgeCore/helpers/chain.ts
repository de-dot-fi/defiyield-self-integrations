import {SupportedChain} from '@defiyield/sandbox';

export type ChainSymbol = 'ETH' | 'BSC';
export function chainSymbolToSupportedChain(chainSymbol: ChainSymbol): SupportedChain {
  switch (chainSymbol) {
    case 'ETH': return 'ethereum'
    case 'BSC': return 'binance'
    default: throw new Error('Unsupported chain')
  }
}
