import { createTestProject, MockContracts } from '@defiyield/testing';

import { join } from 'path';
import { describe, beforeEach, test, expect } from 'vitest';
import * as AuraBal from '../modules/AuraBal';

const mockRewarderAddresses = ['0xdeadbeef-rewarder', '0xdeficafe-rewarder'];

const mockContracts: MockContracts = {
  // auroraBalRewards
  '0x5e5ea2048475854a5702f5b8468a51ba1296efcc': {
    extraRewardsLength: () => 2,
    extraRewards: (n: number) => mockRewarderAddresses[n],
    rewardRate: () => '1000000000000',
    totalSupply: () => '1000000000000000000000',
  },
  // booster
  '0x7818A1DA7BD1E64c199029E86Ba244a9798eEE10': {
    poolLength: () => 3,
    poolInfo: () => ({
      lptoken: '0xdeadbeef',
      token: '0xcafebabe',
      gauge: '0xba5eba11',
      crvRewards: '0xdeficafe',
      stash: '0xca11ab1e',
      shutdown: Math.random() > 0.5,
    }),
  },
  '0xdeadbeef-rewarder': {
    rewardToken: () => '0xabcd',
    rewardRate: () => '2000000000000',
  },
  '0xdeficafe-rewarder': {
    rewardToken: () => '0x1234',
    rewardRate: () => '1000000000000',
  },
  fallback: {},
};

describe('#project #staking #aura', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'AuraFinance',
      path: join(__dirname, '../index.ts'),
      modules: [AuraBal],
      contracts: mockContracts,
    });
  });

  test('All tokens are properly hydrated', async ({ project }) => {
    const tokensPerModule = await project.preloadTokens();

    expect(tokensPerModule.flat().length).toEqual(6); // 4 hardcoded, & 1 from 'fallback.rewardToken'

    tokensPerModule.flat().forEach((token) => {
      expect(token).toMatchObject({
        address: expect.any(String),
        name: expect.any(String),
        symbol: expect.any(String),
        decimals: expect.any(Number),
      });
    });
  });

  test('All pools are properly hydrated', async ({ project }) => {
    const [auraBalPools] = await project.fetchPools();

    expect(auraBalPools.length).toEqual(1);

    const [pool] = auraBalPools;

    expect(pool.supplied).toEqual([
      expect.objectContaining({
        token: expect.objectContaining({
          address: expect.any(String),
          name: expect.any(String),
          symbol: expect.any(String),
          decimals: expect.any(Number),
        }),
      }),
    ]);

    expect(pool.rewarded?.length).toEqual(3);

    expect(pool.rewarded?.[0]).toEqual(
      expect.objectContaining({
        token: expect.objectContaining({
          address: expect.any(String),
          name: expect.any(String),
          symbol: expect.any(String),
          decimals: expect.any(Number),
        }),
      }),
    );

    expect(pool.rewarded?.[0].apr?.year).toEqual(0.031535999999999995);
    expect(pool.rewarded?.[1].apr?.year).toEqual(0.06307199999999999);
  });
});
