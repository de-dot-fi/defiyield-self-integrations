import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { findToken } from '@defiyield/utils/array';
import type { BigNumber } from 'ethers';

import { MASTER_CHEF_ABI } from '../abis/master-chef-abi';
import { getVaultList } from '../helpers/provider';
import { getChainInfo } from '../helpers/vaults';

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
    const chainInfo = getChainInfo(this.chain);

    return [chainInfo.BLID_ADDRESS, chainInfo.LP_BLID_USDT_ADDRESS];
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools({ tokens, axios, logger }) {
    const chainInfo = getChainInfo(this.chain);
    const vaults = await getVaultList(axios, logger, chainInfo.id);

    const farmingPool = vaults.find(
      (vault: any) =>
        vault.address === chainInfo.MASTER_CHEF_ADDRESS &&
        vault.tokens.some((token: any) => token.address === chainInfo.LP_BLID_USDT_ADDRESS),
    );

    const tokenFinder = findToken(tokens);

    const blidToken = tokenFinder(chainInfo.BLID_ADDRESS);
    const lpToken = tokenFinder(chainInfo.LP_BLID_USDT_ADDRESS);
    const tvl = farmingPool.tokens[0]?.tvl;

    const supplied = [
      {
        token: lpToken,
        tvl,
      },
    ];

    const rewarded = [
      {
        token: blidToken,
        apr: {
          year: farmingPool.apy / 100,
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
    const chainInfo = getChainInfo(this.chain);

    const contract = new ethcall.Contract(chainInfo.MASTER_CHEF_ADDRESS, MASTER_CHEF_ABI);
    const pid = 1;
    const [[amount], pendingBlid] = (await ethcallProvider.all([
      contract.userInfo(pid, user),
      contract.pendingBlid(pid, user),
    ])) as [BigNumber[], BigNumber];

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
        balance: parseFloat(ethers.utils.formatUnits(pendingBlid, blidToken.decimals)),
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
