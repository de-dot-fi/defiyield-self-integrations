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

export type VeConfig = {
  sis: Address;
  veSis: Address;
  veSISDistributor: Address;
};

type VeConfigs = {
  readonly [chainId in SupportedChain]?: VeConfig;
};

export const VESIS: VeConfigs = {
  ethereum: {
    sis: '0xd38BB40815d2B0c2d2c866e0c72c5728ffC76dd9',
    veSis: '0x7d4CE4C6d2e71D7beD4596f809B81Fba0Be42258',
    veSISDistributor: '0x67438161883F71255Acfbba3C2F1A582780B05CB',
  },
  binance: {
    sis: '0xF98b660AdF2ed7d9d9D9dAACC2fb0CAce4F21835',
    veSis: '0x3E6A3EbbC9D88ACC192221797ad90BF72d391778',
    veSISDistributor: '0xB79A4F5828eb55c10D7abF4bFe9a9f5d11aA84e0',
  },
};
