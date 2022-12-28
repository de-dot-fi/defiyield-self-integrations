import { Context } from '@defiyield/sandbox';
import { addresses } from './constants';
import auraBalRewardsAbi from '../abis/auraBalRewards.abi.json';
import BoosterAbi from '../abis/booster.abi.json';
import { BoosterPoolInfo } from './types';
import { range } from '@defiyield/utils/array';

async function getExtraRewardersLength({
  ethcall,
  ethcallProvider,
}: Pick<Context, 'ethcall' | 'ethcallProvider'>) {
  const rewardContract = new ethcall.Contract(addresses.auraBalRewards, auraBalRewardsAbi);

  const [extraRewardsLength]: unknown[] = await ethcallProvider.all([
    rewardContract.extraRewardsLength(),
  ]);

  return Number(extraRewardsLength);
}

/**
 * Get AuraBAL extra Rewarders
 */
export async function getExtraRewarders({
  ethcall,
  ethcallProvider,
}: Pick<Context, 'ethcall' | 'ethcallProvider'>) {
  const extraRewardsLength = await getExtraRewardersLength({ ethcall, ethcallProvider });

  const rewardContract = new ethcall.Contract(addresses.auraBalRewards, auraBalRewardsAbi);

  const rewarders: string[] = await ethcallProvider.all(
    Array(extraRewardsLength)
      .fill(null)
      .map((a, i) => rewardContract.extraRewards(i)),
  );

  return rewarders;
}

/**
 *  Get Aura Booster Pool Info
 */
export async function getPoolInfos({
  ethcall,
  ethcallProvider,
}: Pick<Context, 'ethcall' | 'ethcallProvider'>) {
  const booster = new ethcall.Contract(addresses.booster, BoosterAbi);
  const [poolLength] = await ethcallProvider.all([booster.poolLength()]);

  const infos: BoosterPoolInfo[] = await ethcallProvider.all(
    range(0, Number(poolLength)).map((n) => booster.poolInfo(n)),
  );
  return infos;
}
