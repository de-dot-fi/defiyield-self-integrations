import { Context, Token } from '@defiyield/sandbox';
import { BigNumber } from 'ethers';
import { FARM_REWARD } from './constants';

export interface POOL_TYPE {
  label: string;
  farmReward: FARM_REWARD;
  isFeatured?: boolean;
  ignoreLpPrice?: boolean;
  stableContract?: string;
}

export interface TOKEN_TYPE {
  label: string;
}

export interface STELLA_DISTRIBUTOR_RESPONSE {
  lpToken: string;
  totalLp: BigNumber;
  allocPoint: BigNumber;
}

export interface STELLA_DUAL_DISTRIBUTOR_RESPONSE {
  lpToken: string;
  totalLp: BigNumber;
  allocPoint: BigNumber;
  stellaPerSec: BigNumber;
}

export interface getStellaDistributorsProps {
  ctx: Context;
  stellaDistributorPoolLength: BigNumber;
  stellaDualDistributorPoolLength: BigNumber;
}

export interface getPoolsProps {
  tokens: Token[];
  stellaDualDistributorResults: {
    lpToken: string;
    totalLp: number;
    allocPoint: number;
    stellaPerSec: number;
  }[];
  ethPrice: number;
}

export interface getFarmIDProps {
  token: Token;
  stellaDualDistributorResults: {
    lpToken: string;
    totalLp: number;
    allocPoint: number;
    stellaPerSec: number;
  }[];
}

export interface getSingleStellaDistributorsProps {
  token: Token;
  farmID: number;
  stellaDistributorResults: {
    lpToken: string;
    totalLp: number;
    allocPoint: number;
  }[];
  stellaDualDistributorResults: {
    lpToken: string;
    totalLp: number;
    allocPoint: number;
    stellaPerSec: number;
  }[];
}

export interface getTvlProps {
  token: Token;
  staticTokenData: POOL_TYPE;
  stellaDistributor:
    | {
        lpToken: string;
        totalLp: number;
        allocPoint: number;
      }
    | undefined;
  stellaDualDistributor:
    | {
        lpToken: string;
        totalLp: number;
        allocPoint: number;
        stellaPerSec: number;
      }
    | undefined;
}

export interface getAprProps {
  ctx: Context;
  farmID: number;
  token: Token;
  staticTokenData: POOL_TYPE;
  tradingFeeAprs: Record<string, number>;
  tradingFeeAPRsOfDualFarms: Record<string, number>;
  tradingFeeAPRsOfStableDualFarms: Record<string, number>;
  stellaDistributor:
    | {
        lpToken: string;
        totalLp: number;
        allocPoint: number;
      }
    | undefined;
  stellaDualDistributor:
    | {
        lpToken: string;
        totalLp: number;
        allocPoint: number;
        stellaPerSec: number;
      }
    | undefined;
  totalAllocPoint: BigNumber;
  stellaPerSec: BigNumber;
  tvl: number;
  stellaPrice: number;
}

export interface getFetchPoolsPromisesProps {
  ctx: Context;
  tokens: Token[];
  stellaDistributorResults: {
    lpToken: string;
    totalLp: number;
    allocPoint: number;
  }[];
  stellaDualDistributorResults: {
    lpToken: string;
    totalLp: number;
    allocPoint: number;
    stellaPerSec: number;
  }[];
  tradingFeeAprs: Record<string, number>;
  tradingFeeAPRsOfDualFarms: Record<string, number>;
  tradingFeeAPRsOfStableDualFarms: Record<string, number>;
  totalAllocPoint: BigNumber;
  stellaPerSec: BigNumber;
  stellaPrice: number;
}
