import { ModuleDefinitionInterface, Pool, Token } from '@defiyield/sandbox';
import { createMulticallChunker, findToken, range } from '@defiyield/utils/array';

import crvRewardsAbi from '../abis/crvRewards.abi.json';
import extraRewardsAbi from '../abis/extraRewards.abi.json';
import erc20Abi from '@defiyield/abi/erc20.abi.json';
import { addresses } from '../helpers/constants';
import { getPoolInfos } from '../helpers/utils';

/**
 * Object based example
 */

const StakeBalancerTokens: ModuleDefinitionInterface = {
  name: 'Staked Balancer Tokens',
  chain: 'ethereum',
  type: 'staking',

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens({ ethcall, ethcallProvider }) {
    const infos = await getPoolInfos({ ethcall, ethcallProvider });
    // reward tokens

    const groupedMulticaller = createMulticallChunker(ethcallProvider);

    const rewards = await groupedMulticaller(infos, (info) => {
      const contract = new ethcall.Contract(info.crvRewards, crvRewardsAbi);

      return [contract.rewardToken(), contract.extraRewardsLength()];
    });

    const extraRewarders: string[] = await ethcallProvider.all(
      infos.flatMap((info, idx) => {
        const contract = new ethcall.Contract(info.crvRewards, crvRewardsAbi);
        return range(0, Number(rewards[idx][1])).map((n) => contract.extraRewards(n));
      }),
    );

    const extraRewards: string[] = await ethcallProvider.all(
      extraRewarders.map((rewarder) => {
        const contract = new ethcall.Contract(rewarder, extraRewardsAbi);

        return contract.rewardToken();
      }),
    );

    return infos
      .map((info) => info.lptoken)
      .concat(extraRewards)
      .concat(rewards.map(([address]) => address));
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools({ tokens, ethcall, ethcallProvider, logger }) {
    const tokenFinder = findToken(tokens);

    const infos = await getPoolInfos({ ethcall, ethcallProvider });
    const groupedMulticaller = createMulticallChunker(ethcallProvider);

    const rewards = await groupedMulticaller(infos, (info) => {
      const contract = new ethcall.Contract(info.crvRewards, crvRewardsAbi);

      return [
        contract.rewardToken(),
        contract.rewardRate(),
        contract.periodFinish(),
        contract.extraRewardsLength(),
      ];
    });

    const extraRewarders: string[][] = await groupedMulticaller(infos, (info, idx) => {
      const contract = new ethcall.Contract(info.crvRewards, crvRewardsAbi);
      return range(0, Number(rewards[idx][3])).map((n) => contract.extraRewards(n));
    });

    const extraRewards = await groupedMulticaller(extraRewarders, (rewarders) => {
      return rewarders.flatMap((rewarder) => {
        const contract = new ethcall.Contract(rewarder, extraRewardsAbi);

        return [contract.rewardToken(), contract.rewardRate(), contract.periodFinish()];
      });
    });

    const totalSupplies = await groupedMulticaller(infos, (info) =>
      new ethcall.Contract(info.lptoken, erc20Abi).totalSupply(),
    );

    return infos.map((info, idx) => {
      try {
        const r: [string, string, number][] = [rewards[idx]]
          .concat([extraRewards[idx]])
          .filter((a) => a.length);

        const token = tokenFinder(info.lptoken);

        const tvl =
          (Number(totalSupplies[idx].toString()) / 10 ** token.decimals) * (token?.price || 0);

        const now = Date.now();

        return <Pool>{
          id: `${addresses.booster}::${idx}`,
          supplied: [
            {
              token: tokenFinder(info.lptoken),
              tvl,
            },
          ],
          rewarded: r.map((reward) => {
            const [address, rate, periodFinish] = reward;

            const isActive = new Date(periodFinish * 1000).getTime() > now;
            const rewardToken = tokenFinder(address);
            return {
              token: rewardToken,
              apr: {
                year:
                  isActive && tvl
                    ? ((Number(rate) / 10 ** rewardToken.decimals) *
                        (60 * 60 * 24 * 365) *
                        (rewardToken?.price || 0)) /
                      tvl
                    : 0,
              },
            };
          }),
          extra: {
            poolId: idx,
            rewarders: [
              info.crvRewards, // main rewarder
              ...extraRewarders[idx],
            ],
          },
        };
      } catch (err) {
        logger.error(err);
        return;
      }
    });
  },

  /**
   * Returns user positions for all pools
   *
   * @param ctx Context
   * @returns UserPosition[]
   */
  async fetchUserPositions({ pools, user, ethcall, ethcallProvider }) {
    const groupedMulticaller = createMulticallChunker(ethcallProvider);

    const results = await groupedMulticaller(pools, (pool) => {
      const { rewarders } = pool.extra as { rewarders: string[] };
      if (!rewarders.length) return [];

      const mainContract = new ethcall.Contract(rewarders.shift() as string, crvRewardsAbi);
      const extraRewardContract = rewarders.map(
        (rewarder) => new ethcall.Contract(rewarder, extraRewardsAbi),
      );

      return [
        mainContract.balanceOf(user),
        mainContract.earned(user),
        ...extraRewardContract.map((contract) => contract.earned(user)),
      ];
    });

    return pools.map((pool, idx) => {
      const [balance, ...earned] = results[idx];
      const token = pool.supplied?.[0]?.token as Token;
      return {
        id: pool.id,
        supplied: [
          {
            token: token,
            balance: Number(balance.toString()) / 10 ** token.decimals,
          },
        ],
        rewarded: pool.rewarded?.map((reward, idx) => {
          return {
            token: reward.token,
            balance: Number(earned[idx]) / 10 ** reward.token.decimals,
          };
        }),
      };
    });
  },
};

export default StakeBalancerTokens;
