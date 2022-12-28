import { createTestProject, MockContracts } from '@defiyield/testing';

import { join } from 'path';
import { describe, beforeEach, test, expect } from 'vitest';
import StakeBalancerTokens from '../modules/StakeBalancerTokens';

const POOL_LENGTH = 2;

const mockContracts: MockContracts = {
  // booster
  '0x7818A1DA7BD1E64c199029E86Ba244a9798eEE10': {
    poolLength: () => POOL_LENGTH,
    poolInfo: (n: number) =>
      [
        {
          lptoken: '0xdeadbeef',
          token: '0xcafebabe',
          gauge: '0xba5eba11',
          crvRewards: '0xdeficafe-crvrewards',
          stash: '0xca11ab1e',
          shutdown: false,
        },
        {
          lptoken: '0xdeadbeef-2',
          token: '0xcafebabe-2',
          gauge: '0xba5eba11-2',
          crvRewards: '0xdeficafe-crvrewards-2',
          stash: '0xca11ab1e-2',
          shutdown: false,
        },
      ][n],
  },
  '0xdeadbeef': {
    totalSupply: () => '1000000000000000000000',
  },
  '0xdeadbeef-2': {
    totalSupply: () => '2300000000000000000000',
  },
  '0xdeficafe-crvrewards': {
    rewardToken: () => `0xdeficafe-reward`,
    rewardRate: () => '1000000000000',
    extraRewardsLength: () => 1,
    extraRewards: (n: number) => ['0xdeficafe-extra-rewards'][n],
    periodFinish: () => Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7).toString(), // ends in one week
    balanceOf: () => '1000000000000000000',
    earned: () => '1110000000000000000',
  },
  '0xdeficafe-extra-rewards': {
    rewardToken: () => '0x1234',
    rewardRate: () => '1000000000000',
    extraRewardsLength: () => 1,
    periodFinish: () => Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 7).toString(), // ends in one week
    earned: () => '2220000000000000000',
  },
  '0xdeficafe-crvrewards-2': {
    rewardToken: () => `0xdeficafe-reward-2`,
    rewardRate: () => '2000000000000',
    extraRewardsLength: () => 1,
    extraRewards: (n: number) => ['0xdeficafe-extra-rewards-2'][n],
    periodFinish: () => Math.floor(Date.now() / 1000 - 60 * 60 * 24 * 7).toString(), // ends one week ago
    balanceOf: () => '1000000000000000000',
    earned: () => '3330000000000000000',
  },
  '0xdeficafe-extra-rewards-2': {
    rewardToken: () => '0x1234-2',
    rewardRate: () => '2000000000000',
    extraRewardsLength: () => 1,
    periodFinish: () => Math.floor(Date.now() / 1000 - 60 * 60 * 24 * 7).toString(), // ends one week ago
    earned: () => '4440000000000000000',
  },
};

describe('#project #staking #aura', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'AuraFinance',
      path: join(__dirname, '../index.ts'),
      modules: [StakeBalancerTokens],
      contracts: mockContracts,
    });
  });

  test('The expected number of tokens are found', async ({ project }) => {
    const [tokens] = await project.preloadTokens();

    expect(tokens.length).toEqual(6);
  });

  test('Supplied tokens are formatted properly', async ({ project }) => {
    const [pools] = await project.fetchPools();

    expect(pools[0].supplied?.[0]).toEqual(
      expect.objectContaining({
        token: expect.objectContaining({
          address: expect.any(String),
          name: expect.any(String),
          symbol: expect.any(String),
          decimals: expect.any(Number),
        }),
      }),
    );
  });

  test('Rewarded tokens are formatted properly', async ({ project }) => {
    const [pools] = await project.fetchPools();

    expect(pools[0].rewarded?.[0]).toEqual(
      expect.objectContaining({
        token: expect.objectContaining({
          address: expect.any(String),
          name: expect.any(String),
          symbol: expect.any(String),
          decimals: expect.any(Number),
        }),
      }),
    );
  });

  test('The correct number of pools are found', async ({ project }) => {
    const [pools] = await project.fetchPools();

    expect(pools.length).toEqual(POOL_LENGTH);
  });

  test('pools with a periodFinish in the future have an APR', async ({ project }) => {
    const [pools] = await project.fetchPools();
    expect(pools[0].rewarded?.[0].apr?.year).toEqual(0.031535999999999995);
  });

  test('pools past the periodFinish get 0 APR', async ({ project }) => {
    const [pools] = await project.fetchPools();
    expect(pools[1].rewarded?.[0].apr?.year).toEqual(0);
  });

  test('fetches user balances', async ({ project }) => {
    const pools = await project.fetchUserPositions('0x-anon');
    expect(pools.length).toEqual(2);
    expect(pools[0]?.supplied?.[0].balance).toEqual(1);
    expect(pools[0]?.rewarded?.[0].balance).toEqual(1.11);
    expect(pools[0]?.rewarded?.[1].balance).toEqual(2.22);
    expect(pools[1]?.supplied?.[0].balance).toEqual(1);
    expect(pools[1]?.rewarded?.[0].balance).toEqual(3.33);
    expect(pools[1]?.rewarded?.[1].balance).toEqual(4.44);
  });
});
