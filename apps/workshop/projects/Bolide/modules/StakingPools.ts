import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import type { BigNumber } from 'ethers';

import { MASTER_CHEF_ABI } from '../abis/master-chef-abi';
import { TokenInfo, VaultInfo, getVaultList } from '../helpers/provider';
import { getChainInfo } from '../helpers/vaults';

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
    const chainInfo = getChainInfo(this.chain);
    if (!chainInfo) {
      return [];
    }

    return [chainInfo.BLID_ADDRESS];
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools({ tokens, axios, logger }) {
    const chainInfo = getChainInfo(this.chain);
    if (!chainInfo) {
      return [];
    }

    const vaults = await getVaultList(axios, logger, chainInfo.id);

    const stakingPool = vaults.find(
      (vault: VaultInfo) =>
        vault.address === chainInfo.MASTER_CHEF_ADDRESS &&
        vault.tokens.some(
          (token: TokenInfo) =>
            token.address.toUpperCase() === chainInfo.BLID_ADDRESS.toUpperCase(),
        ),
    );

    const blidToken = tokens[0];
    const tvl = stakingPool?.tokens[0]?.tvl;

    const supplied = [
      {
        token: blidToken,
        tvl,
      },
    ];

    const rewarded = [
      {
        token: blidToken,
        apr: {
          year: stakingPool && stakingPool.apy ? stakingPool.apy / 100 : 0,
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
  async fetchUserPositions({ ethers, pools, user, ethcall, ethcallProvider }) {
    const pool = pools[0];

    if (!pool || !pool.supplied || pool.supplied.length === 0) {
      return [];
    }

    const chainInfo = getChainInfo(this.chain);
    if (!chainInfo || !chainInfo.MASTER_CHEF_ADDRESS) {
      return [];
    }

    const contract = new ethcall.Contract(chainInfo.MASTER_CHEF_ADDRESS, MASTER_CHEF_ABI);
    const pid = 0;
    const [[amount], pendingBlid] = (await ethcallProvider.all([
      contract.userInfo(pid, user),
      contract.pendingBlid(pid, user),
    ])) as [BigNumber[], BigNumber];

    const blidToken = pool.supplied[0].token;

    const supplied = [
      {
        ...pool.supplied[0],
        balance: parseFloat(ethers.utils.formatUnits(amount, blidToken.decimals)),
      },
    ];

    const rewarded =
      pool.rewarded && pool.rewarded.length > 0
        ? [
            {
              ...pool.rewarded[0],
              balance: parseFloat(ethers.utils.formatUnits(pendingBlid, blidToken.decimals)),
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
