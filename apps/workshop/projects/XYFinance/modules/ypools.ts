import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { Address, Pool, SupportedChain } from '@defiyield/sandbox';
import { YPOOLS, YPoolTokenSymbol } from '../helpers/config';
import erc20Abi from '../abis/erc20.abi.json';

export function YPool(
  chain: SupportedChain,
  ypoolTokenSymbol: YPoolTokenSymbol,
): ModuleDefinitionInterface {
  const ypool = YPOOLS[ypoolTokenSymbol][chain];
  if (!ypool) {
    throw new Error('Unsupported ypool token symbol');
  }

  return {
    name: `XY Finance ${ypoolTokenSymbol} pool: ${chain}`,
    chain,
    type: 'pools',

    /**
     * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
     *
     * @returns Address[]
     */
    async preloadTokens(): Promise<Address[]> {
      return [ypool.ypoolToken];
    },

    /**
     * Returns full pool list
     *
     * @param context
     * @returns Pool[]
     */
    async fetchPools({
      tokens,
      ethcall,
      ethcallProvider,
      BigNumber,
      axios,
    }): Promise<(Pool | void)[]> {
      const [token] = tokens;

      const contract = new ethcall.Contract(ypool.xyWrappedToken, erc20Abi);
      const [totalSupply] = await ethcallProvider.all<typeof BigNumber>([contract.totalSupply()]);
      const tvl = (Number(totalSupply.toString()) / 10 ** 18) * (token?.price || 0);

      const BASE_API_URL = 'https://api.xy.finance';
      const resp = await axios.get(`${BASE_API_URL}/ypool/stats/eachVault`);
      const apr = resp.data.eachYpoolVault[ypoolTokenSymbol].weekAPY / 100;

      return [
        {
          // id: ypool.ypoolToken,
          id: `YPoolVault-${ypoolTokenSymbol}-${chain}`,
          supplied: [
            {
              token,
              tvl,
              apr: { year: apr },
            },
          ],
        },
      ];
    },

    /**
     * Returns user positions for all pools
     *
     * @param context Context
     * @returns UserPosition[]
     */
    async fetchUserPositions(context) {
      const { ethcall, ethcallProvider, BigNumber, pools, user, axios } = context;

      const [pool] = pools;

      if (!pool.supplied) return [];

      const contract = new ethcall.Contract(ypool.xyWrappedToken, erc20Abi);
      const [_balance] = await ethcallProvider.all<typeof BigNumber>([contract.balanceOf(user)]);

      const BASE_API_URL = 'https://api.xy.finance';
      const dummyWithdrawAmount = 100 * 10 ** 18;
      const resp = await axios.get(
        `${BASE_API_URL}/ypool/withdraw/${ypoolTokenSymbol}/${ypool.chainId}/${dummyWithdrawAmount}`,
      );
      const ypoolYield = Number(resp.data.receiveAmount) / 100;
      const balance = (Number(_balance.toString()) * ypoolYield) / 10 ** 18;

      return [
        {
          id: pool.id,
          supplied: [
            {
              ...pool.supplied[0],
              balance,
            },
          ],
        },
      ];
    },
  };
}
