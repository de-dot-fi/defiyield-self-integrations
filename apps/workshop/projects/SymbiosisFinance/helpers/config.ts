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

export type LpFarmConfig = {
  masterChef: Address;
  lpToken: Address;
  index: number;
  secondsPerBlock: number;
};

type LpFarmConfigs = {
  readonly [chainId in SupportedChain]?: LpFarmConfig;
};

export const LP_FARM: LpFarmConfigs = {
  ethereum: {
    masterChef: '0xE05DE631122d95eF347f6fCA85d1bB149Fcc6Df2',
    lpToken: '0x33d39eA02D1A569ECc77FBFcbBDCD4300fA0b010',
    index: 0,
    secondsPerBlock: 13.5,
  },
  arbitrum: {
    masterChef: '0xd38BB40815d2B0c2d2c866e0c72c5728ffC76dd9',
    lpToken: '0xe235E8dFa8ea3b7fFFF1C922fA4928bFB7ad964a',
    index: 0,
    secondsPerBlock: 13.5,
  },
  binance: {
    masterChef: '0xf02bBC9de6e443eFDf3FC41851529C2c3B9E5e0C',
    lpToken: '0xbCA9057666872B7b7CfC9718E68C96c64d69E1Ad',
    index: 0,
    secondsPerBlock: 3,
  },
};
