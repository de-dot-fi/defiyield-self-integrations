import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { findToken } from '@defiyield/utils/array';
import type { BigNumber } from 'ethers';

import { MASTER_CHEF_ABI } from '../abis/master-chef-abi';
import { getApy, getTvl } from '../helpers/provider';
import { BLID_ADDRESS, LP_BLID_USDT_ADDRESS, MASTER_CHEF_ADDRESS } from '../helpers/vaults';

export const FarmingPools: ModuleDefinitionInterface = {
  name: 'FarmingPools',
  chain: 'binance',
  type: 'staking',

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens() {
    return [BLID_ADDRESS, LP_BLID_USDT_ADDRESS];
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools({ tokens, axios }) {
    const tvlData = await getTvl(axios);
    const aprData = await getApy(axios);

    const tokenFinder = findToken(tokens);

    const blidToken = tokenFinder(BLID_ADDRESS);
    const lpToken = tokenFinder(LP_BLID_USDT_ADDRESS);

    const supplied = [
      {
        token: lpToken,
        tvl: tvlData ? parseFloat(tvlData.farmingTvl) : 0,
      },
    ];

    const rewarded = [
      {
        token: blidToken,
        apr: {
          year: aprData ? parseFloat(aprData.farmingApy) / 100 : 0,
        },
      },
    ];

    return [
      {
        id: 'BLID-USDT Farming',
        supplied,
        rewarded,
      },
    ];
  },

  /**
   * Returns user positions for all pools
   *
   * @param ctx Context
   * @returns UserPosition[]
   */
  async fetchUserPositions({ ethers, pools, user, ethcall, ethcallProvider }) {
    const contract = new ethcall.Contract(MASTER_CHEF_ADDRESS, MASTER_CHEF_ABI);
    const pid = 1;
    const [[amount, rewardDebt]] = (await ethcallProvider.all([
      contract.userInfo(pid, user),
    ])) as BigNumber[][];

    const pool = pools[0];

    if (!pool || !pool.supplied?.length || !pool.rewarded?.length) {
      return [];
    }

    const lpToken = pool.supplied[0]?.token;
    const blidToken = pool.rewarded[0]?.token;

    const supplied = [
      {
        ...pool.supplied[0],
        balance: parseFloat(ethers.utils.formatUnits(amount, lpToken.decimals)),
      },
    ];

    const rewarded = [
      {
        ...pool.rewarded[0],
        balance: parseFloat(ethers.utils.formatUnits(rewardDebt, blidToken.decimals)),
      },
    ];

    return [
      {
        id: pool.id,
        supplied,
        rewarded,
      },
    ];
  },
};
