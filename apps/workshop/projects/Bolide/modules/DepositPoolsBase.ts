import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { createMulticallChunker, findToken } from '@defiyield/utils/array';

import { STORAGE_ABI } from '../abis/storage-abi';
import { TokenInfo, VaultInfo, getVaultList } from '../helpers/provider';
import { getChainInfo } from '../helpers/vaults';
import {
  Context,
  FetchPoolsContext,
  FetchUserPositionsContext,
  Pool,
  SupportedChain,
} from '../../../../sandbox/src/types/module';

export class DepositPoolsBase implements ModuleDefinitionInterface {
  name = 'DepositPools' as const;
  type = 'staking' as const;

  chain: SupportedChain;

  constructor(chain: SupportedChain) {
    this.chain = chain;
  }

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens({ axios, logger }: Context) {
    const chainInfo = getChainInfo(this.chain);
    if (!chainInfo) {
      return [];
    }

    const vaults = await getVaultList(axios, logger, chainInfo.id);

    let tokens: string[] = [chainInfo.BLID_ADDRESS];

    for (const vault of vaults) {
      tokens = [...tokens, ...vault.tokens.map((token: TokenInfo) => token.address)];
    }

    return tokens;
  }

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools({ tokens, axios, logger }: FetchPoolsContext) {
    const pools: Pool[] = [];

    const tokenFinder = findToken(tokens);

    const chainInfo = getChainInfo(this.chain);
    if (!chainInfo) {
      return [];
    }

    const vaults = await getVaultList(axios, logger, chainInfo.id);

    for (const vault of vaults) {
      if (vault.address === chainInfo.MASTER_CHEF_ADDRESS) {
        continue;
      }

      const rewardToken = tokenFinder(chainInfo.BLID_ADDRESS);

      const supplied = vault.tokens.map((item: TokenInfo) => {
        const token = tokenFinder(item.address);

        return {
          token,
          tvl: item.tvl,
        };
      });

      const rewarded = [
        {
          token: rewardToken,
          apr: {
            year: vault.apy / 100,
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
  }

  /**
   * Returns user positions for all pools
   *
   * @param ctx Context
   * @returns UserPosition[]
   */
  async fetchUserPositions({
    ethers,
    pools,
    user,
    ethcall,
    ethcallProvider,
    axios,
    logger,
  }: FetchUserPositionsContext) {
    const chainInfo = getChainInfo(this.chain);
    if (!chainInfo) {
      return [];
    }

    const vaults = await getVaultList(axios, logger, chainInfo.id);

    const groupedMulticaller = createMulticallChunker(ethcallProvider);

    const results = await groupedMulticaller(pools, (pool) => {
      const vault = vaults.find((v: VaultInfo) => v.name === pool.id);

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
            balance: parseFloat(ethers.utils.formatUnits(deposited[index])),
          }))
        : [];

      const rewarded =
        pool.rewarded && pool.rewarded.length > 0
          ? [
              {
                ...pool.rewarded[0],
                balance: parseFloat(
                  ethers.utils.formatUnits(earned, pool.rewarded[0].token.decimals),
                ),
              },
            ]
          : [];

      return {
        id: pool.id,
        supplied,
        rewarded,
      };
    });
  }
}
