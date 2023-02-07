import { Address, SupportedChain } from '@defiyield/sandbox';

type Pools = {
  readonly [chainId in SupportedChain]?: {
    underlyingStable: Address;
    poolIndex: number;
    chainId: number;
  };
};

type OmniPool = {
  address: Address;
  oracle: Address;
  chain: SupportedChain;
};

export const OMNI_POOL: OmniPool = {
  address: '0x6148FD6C649866596C3d8a971fC313E5eCE84882',
  oracle: '0x7775b274f0C3fA919B756b22A4d9674e55927ab8',
  chain: 'boba-bnb',
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
  telos: {
    underlyingStable: '0x818ec0a7fe18ff94269904fced6ae3dae6d6dc0b',
    poolIndex: 8,
    chainId: 40,
  },
  boba: {
    underlyingStable: '0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc',
    poolIndex: 5,
    chainId: 288,
  },
  'boba-avax': {
    underlyingStable: '0x126969743a6d300bab08F303f104f0f7DBAfbe20',
    poolIndex: 7,
    chainId: 43288,
  },
  'boba-bnb': {
    underlyingStable: '0x9F98f9F312D23d078061962837042b8918e6aff2',
    poolIndex: 4,
    chainId: 56288,
  },
};
