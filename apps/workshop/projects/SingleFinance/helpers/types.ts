const SFSupportedChain = ['cronos', 'fantom', 'arbitrum'] as const;
export type SFSupportedChain = (typeof SFSupportedChain)[number];

export const isSFSupportedChain = (chain: string): chain is SFSupportedChain =>
  SFSupportedChain.includes(chain as SFSupportedChain);

export type SupportedDex = 'vvs' | 'mmf' | 'spooky' | 'sushi' | 'camelot';

export type PoolApiData = {
  address: string;
  token: {
    id: string;
    symbol: string;
  };
  fairLaunchPoolId: number;
}[];

type VaultDefinition = {
  name: string;
  decimals: number;
  fairLaunchPoolId: number;
  debtTokenPoolId: number;
  hasProtocolYield: boolean;
  address: string;
  token?: any; // override subgraph data
  symbol?: string; // override subgraph data
  avail?: boolean;
};

export type UserLendingBalance = {
  vault: VaultDefinition;
  ibAmount: string;
  tokenBalanceLent: string;
  stakeAmount: string;
  tokenBalanceStaked: string;
  tokenBalanceTotal: string;
  pendingSingle: {
    bigBang: string;
    boostedBigBang?: string;
  };
  isCapitalProtected?: boolean;
  version?: number;
};

export type UserPosition = {
  id: string;
  stoplossAt: null | string;
  debt: Record<string, string>;
  token0: {
    id: string;
    borrowable: boolean;
  };
  token1: {
    id: string;
    borrowable: boolean;
  };
  lpToken: Token;
  collateralSize: string;
  wmasterchef: string;
  collId: string;
};

type Token = {
  symbol: string;
  address: Record<number, string>;
  borrowable: boolean;
  borrowingInterest: number;
  singleYieldPercent: number;
};

export type Farm = {
  id: string;
  manualHarvestDexYieldPercent: number;
  autoCompoundDexYieldPercent: number;
  dexYieldPercent: number;
  perfFee: number;
  token0: Token;
  token1: Token;
  lpToken: Token;
  tradingFeeApr: number;
  tvlInUSD: number;
};
