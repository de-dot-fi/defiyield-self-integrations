import type { ModuleDefinitionInterface, SupportedChain } from '@defiyield/sandbox';
import { Address, Pool } from '@defiyield/sandbox';
import erc20Abi from '../abis/erc20.abi.json';
import veXYAbi from '../abis/veXY.abi.json';
import { VEXYS } from '../helpers/config';

export function veXY(chain: SupportedChain): ModuleDefinitionInterface {
  const veXY = VEXYS[chain];
  if (!veXY) {
    throw new Error('Unsupported chain');
  }

  return {
    name: `XY Finance veXY: ${chain}`,
    chain,
    type: 'staking',

    /**
     * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
     *
     * @returns Address[]
     */
    async preloadTokens(): Promise<Address[]> {
      return [veXY.xy];
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
      const xyTokenContract = new ethcall.Contract(veXY.xy, erc20Abi);
      const [locked] = await ethcallProvider.all<typeof BigNumber>([
        xyTokenContract.balanceOf(veXY.veXY),
      ]);

      const tvl = (Number(locked.toString()) / 10 ** 18) * (token?.price || 0);

      const BASE_API_URL = 'https://api.xy.finance';
      const resp = await axios.get(`${BASE_API_URL}/ypool/vexy/lockWeekApy`);
      const weekAPY = resp.data.apy / 100;
      const apr = weekAPY * 104;

      return [
        {
          id: `veXY-${chain}`,
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
     * @param ctx Context
     * @returns UserPosition[]
     */
    async fetchUserPositions({ pools, user, ethcall, ethcallProvider, BigNumber }) {
      const [pool] = pools;

      if (!pool.supplied) return [];

      const veXYContract = new ethcall.Contract(veXY.veXY, veXYAbi);
      const [[locked, end]] = await ethcallProvider.all<typeof BigNumber[][]>([
        veXYContract.locked(user),
      ]);
      const delimiter = new BigNumber(10).pow(18);
      const position = new BigNumber(locked.toString()).div(delimiter);

      const unlockTime = new BigNumber(end.toString()).multipliedBy(1000);

      return [
        {
          id: pool.id,
          supplied: [
            {
              ...pool.supplied[0],
              balance: position.toNumber(),
              unlockTime: unlockTime.toNumber(),
            },
          ],
        },
      ];
    },
  };
}
