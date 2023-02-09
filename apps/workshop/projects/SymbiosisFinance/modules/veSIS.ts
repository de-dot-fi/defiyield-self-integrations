import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { ADDRESS } from '../helpers/constants';
import { Address, Pool } from '@defiyield/sandbox';
import erc20Abi from '../../../../../packages/abis/erc20.abi.json';
import veSISAbi from '../abis/veSIS.json';
import { getVeSISApr } from '../helpers/utils';

export const veSIS: ModuleDefinitionInterface = {
  name: 'veSIS',
  chain: 'ethereum',
  type: 'staking',

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @returns Address[]
   */
  async preloadTokens(): Promise<Address[]> {
    return [ADDRESS.SIS];
  },

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools({ tokens, ethcall, ethcallProvider, BigNumber }): Promise<(Pool | void)[]> {
    const [token] = tokens;
    const sisContract = new ethcall.Contract(ADDRESS.SIS, erc20Abi);
    const [locked] = await ethcallProvider.all<typeof BigNumber>([
      sisContract.balanceOf(ADDRESS.veSIS),
    ]);
    const sisDelimiter = new BigNumber(10).pow(token?.decimals);
    const sisLocked = new BigNumber(locked.toString()).div(sisDelimiter);

    const sisPrice = token?.price || 0;
    const tvl = sisLocked.toNumber() * sisPrice;

    const apr = await getVeSISApr({ ethcall, ethcallProvider, BigNumber });

    return [
      {
        id: 'veSIS',
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

    const { token } = pool.supplied[0];

    const veSisContract = new ethcall.Contract(ADDRESS.veSIS, veSISAbi);
    const [[locked, end]] = await ethcallProvider.all<(typeof BigNumber)[][]>([
      veSisContract.locked(user),
    ]);
    const sisDelimiter = new BigNumber(10).pow(token?.decimals);
    const position = new BigNumber(locked.toString()).div(sisDelimiter);

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
