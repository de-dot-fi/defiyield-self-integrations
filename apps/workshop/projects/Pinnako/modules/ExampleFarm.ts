import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { jitoStats } from '../helpers';
import { Pool } from '../../../../sandbox/src/types/module';

export const ExampleFarm: ModuleDefinitionInterface = {
  name: 'ExampleFarm',
  chain: 'zksync_era',
  type: 'staking',

  async preloadTokens() {
    return ['0xf8C6dA1bbdc31Ea5F968AcE76E931685cA7F9962'];
  },

  async fetchPools(ctx) {
    const { axios, tokens, BigNumber } = ctx;

    const stats = await jitoStats({ axios });
    const jito = tokens.find((t) => t.address === '0xf8C6dA1bbdc31Ea5F968AcE76E931685cA7F9962');
    const tvl = new BigNumber(stats.tvl).div(10 ** 30);
    if (!jito) {
      return [];
    }
    const vaults: Pool[] = [
      {
        id: jito.address,
        extra: {
          exchangeRate: new BigNumber(0).toString(),
        },
        supplied: [
          {
            token: jito,
            tvl: tvl.toNumber(),
            apr: { year: stats.apr },
          },
        ],
      },
    ];
    return vaults;
  },

  async fetchUserPositions() {
    // TODO: Fetch User Positions
    return [];
  },
};
