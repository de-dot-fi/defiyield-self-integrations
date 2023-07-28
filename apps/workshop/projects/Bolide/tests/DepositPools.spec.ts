import { createMockContext, createTestProject } from '@defiyield/testing';
import path from 'path';
import { beforeEach, describe, expect, test } from 'vitest';

import { ENDPOINT_API } from '../helpers/provider';
import { getChainInfo } from '../helpers/vaults';
import { DepositPoolsBase } from '../modules/DepositPoolsBase';
import { testResponse } from './response';

const filterReponse = (res, chainInfo) => {
  return res.vaults.filter(
    (vault) =>
      vault.chainId === chainInfo.id &&
      vault.address.toLowerCase() !== chainInfo.MASTER_CHEF_ADDRESS.toLowerCase(),
  );
};

describe('#project #pool #bolide', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'Bolide',
      path: path.join(__dirname, '../index.ts'),
      modules: [new DepositPoolsBase('binance')],
      contracts: {},
    });
  });

  test('All tokens are properly hydrated', async ({ project }) => {
    const [, mockAxios] = createMockContext();
    mockAxios.onGet(ENDPOINT_API).reply(200, testResponse);

    const chainInfo = getChainInfo('binance');

    const [tokens] = await project.preloadTokens();

    let count = 1; // BLID token

    for (const vault of testResponse.vaults) {
      if (vault.chainId === chainInfo.id) {
        count += vault.tokens.length;
      }
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
    mockAxios.onGet(ENDPOINT_API).reply(200, testResponse);

    const chainInfo = getChainInfo('binance');
    const vaults = filterReponse(testResponse, chainInfo);

    const [pools] = await project.fetchPools();

    expect(pools.length).toEqual(vaults.length);
  });

  test('All information of pool rewarded is correct', async ({ project }) => {
    const [, mockAxios] = createMockContext();
    mockAxios.onGet(ENDPOINT_API).reply(200, testResponse);

    const chainInfo = getChainInfo('binance');
    const vaults = filterReponse(testResponse, chainInfo);

    const [pools] = await project.fetchPools();

    for (const [index, pool] of pools.entries()) {
      expect(pool.rewarded.length).toEqual(1);

      const rewarded = pool.rewarded[0];

      expect(rewarded.token.address.toLowerCase()).toEqual(chainInfo.BLID_ADDRESS.toLowerCase());
      expect(rewarded.apr.year).toEqual(vaults[index].apy / 100);
    }
  });

  test('All information of pool supplied is correct', async ({ project }) => {
    const [, mockAxios] = createMockContext();
    mockAxios.onGet(ENDPOINT_API).reply(200, testResponse);

    const chainInfo = getChainInfo('binance');
    const vaults = filterReponse(testResponse, chainInfo);

    const [pools] = await project.fetchPools();

    for (const [index, pool] of pools.entries()) {
      const vault = vaults[index];
      expect(pool.supplied.length).toEqual(vault.tokens.length);

      for (const [j, supplied] of pool.supplied.entries()) {
        expect(supplied.tvl).toEqual(vault.tokens[j].tvl);
      }
    }
  });
});
