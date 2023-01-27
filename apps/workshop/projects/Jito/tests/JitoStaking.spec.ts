import { createTestProject } from '@defiyield/testing';

import { join } from 'path';
import { describe, beforeEach, test, expect } from 'vitest';
import { JitoStaking } from '../modules/JitoStaking';

describe('#project #staking #jito', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'JitoStaking',
      path: join(__dirname, '../index.ts'),
      modules: [JitoStaking],
    });
  });

  test('All tokens are properly hydrated', async ({ project }) => {
    const [tokens] = await project.preloadTokens();

    expect(tokens.length).toEqual(2);

    tokens.forEach((token) => {
      expect(token).toMatchObject({
        address: expect.any(String),
        name: expect.any(String),
        symbol: expect.any(String),
        decimals: expect.any(Number),
      });
    });
  });

  test('All pools are properly hydrated', async ({ project }) => {
    const [pools] = await project.fetchPools();

    expect(pools.length).toEqual(1);
    expect(pools[0].supplied?.length).toEqual(1);
    expect(pools[0].extra).toMatchObject({
      exchangeRate: expect.any(String),
    });

    pools[0].supplied?.forEach((supply) => {
      expect(supply).toMatchObject({
        token: expect.objectContaining({
          address: expect.any(String),
          name: expect.any(String),
          symbol: expect.any(String),
          decimals: expect.any(Number),
        }),
        tvl: expect.any(Number),
        apr: expect.objectContaining({
          year: expect.any(Number),
        }),
      });
    });
  });
});
