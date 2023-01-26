import { createMockContext, createTestProject } from '@defiyield/testing';
import path from 'path';
import { beforeEach, describe, expect, test } from 'vitest';

import { ENDPOINT_API } from '../helpers/provider';
import { BLID_ADDRESS, DEPOSIT_VAULTS } from '../helpers/vaults';
import { DepositPools } from '../modules/DepositPools';

const testAprResponse = {
  strategiesApy: DEPOSIT_VAULTS.map((vault, index) => ({
    storageAddress: vault.address,
    apy: index * 10 + index,
  })),
};

const testTvlResponse = {
  strategiesTvl: DEPOSIT_VAULTS.map((vault, index) => ({
    storageAddress: vault.address,
    tokensTvl: {
      fake: {
        tvl: index * 10 + index,
      },
    },
  })),
};

describe('#project #pool #bolide', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'Bolide',
      path: path.join(__dirname, '../index.ts'),
      modules: [DepositPools],
      contracts: {},
    });
  });

  test('All tokens are properly hydrated', async ({ project }) => {
    const [tokens] = await project.preloadTokens();

    let count = 1; // BLID token

    for (const vault of DEPOSIT_VAULTS) {
      count += vault.tokens.length;
    }

    expect(tokens.length).toEqual(count);

    for (const token of tokens) {
      expect(token).toMatchObject({
        address: expect.any(String),
        name: expect.any(String),
        symbol: expect.any(String),
        decimals: expect.any(Number),
      });
    }
  });

  test('Pools count is correct', async ({ project }) => {
    const [, mockAxios] = createMockContext();
    mockAxios.onGet(`${ENDPOINT_API}/apy`).reply(200);
    mockAxios.onGet(`${ENDPOINT_API}/tvl`).reply(200);

    const [pools] = await project.fetchPools();

    expect(pools.length).toEqual(4);
  });

  test('All information of pool rewarded is correct', async ({ project }) => {
    const [, mockAxios] = createMockContext();
    mockAxios.onGet(`${ENDPOINT_API}/apy`).reply(200, testAprResponse);
    mockAxios.onGet(`${ENDPOINT_API}/tvl`).reply(200);

    const [pools] = await project.fetchPools();

    for (const [index, pool] of pools.entries()) {
      expect(pool.rewarded.length).toEqual(1);

      const rewarded = pool.rewarded[0];

      expect(rewarded.token.address.toLowerCase()).toEqual(BLID_ADDRESS.toLowerCase());
      expect(rewarded.apr.year).toEqual(testAprResponse.strategiesApy[index].apy / 100);
    }
  });

  test('All information of pool supplied is correct', async ({ project }) => {
    const [, mockAxios] = createMockContext();
    mockAxios.onGet(`${ENDPOINT_API}/apy`).reply(200);
    mockAxios.onGet(`${ENDPOINT_API}/tvl`).reply(200, testTvlResponse);

    const [pools] = await project.fetchPools();

    for (const [index, pool] of pools.entries()) {
      const vault = DEPOSIT_VAULTS[index];
      expect(pool.supplied.length).toEqual(vault.tokens.length);

      const supplied = pool.supplied[0];
      expect(supplied.tvl).toEqual(testTvlResponse.strategiesTvl[index].tokensTvl.fake.tvl);
    }
  });
});
