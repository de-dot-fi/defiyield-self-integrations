import {
  FetchPoolsContext,
  FetchUserPositionsContext,
  ModuleDefinitionInterface,
  Pool,
} from '@defiyield/sandbox';
import { range } from '@defiyield/utils/array';

import auraLockerAbi from '../abis/AuraLocker.abi.json';
import { addresses } from '../helpers/constants';

/**
 * Class based example
 *
 * Locked AURA will earn platform fees as well as give vote weight for proposal and gauge weight voting
 */
export default class LockAura implements ModuleDefinitionInterface {
  name = 'Locked AURA' as const;
  chain = 'ethereum' as const;
  type = 'staking' as const;

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens() {
    return [addresses.aura]; // Aura
  }

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools({ tokens }: FetchPoolsContext) {
    const aura = tokens.find(
      (token) => token.address.toLowerCase() === addresses.aura.toLowerCase(),
    );

    return [
      <Pool>{
        id: addresses.voteLockedAura,
        supplied: [{ token: aura }],
      },
    ];
  }

  /**
   * Returns user positions for all pools
   *
   * @param ctx Context
   * @returns UserPosition[]
   */
  async fetchUserPositions({ user, pools, ethcall, ethcallProvider }: FetchUserPositionsContext) {
    const [pool] = pools;
    // 0xe6a0d1bbdd7ed02ff15adb30314edbca6b1f8be0
    // TODO: Fetch User Positions
    const suppliedToken = pool.supplied?.[0]?.token;
    if (!suppliedToken) throw new Error('Missing Supplied Token');

    const contract = new ethcall.Contract(pool.id, auraLockerAbi);

    const [checkpoints] = await ethcallProvider.all([contract.numCheckpoints(user)]);

    const balances = (await ethcallProvider.all(
      range(0, Number(checkpoints)).flatMap((id) => contract.userLocks(user, id)),
    )) as { amount: string; unlockTime: string }[];

    return balances.map((data) => {
      return {
        id: pool.id,
        supplied: [
          {
            token: suppliedToken,
            balance: Number(data.amount.toString()) / 10 ** suppliedToken.decimals,
            unlockTime: new Date(data.unlockTime),
          },
        ],
      };
    });
  }
}
