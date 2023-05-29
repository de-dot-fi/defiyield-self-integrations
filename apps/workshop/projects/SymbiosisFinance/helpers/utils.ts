import { Context } from '@defiyield/sandbox';
import { SECONDS_IN_WEEK, WEEKS_IN_YEAR } from './constants';
import erc20Abi from '../../../../../packages/abis/erc20.abi.json';
import veSISDistributorAbi from '../abis/veSISDistributor.json';
import masterChefAbi from '../abis/masterChef.json';
import IPairAbi from '../abis/IPair.json';
import { LpFarmConfig, VeConfig } from './config';

export async function getVeSISApr(
  {
    ethcall,
    ethcallProvider,
    BigNumber,
  }: Pick<Context, 'ethcall' | 'ethcallProvider' | 'BigNumber'>,
  veConfig: VeConfig,
) {
  const sisContract = new ethcall.Contract(veConfig.sis, erc20Abi);
  const distributorContract = new ethcall.Contract(veConfig.veSISDistributor, veSISDistributorAbi);

  const [distributorBalance, lockedBalance, lastTokenBalance, lastTokenTime] =
    await ethcallProvider.all<typeof BigNumber>([
      sisContract.balanceOf(veConfig.veSISDistributor),
      sisContract.balanceOf(veConfig.veSis),
      distributorContract.token_last_balance(),
      distributorContract.last_token_time(),
    ]);
  const balance = new BigNumber(distributorBalance.toString());
  let freeBalance = balance.minus(lastTokenBalance.toString());

  if (freeBalance.eq(0)) {
    const prevEpochTime = new BigNumber(lastTokenTime.toString())
      .minus(SECONDS_IN_WEEK)
      .dividedToIntegerBy(SECONDS_IN_WEEK)
      .multipliedBy(SECONDS_IN_WEEK);

    const [tokensPerWeek] = await ethcallProvider.all<typeof BigNumber>([
      distributorContract.tokens_per_week(prevEpochTime.toString()),
    ]);
    freeBalance = new BigNumber(tokensPerWeek.toString());
  }

  return freeBalance.multipliedBy(WEEKS_IN_YEAR).div(lockedBalance.toString()).toNumber();
}
export async function getLpApr(
  {
    ethcall,
    ethcallProvider,
    BigNumber,
  }: Pick<Context, 'ethcall' | 'ethcallProvider' | 'BigNumber'>,
  locked: typeof BigNumber,
  farm: LpFarmConfig,
) {
  function toNumber(value: typeof BigNumber) {
    const delimiter = new BigNumber(10).pow(18);
    return new BigNumber(value.toString()).div(delimiter).toNumber();
  }

  const pair = new ethcall.Contract(farm.lpToken, IPairAbi);
  const [reserves, totalSupplyBn] = await ethcallProvider.all<any>([
    pair.getReserves(),
    pair.totalSupply(),
  ]);

  const reserves1 = toNumber(reserves.reserve1); // SIS
  const reserves0 = toNumber(reserves.reserve0); // ETH
  const priceSIS = reserves0 / reserves1; // SIS per ETH
  const totalSupply = toNumber(totalSupplyBn); // total LP supply
  const priceLP = (reserves0 + reserves1 * priceSIS) / totalSupply;

  const masterChef = new ethcall.Contract(farm.masterChef, masterChefAbi);
  const [rewardPerBlockBn, totalAllocPointBn] = await ethcallProvider.all<any>([
    masterChef.rewardPerBlock(),
    masterChef.totalAllocPoint(),
  ]);
  const [poolInfo] = await ethcallProvider.all<any>([masterChef.poolInfo(farm.index)]);
  const rewardPerBlock = toNumber(rewardPerBlockBn);
  const poolAllocPoint = toNumber(poolInfo.allocPoint);
  const totalAllocPoint = toNumber(totalAllocPointBn);
  const balanceOfMaster = toNumber(locked);

  const totalPoolETH = priceLP * balanceOfMaster;

  return (
    (((rewardPerBlock * ((86400.0 / farm.secondsPerBlock) * 365) * poolAllocPoint) /
      totalAllocPoint) *
      priceSIS) /
    totalPoolETH
  );
}
