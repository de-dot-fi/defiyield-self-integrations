import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import type { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';

import { MASTER_CHEF_ABI } from '../abis/master-chef-abi';
import { getApy, getTvl } from '../helpers/provider';
import { BLID_ADDRESS, MASTER_CHEF_ADDRESS } from '../helpers/vaults';

export const StakingPools: ModuleDefinitionInterface = {
  name: 'StakingPools',
  chain: 'binance',
  type: 'staking',

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens() {
    return [BLID_ADDRESS];
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

    const blidToken = tokens[0];

    const supplied = [
      {
        token: blidToken,
        tvl: tvlData ? parseFloat(tvlData.stakingTvl) : 0,
      },
    ];

    const rewarded = [
      {
        token: blidToken,
        apr: {
          year: aprData ? parseFloat(aprData.stakingApy) / 100 : 0,
        },
      },
    ];

    return [
      {
        id: 'BLID Staking',
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
  async fetchUserPositions({ pools, user, ethcall, ethcallProvider }) {
    const pool = pools[0];

    if (!pool || !pool.supplied || pool.supplied.length === 0) {
      return [];
    }

    const contract = new ethcall.Contract(MASTER_CHEF_ADDRESS, MASTER_CHEF_ABI);
    const pid = 0;
    const [[amount, rewardDebt]] = (await ethcallProvider.all([
      contract.userInfo(pid, user),
    ])) as BigNumber[][];

    const blidToken = pool.supplied[0].token;

    const supplied = [
      {
        ...pool.supplied[0],
        balance: parseFloat(formatUnits(amount, blidToken.decimals)),
      },
    ];

    const rewarded =
      pool.rewarded && pool.rewarded.length > 0
        ? [
            {
              ...pool.rewarded[0],
              balance: parseFloat(formatUnits(rewardDebt, blidToken.decimals)),
            },
          ]
        : [];

    return [
      {
        id: pool.id,
        supplied,
        rewarded,
      },
    ];
  },
};
