import { BigNumber } from 'ethers';

export interface CroSwapFarms {
  address: string;
  id: number;
  name: string;
  pair: {
    address0: string;
    address1: string;
    name0: string;
    name1: string;
    symbol0: string;
    symbol1: string;
    price0: string;
    price1: string;
    reserve0: string;
    reserve1: string;
    reserve0USD: string;
    reserve1USD: string;
    pairAddress: string;
    totalSupply: string;
    ratio: string;
    lpPrice: string;
  };
  dpr: number;
  apr: number;
  totalStakedUSD: string;
  totalStakedTokens: string;
  emittedTokenAddress: string;
  emittedTokensPerBlock: string;
  multiplier: number;
  nfts: string[];
}

export interface CroSwapToken {
  id: string;
  tokenDayData: {
    priceUSD: string;
  }[];
  decimals: string;
  totalSupply: string;
}

export interface CroSwapTokens {
  tokens: CroSwapToken[];
}

export interface UserInfo {
  amount: BigNumber;
  rewardDebt: BigNumber;
  lastClaimBlock: BigNumber;
  initialRewardDebt: BigNumber;
  lastDeposit: BigNumber;
  storedAmount: BigNumber;
}

export interface Reserves {
  _reserve0: BigNumber;
  _reserve1: BigNumber;
  _blockLatestTimestamp: BigNumber;
}
