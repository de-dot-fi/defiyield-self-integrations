import {
  Context,
  FetchPoolsContext,
  FetchUserPositionsContext,
  Pool,
  Token,
} from '@defiyield/sandbox';
import { findToken } from '@defiyield/utils/array';
import auraBalRewardsAbi from '../abis/auraBalRewards.abi.json';
import extraRewardsAbi from '../abis/extraRewards.abi.json';
import { addresses } from '../helpers/constants';
import { getExtraRewarders } from '../helpers/utils';

/**
 * Function based example
 */
export const name = 'auraBAL';
export const chain = 'ethereum';
export const type = 'staking';

/**
 * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
 *
 * @param context
 * @returns Address[]
 */
export async function preloadTokens({ ethcall, ethcallProvider }: Context) {
  const rewarders = await getExtraRewarders({ ethcall, ethcallProvider });
  const extraRewards: string[] = await ethcallProvider.all(
    rewarders.map((rewarder) => {
      const contract = new ethcall.Contract(rewarder, extraRewardsAbi);
      return contract.rewardToken();
    }),
  );

  return [addresses.weth, addresses.balWeth, addresses.bal, addresses.auraBal, ...extraRewards];
}

/**
 * Returns full pool list
 *
 * @param context
 * @returns Pool[]
 */
export async function fetchPools({ tokens, ethcall, ethcallProvider }: FetchPoolsContext) {
  const tokenFinder = findToken(tokens);

  const rewarders = await getExtraRewarders({ ethcall, ethcallProvider });

  const extraRewards: string[] = await ethcallProvider.all(
    rewarders.map((rewarder) => {
      const contract = new ethcall.Contract(rewarder, extraRewardsAbi);
      return contract.rewardToken();
    }),
  );

  const rates: string[] = await ethcallProvider.all(
    ([addresses.auraBalRewards] as string[]).concat(rewarders).map((rewarder) => {
      const contract = new ethcall.Contract(rewarder, extraRewardsAbi);
      return contract.rewardRate();
    }),
  );

  const contract = new ethcall.Contract(addresses.auraBalRewards, auraBalRewardsAbi);
  const [totalSupply] = await ethcallProvider.all([contract.totalSupply()]);

  const aurBal = tokenFinder(addresses.auraBal);
  const tvl = (Number(totalSupply) / 10 ** 18) * (aurBal?.price || 0);

  return [
    <Pool>{
      id: addresses.auraBalDeposit,
      supplied: [{ token: tokenFinder(addresses.auraBal), tvl }],
      rewarded: ([addresses.bal] as string[]).concat(extraRewards).map((reward, idx) => {
        const token = tokenFinder(reward);

        // APR
        const rewardsPerSecond = Number(rates[idx]) / 10 ** 18;
        const secondsPerYear = 60 * 60 * 24 * 365;
        return {
          token,
          apr: {
            year: (rewardsPerSecond * secondsPerYear * (token?.price || 0)) / tvl,
          },
        };
      }),
    },
  ];
}

/**
 * Returns user positions for all pools
 *
 * @param ctx Context
 * @returns UserPosition[]
 */
export async function fetchUserPositions({
  pools,
  ethcall,
  user,
  ethcallProvider,
}: FetchUserPositionsContext) {
  const [pool] = pools;

  const rewarders = await getExtraRewarders({ ethcall, ethcallProvider });

  const baseRewardContract = new ethcall.Contract(addresses.auraBalRewards, auraBalRewardsAbi);

  const [balance, ...earned]: string[] = await ethcallProvider.all([
    baseRewardContract.balanceOf(user),
    baseRewardContract.earned(user),
    ...rewarders.map((rewarder) => {
      const contract = new ethcall.Contract(rewarder, auraBalRewardsAbi);
      return contract.earned(user);
    }),
  ]);

  return [
    {
      id: pool.id,
      supplied: [
        {
          token: pool.supplied?.[0]?.token as Token,
          balance: Number(balance.toString()) / 10 ** 18,
        },
      ],
      rewarded: pool.rewarded?.map((reward, idx) => {
        return {
          token: reward.token,
          balance: Number(earned[idx]) / 10 ** reward.token.decimals,
        };
      }),
    },
  ];
}
