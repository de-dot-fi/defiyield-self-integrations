import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { getBalance, jitoStats, jitoToken, solToken } from '../helpers';

export const JitoStakingTestCopy: ModuleDefinitionInterface = {
  name: 'JitoStaking',
  chain: 'solana',
  type: 'staking',

  async preloadTokens() {
    return [solToken, jitoToken];
  },

  async fetchPools({ tokens, axios, BigNumber }) {
    const stats = await jitoStats({ axios });
    const sol = tokens.find((t) => t.address === solToken);
    const jito = tokens.find((t) => t.address === jitoToken);
    if (!sol) {
      return [];
    }
    const tvl = new BigNumber(stats.tvl)
      .div(10 ** sol.decimals)
      .times(sol.price || 0)
      .toNumber();

    return [
      {
        id: sol.address,
        extra: {
          exchangeRate: (
            new BigNumber(sol.price || 0).div(jito?.price || 0).toNumber() || 0
          ).toString(),
        },
        supplied: [
          {
            token: sol,
            tvl: tvl,
            apr: { year: stats.apr },
          },
        ],
      },
    ];
    ``;
  },

  async fetchUserPositions(ctx) {
    const balance = await getBalance(ctx);
    const pool = ctx.pools[0];
    if (balance?.info?.tokenAmount && pool && pool.supplied?.[0]) {
      const amount = new ctx.BigNumber(balance.info.tokenAmount.amount)
        .div(10 ** balance.info.tokenAmount.decimals)
        .times((pool?.extra?.exchangeRate as string) || '0')
        .toNumber();

      return [
        {
          id: pool.id,
          supplied: [
            {
              token: pool.supplied[0].token,
              balance: amount,
              apr: pool.supplied[0].apr,
            },
          ],
        },
      ];
    }

    return [];
  },
};
