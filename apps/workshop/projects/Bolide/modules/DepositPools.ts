import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { createMulticallChunker, findToken } from '@defiyield/utils/array';

import { STORAGE_ABI } from '../abis/storage-abi';
import { getApy, getTvl } from '../helpers/provider';
import { BLID_ADDRESS, DEPOSIT_VAULTS } from '../helpers/vaults';

export const DepositPools: ModuleDefinitionInterface = {
  name: 'DepositPools',
  chain: 'binance',
  type: 'pools',

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens() {
    let tokens: string[] = [BLID_ADDRESS];

    for (const vault of DEPOSIT_VAULTS) {
      tokens = [...tokens, ...vault.tokens];
    }

    return tokens;
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools({ tokens, axios }) {
    const pools = [];

    const tokenFinder = findToken(tokens);

    const tvlData = await getTvl(axios);
    const aprData = await getApy(axios);

    for (const vault of DEPOSIT_VAULTS) {
      const vaultAddress = vault.address;

      const suppliedTokens = vault.tokens.map((address) => tokenFinder(address));

      const index = tokens.findIndex(
        (token) => token.address.toLowerCase() === BLID_ADDRESS.toLowerCase(),
      );
      const rewardToken = tokens[index];

      const tvlItem = tvlData?.strategiesTvl?.find(
        (item) => item.storageAddress.toLowerCase() === vaultAddress.toLowerCase(),
      );
      const supplied = suppliedTokens.map((token) => {
        const symbol = token.symbol === 'BTCB' ? 'BTC' : token.symbol;

        const tvl = tvlItem && symbol ? tvlItem.tokensTvl[symbol]?.tvl : 0;

        return {
          token,
          tvl,
        };
      });

      const aprItem = aprData?.strategiesApy?.find(
        (item) => item.storageAddress.toLowerCase() === vaultAddress.toLowerCase(),
      );
      const rewarded = [
        {
          token: rewardToken,
          apr: {
            year: aprItem ? aprItem.apy / 100 : 0,
          },
        },
      ];

      pools.push({
        id: vault.name,
        supplied,
        rewarded,
      });
    }

    return pools;
  },

  /**
   * Returns user positions for all pools
   *
   * @param ctx Context
   * @returns UserPosition[]
   */
  async fetchUserPositions({ ethers, pools, user, ethcall, ethcallProvider }) {
    const groupedMulticaller = createMulticallChunker(ethcallProvider);

    const results = await groupedMulticaller(pools, (pool) => {
      const vault = DEPOSIT_VAULTS.find((v) => v.name === pool.id);

      if (!vault) {
        return [];
      }

      const contract = new ethcall.Contract(vault.address, STORAGE_ABI);

      const tokensDeposited = pool.supplied
        ? pool.supplied.map((supplied) => contract.getTokenDeposit(user, supplied.token.address))
        : [];

      return [contract.balanceEarnBLID(user), ...tokensDeposited];
    });

    return pools.map((pool, idx) => {
      const [earned, ...deposited] = results[idx];

      const supplied = pool.supplied
        ? pool.supplied.map((item, index) => ({
            ...item,
            balance: parseFloat(ethers.utils.formatUnits(deposited[index], item.token.decimals)),
          }))
        : [];

      const rewarded =
        pool.rewarded && pool.rewarded.length > 0
          ? [
              {
                ...pool.rewarded[0],
                balance: parseFloat(ethers.utils.formatUnits(earned, pool.rewarded[0].token.decimals)),
              },
            ]
          : [];

      return {
        id: pool.id,
        supplied,
        rewarded,
      };
    });
  },
};
