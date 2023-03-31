import type { ModuleDefinitionInterface, SupportedChain } from '@defiyield/sandbox';
import { Address, Pool } from '@defiyield/sandbox';
import erc20Abi from '../../../../../packages/abis/erc20.abi.json';
import veSISAbi from '../abis/veSIS.json';
import { getVeSISApr } from '../helpers/utils';
import { VESIS } from '../helpers/config';

export function veSIS(chain: SupportedChain): ModuleDefinitionInterface {
  const veConfig = VESIS[chain];
  if (!veConfig) {
    throw new Error('Unsupported chain');
  }

  return {
    name: `Symbiosis veSIS: ${chain}`,
    chain,
    type: 'staking',

    /**
     * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
     *
     * @returns Address[]
     */
    async preloadTokens(): Promise<Address[]> {
      return [veConfig.sis];
    },

    /**
     * Returns full pool list
     *
     * @param context
     * @returns Pool[]
     */
    async fetchPools({ tokens, ethcall, ethcallProvider, BigNumber }): Promise<(Pool | void)[]> {
      const [token] = tokens;
      const sisContract = new ethcall.Contract(veConfig.sis, erc20Abi);
      const [locked] = await ethcallProvider.all<typeof BigNumber>([
        sisContract.balanceOf(veConfig.veSis),
      ]);
      const sisDelimiter = new BigNumber(10).pow(token?.decimals);
      const sisLocked = new BigNumber(locked.toString()).div(sisDelimiter);

      const sisPrice = token?.price || 0;
      const tvl = sisLocked.toNumber() * sisPrice;

      const apr = await getVeSISApr({ ethcall, ethcallProvider, BigNumber }, veConfig);

      return [
        {
          id: `veSIS-${chain}`,
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

      const veSisContract = new ethcall.Contract(veConfig.veSis, veSISAbi);
      const [[locked, end]] = await ethcallProvider.all<typeof BigNumber[][]>([
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
}
