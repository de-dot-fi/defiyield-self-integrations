import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { Address, Pool, SupportedChain } from '@defiyield/sandbox';
import { LP_FARM } from '../helpers/config';
import erc20Abi from '../../../../../packages/abis/erc20.abi.json';
import masterChefAbi from '../abis/masterChef.json';
import { getLpApr } from '../helpers/utils';

export function lpFarm(chain: SupportedChain): ModuleDefinitionInterface {
  const currentFarm = LP_FARM[chain];
  if (!currentFarm) {
    throw new Error('Unsupported chain');
  }

  return {
    name: `Symbiosis LP farm: ${chain}`,
    chain,
    type: 'staking',

    /**
     * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
     *
     * @returns Address[]
     */
    async preloadTokens(): Promise<Address[]> {
      return [currentFarm.lpToken];
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
      ethers,
    }): Promise<(Pool | void)[]> {
      const [token] = tokens;

      const lpTokenContract = new ethcall.Contract(currentFarm.lpToken, erc20Abi);
      const [locked] = await ethcallProvider.all<typeof BigNumber>([
        lpTokenContract.balanceOf(currentFarm.masterChef),
      ]);
      const delimiter = new BigNumber(10).pow(token?.decimals);
      const lpLocked = new BigNumber(locked.toString()).div(delimiter);

      const lpPrice = token?.price || 0;
      const tvl = lpLocked.toNumber() * lpPrice;

      const apr = await getLpApr({ ethcall, ethcallProvider, BigNumber }, locked, currentFarm);

      return [
        {
          id: `lpFarm-${chain}-${token.address}`,
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
      const { pools, user, ethcall, ethcallProvider, BigNumber } = context;

      const [pool] = pools;

      if (!pool.supplied) return [];

      const { token } = pool.supplied[0];

      const masterChef = new ethcall.Contract(currentFarm.masterChef, masterChefAbi);
      const [info] = await ethcallProvider.all<{
        amount: typeof BigNumber;
        rewardDebt: typeof BigNumber;
      }>([masterChef.userInfo(currentFarm.index, user)]);

      const delimiter = new BigNumber(10).pow(token?.decimals);
      const lpLocked = new BigNumber(info.amount.toString()).div(delimiter);
      const balance = lpLocked.toNumber();

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
