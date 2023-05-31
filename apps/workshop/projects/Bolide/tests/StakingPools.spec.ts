import { createMockContext, createTestProject } from '@defiyield/testing';
import path from 'path';
import { beforeEach, describe, expect, test } from 'vitest';

import { ENDPOINT_API } from '../helpers/provider';
import { getChainInfo } from '../helpers/vaults';
import { StakingPools } from '../modules/StakingPools';
import { testResponse } from './response';

const filterReponse = (res, chainInfo) => {
  return res.vaults.filter(
    (vault) =>
      vault.chainId === chainInfo.id &&
      vault.address.toLowerCase() === chainInfo.MASTER_CHEF_ADDRESS.toLowerCase() &&
      vault.tokens[0].address.toLowerCase() === chainInfo.BLID_ADDRESS.toLowerCase(),
  );
};

describe('#project #pool #bolide', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'Bolide',
      path: path.join(__dirname, '../index.ts'),
      modules: [StakingPools],
      contracts: {},
    });
  });

  test('All tokens are properly hydrated', async ({ project }) => {
    const [, mockAxios] = createMockContext();
    mockAxios.onGet(ENDPOINT_API).reply(200, testResponse);

    const [tokens] = await project.preloadTokens();

    expect(tokens.length).toEqual(1);

    expect(tokens[0]).toMatchObject({
      address: expect.any(String),
      name: expect.any(String),
      symbol: expect.any(String),
      decimals: expect.any(Number),
    });
  });

  test('Pools count is correct', async ({ project }) => {
    const [, mockAxios] = createMockContext();
    mockAxios.onGet(ENDPOINT_API).reply(200, testResponse);

    const [pools] = await project.fetchPools();

    expect(pools.length).toEqual(1);
  });

  test('All information of pool rewarded is correct', async ({ project }) => {
    const [, mockAxios] = createMockContext();
    mockAxios.onGet(ENDPOINT_API).reply(200, testResponse);

    const chainInfo = getChainInfo('binance');
    const vaults = filterReponse(testResponse, chainInfo);

    const [pools] = await project.fetchPools();

    const pool = pools[0];
    const rewarded = pool.rewarded[0];

    expect(rewarded.token.address.toLowerCase()).toEqual(chainInfo.BLID_ADDRESS.toLowerCase());
    expect(rewarded.apr.year).toEqual(vaults[0].apy / 100);
  });

  test('All information of pool supplied is correct', async ({ project }) => {
    const [, mockAxios] = createMockContext();
    mockAxios.onGet(ENDPOINT_API).reply(200, testResponse);

    const chainInfo = getChainInfo('binance');
    const vaults = filterReponse(testResponse, chainInfo);

    const [pools] = await project.fetchPools();

    const pool = pools[0];
    const supplied = pool.supplied[0];

    expect(supplied.token.address.toLowerCase()).toEqual(chainInfo.BLID_ADDRESS.toLowerCase());
    expect(supplied.tvl).toEqual(vaults[0].tvl);
  });
});
