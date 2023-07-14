const SFSupportedChain = ['cronos', 'fantom', 'arbitrum'] as const;
export type SFSupportedChain = (typeof SFSupportedChain)[number];

export const isSFSupportedChain = (chain: string): chain is SFSupportedChain =>
  SFSupportedChain.includes(chain as SFSupportedChain);

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
