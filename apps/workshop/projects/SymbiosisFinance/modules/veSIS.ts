import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { BigNumber } from 'ethers';
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
  async fetchPools({ tokens, ethcall, ethcallProvider }): Promise<(Pool | void)[]> {
    const [token] = tokens;
    const sisContract = new ethcall.Contract(ADDRESS.SIS, erc20Abi);
    const [locked] = await ethcallProvider.all<BigNumber>([sisContract.balanceOf(ADDRESS.veSIS)]);
    const sisDelimiter = BigNumber.from(10).pow(token?.decimals);
    const sisLocked = BigNumber.from(locked).div(sisDelimiter);

    const sisPrice = token?.price || 0;
    const tvl = sisLocked.toNumber() * sisPrice;

    const apr = await getVeSISApr({ ethcall, ethcallProvider });

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
  async fetchUserPositions({ pools, user, ethcall, ethcallProvider }) {
    const [pool] = pools;
    const { token } = pool.supplied?.[0] || {};
    if (!token) return [];

    const veSisContract = new ethcall.Contract(ADDRESS.veSIS, veSISAbi);
    const [[locked]] = await ethcallProvider.all<BigNumber[][]>([veSisContract.locked(user)]);
    const sisDelimiter = BigNumber.from(10).pow(token?.decimals);
    const position = BigNumber.from(locked).div(sisDelimiter);

    return [
      {
        id: pool.id,
        supplied: [
          {
            token,
            balance: position.toNumber(),
          },
        ],
      },
    ];
  },
};
