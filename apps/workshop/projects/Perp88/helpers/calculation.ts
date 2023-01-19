import { Context } from '@defiyield/sandbox';
import { BigNumber, ethers } from 'ethers';
import {
  CHAINLINK_ORACLE_ADDR,
  COMPOSITION_TOKENS,
  PLP_STAKING_ADDR,
  PLP_STAKING_REVENUE_ADDR,
  PLP_TOKEN_ADDR,
  POOL_DIAMOND_ADDR,
  } from './config';
import GetterFacetAbi from '../abis/GetterFacet.json';
import FeedableRewarderAbi from '../abis/FeedableRewarder.json';
import PLPStakingAbi from '../abis/PLPStaking.json';
import PoolOracleAbi from '../abis/PoolOracle.json';
import ERC20Abi from '../abis/ERC20.json';
import { e18, secondsInYear, Zero } from './constant';
import { FetchPoolsContext } from '../../../../sandbox/src/types/module';
import { parseEther } from 'ethers/lib/utils';

interface TokenPrice {
  minPrice: BigNumber;
  maxPrice: BigNumber;
  avgPrice: BigNumber;
  displayPrice: string;
}

const decimalPlaceDefault = 2;
export async function calAPR(ctx: FetchPoolsContext): Promise<string> {
  const { tokens,ethcall, ethcallProvider, logger } = ctx;

  const plpToken = tokens && tokens.find(i=> i.address.toLowerCase()=== PLP_TOKEN_ADDR.toLowerCase())
  if(!plpToken || !plpToken.price)throw new Error(`PLP Price is invalid`)

  const plpPriceBN = parseEther(plpToken.price.toString())

  const rewardContract = new ethcall.Contract(PLP_STAKING_REVENUE_ADDR, FeedableRewarderAbi);
  const plpStakingContract = new ethcall.Contract(PLP_STAKING_ADDR, PLPStakingAbi);

  const [rewardRate, totalShare]: BigNumber[] = await ethcallProvider.all([
    rewardContract.rewardRate(),
    plpStakingContract.calculateTotalShare(PLP_STAKING_REVENUE_ADDR),
  ]);

  const rewardRateE18 = rewardRate.mul(10 ** 12); //usdc is 1e6

  const price = await getTokenOraclePrice(ctx, COMPOSITION_TOKENS.USDC);
  
  const secondsInYearBN = e18.mul(secondsInYear); //e18
  const rewardRatePerYear = secondsInYearBN.mul(rewardRateE18).div(e18);
  const rewardPricePerYear = rewardRatePerYear.mul(price.avgPrice).div(e18);
  const totalRewardToken = totalShare.mul(plpPriceBN).div(e18);

  if (totalRewardToken.isZero()) throw new Error(`_calAPR totalReward is 0`);

  const apr = ethers.utils.formatEther(rewardPricePerYear.mul(e18).div(totalRewardToken).mul(100));

  return apr;
}

// PRICES

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
