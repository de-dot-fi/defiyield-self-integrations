import { Context } from '@defiyield/sandbox';
import { BigNumber, ethers } from 'ethers';
import {
  CHAINLINK_ORACLE_ADDR,
  COMPOSITION_TOKENS,
  PLP_STAKING_ADDR,
  PLP_STAKING_REVENUE_ADDR,
  PLP_TOKEN_ADDR,
  POOL_DIAMOND_ADDR,
  ALL_TOKENS,
} from './config';
import GetterFacetAbi from '../abis/GetterFacet.json';
import FeedableRewarderAbi from '../abis/FeedableRewarder.json';
import PLPStakingAbi from '../abis/PLPStaking.json';
import PoolOracleAbi from '../abis/PoolOracle.json';
import ERC20Abi from '../abis/ERC20.json';
import { e18, secondsInYear, Zero } from './constant';

interface TokenPrice {
  minPrice: BigNumber;
  maxPrice: BigNumber;
  avgPrice: BigNumber;
  displayPrice: string;
}

const decimalPlaceDefault = 2;
export async function calAPR(ctx: Context): Promise<string> {
  const { ethcall, ethcallProvider, logger } = ctx;

  const rewardContract = new ethcall.Contract(PLP_STAKING_REVENUE_ADDR, FeedableRewarderAbi);
  const plpStakingContract = new ethcall.Contract(PLP_STAKING_ADDR, PLPStakingAbi);

  const [rewardRate, totalShare]: BigNumber[] = await ethcallProvider.all([
    rewardContract.rewardRate(),
    plpStakingContract.calculateTotalShare(PLP_STAKING_REVENUE_ADDR),
  ]);

  const rewardRateE18 = rewardRate.mul(10 ** 12); //usdc is 1e6

  const price = await getTokenOraclePrice(ctx, COMPOSITION_TOKENS.USDC);

  const plpPrice = await getPLPPrice(ctx);

  const secondsInYearBN = e18.mul(secondsInYear); //e18
  const rewardRatePerYear = secondsInYearBN.mul(rewardRateE18).div(e18);
  const rewardPricePerYear = rewardRatePerYear.mul(price.avgPrice).div(e18);
  const totalRewardToken = totalShare.mul(plpPrice.avgPrice).div(e18);

  if (totalRewardToken.isZero()) throw new Error(`_calAPR totalReward is 0`);

  const apr = ethers.utils.formatEther(rewardPricePerYear.mul(e18).div(totalRewardToken).mul(100));

  return apr;
}

// PRICES
export async function getPLPPrice(ctx: Context): Promise<TokenPrice> {
  const { ethcall, ethcallProvider, logger } = ctx;

  const getterFacetContract = new ethcall.Contract(POOL_DIAMOND_ADDR, GetterFacetAbi);
  const plpTokenContract = new ethcall.Contract(PLP_TOKEN_ADDR, ERC20Abi);

  const [maxAum, minAum, plpTotalSupply]: BigNumber[] = await ethcallProvider.all([
    getterFacetContract.getAumE18(true),
    getterFacetContract.getAumE18(false),
    plpTokenContract.totalSupply(),
  ]);
  const minPrice = minAum && plpTotalSupply ? minAum.mul(e18).div(plpTotalSupply) : Zero;
  const maxPrice = maxAum && plpTotalSupply ? maxAum.mul(e18).div(plpTotalSupply) : Zero;

  const avgPrice = minPrice.add(maxPrice).div(2);

  return {
    minPrice,
    maxPrice,
    avgPrice,
    displayPrice: toFixed(ethers.utils.formatEther(avgPrice), 4),
  };
}

export async function getTokenOraclePrice(ctx: Context, token: string): Promise<TokenPrice> {
  const { ethcall, ethcallProvider, logger } = ctx;
  const oracleContract = new ethcall.Contract(CHAINLINK_ORACLE_ADDR, PoolOracleAbi);
  const [maxPrice, minPrice]: BigNumber[] = await ethcallProvider.all([
    oracleContract.getMaxPrice(token),
    oracleContract.getMinPrice(token),
  ]);
  const avgPrice = maxPrice && minPrice ? maxPrice.add(minPrice).div(2).div(1e12) : Zero; //18

  return {
    maxPrice,
    minPrice,
    avgPrice,
    displayPrice: toFixed(ethers.utils.formatEther(avgPrice), 4),
  };
}

export function toFixed(numberString: string, decimalPlaces = decimalPlaceDefault): string {
  if (!numberString.includes('.')) {
    return `${numberString}.00`;
  }
  const [whole, decimal] = numberString.split('.');
  const formattedDeciaml = decimal.concat('000000000000000000').slice(0, decimalPlaces); // concat to guarantee leading zero and slice to chop off
  return `${whole}.${formattedDeciaml}`;
}
