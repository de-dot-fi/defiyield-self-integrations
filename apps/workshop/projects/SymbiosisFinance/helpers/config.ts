import { Address, SupportedChain } from '@defiyield/sandbox';

export type Pool = {
  underlyingStable: Address;
  poolIndex: number;
  chainId: number;
};

type Pools = {
  readonly [chainId in SupportedChain]?: Pool;
};

export const POOLS: Pools = {
  ethereum: {
    underlyingStable: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    poolIndex: 0,
    chainId: 1,
  },
  binance: {
    underlyingStable: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    poolIndex: 1,
    chainId: 56,
  },
  avalanche: {
    underlyingStable: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664',
    poolIndex: 2,
    chainId: 43114,
  },
  polygon: {
    underlyingStable: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    poolIndex: 3,
    chainId: 137,
  },
  boba: {
    underlyingStable: '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc',
    poolIndex: 5,
    chainId: 288,
  },
  'kava-evm': {
    underlyingStable: '0xfA9343C3897324496A05fC75abeD6bAC29f8A40f',
    poolIndex: 9,
    chainId: 2222,
  },
};
