import {
  FetchPoolsContext,
  FetchUserPositionsContext,
  ModuleDefinitionInterface,
} from '@defiyield/sandbox';
import auraLockerAbi from '../abis/AuraLocker.abi.json';
import { addresses } from '../helpers/constants';

/**
 * Class based example
 *
 * Locked AURA will earn platform fees as well as give vote weight for proposal and gauge weight voting
 */
export default class LockAuraClaimable implements ModuleDefinitionInterface {
  name = 'Locked AURA (Claimable)' as const;
  chain = 'ethereum' as const;
  type = 'staking' as const;

  /**
   * Fetches the addresses of all involved tokens (supplied, rewards, borrowed, etc)
   *
   * @param context
   * @returns Address[]
   */
  async preloadTokens() {
    return [
      addresses.auraBal, // AurBal
    ];
  }

  /**
   * Returns full pool list
   *
   * @param context
   * @returns Pool[]
   */
  async fetchPools({ tokens }: FetchPoolsContext) {
    const auraBal = tokens.find(
      (token) => token.address.toLowerCase() === addresses.auraBal.toLowerCase(),
    );

    if (!auraBal) throw new Error('Failed to find AuraBal');

    return [
      {
        id: `${addresses.voteLockedAura}::claimable`,
        rewarded: [{ token: auraBal }],
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

    const rewardToken = pool.rewarded?.[0]?.token;
    if (!rewardToken) throw new Error('Missing Rewarded Token');

    const contract = new ethcall.Contract(addresses.voteLockedAura, auraLockerAbi);

    const [rewards] = (await ethcallProvider.all([contract.claimableRewards(user)])) as [
      { token: string; amount: string }[],
    ];

    return rewards.map((reward) => {
      return {
        id: pool.id,
        rewarded: [
          {
            token: rewardToken,
            balance: Number(reward.amount.toString()) / 10 ** rewardToken.decimals,
          },
        ],
      };
    });
  }
}
