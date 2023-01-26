import { createMockContext, createTestProject } from '@defiyield/testing';
import path from 'path';
import { beforeEach, describe, expect, test } from 'vitest';

import { ENDPOINT_API } from '../helpers/provider';
import { BLID_ADDRESS, LP_BLID_USDT_ADDRESS } from '../helpers/vaults';
import { FarmingPools } from '../modules/FarmingPools';

const testAprResponse = {
  farmingApy: 10.12,
};

const testTvlResponse = {
  farmingTvl: 23.45,
};

describe('#project #pool #bolide', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'Bolide',
      path: path.join(__dirname, '../index.ts'),
      modules: [FarmingPools],
      contracts: {},
    });
  });

  test('All tokens are properly hydrated', async ({ project }) => {
    const [tokens] = await project.preloadTokens();

    expect(tokens.length).toEqual(2);

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

    expect(pools.length).toEqual(1);
  });

  test('All information of pool rewarded is correct', async ({ project }) => {
    const [, mockAxios] = createMockContext();
    mockAxios.onGet(`${ENDPOINT_API}/apy`).reply(200, testAprResponse);
    mockAxios.onGet(`${ENDPOINT_API}/tvl`).reply(200);

    const [pools] = await project.fetchPools();

    const pool = pools[0];
    const rewarded = pool.rewarded[0];

    expect(rewarded.token.address.toLowerCase()).toEqual(BLID_ADDRESS.toLowerCase());
    expect(rewarded.apr.year).toEqual(testAprResponse.farmingApy / 100);
  });

  test('All information of pool supplied is correct', async ({ project }) => {
    const [, mockAxios] = createMockContext();
    mockAxios.onGet(`${ENDPOINT_API}/apy`).reply(200);
    mockAxios.onGet(`${ENDPOINT_API}/tvl`).reply(200, testTvlResponse);

    const [pools] = await project.fetchPools();

    const pool = pools[0];
    const supplied = pool.supplied[0];

    expect(supplied.token.address.toLowerCase()).toEqual(LP_BLID_USDT_ADDRESS.toLowerCase());
    expect(supplied.tvl).toEqual(testTvlResponse.farmingTvl);
  });
});
