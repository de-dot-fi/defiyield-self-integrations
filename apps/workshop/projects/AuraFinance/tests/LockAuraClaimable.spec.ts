import { createTestProject } from '@defiyield/testing';

import { join } from 'path';
import { describe, beforeEach, test, expect } from 'vitest';
import LockAuraClaimable from '../modules/LockAuraClaimable';

describe('#project #staking #aura', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'AuraFinance',
      path: join(__dirname, '../index.ts'),
      modules: [LockAuraClaimable],
      contracts: {},
    });
  });

  test('All tokens are properly hydrated', async ({ project }) => {
    const [tokens] = await project.preloadTokens();

    expect(tokens.length).toEqual(1);

    expect(tokens[0]).toMatchObject({
      address: expect.any(String),
      name: expect.any(String),
      symbol: expect.any(String),
      decimals: expect.any(Number),
    });
  });

  test('All pools are properly hydrated', async ({ project }) => {
    const poolsPerModule = await project.fetchPools();

    poolsPerModule.flat().forEach((pool) => {
      expect(pool.rewarded).toEqual([
        expect.objectContaining({
          token: expect.objectContaining({
            address: expect.any(String),
            name: expect.any(String),
            symbol: expect.any(String),
            decimals: expect.any(Number),
          }),
        }),
      ]);
    });
  });
});
