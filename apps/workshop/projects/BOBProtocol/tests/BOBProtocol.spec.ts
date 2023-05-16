import { createMockContext, createTestProject } from '@defiyield/testing';
import { Token } from '@defiyield/sandbox';
import { join } from 'path';
import { describe, test, expect, beforeEach } from 'vitest';
import { getBobVault } from '../modules/BobVault';
import bobSwapPairsOnPolygon from './polygon-pairs.json';
import obBobUsdcOnPolygon from './polygon-ob-bob-usdc.json';
import obBobUsdtOnPolygon from './polygon-ob-bob-usdt.json';
import obUsdcUsdtOnPolygon from './polygon-ob-usdc-usdt.json';

const BASE_URL = 'https://supply.zkbob.com/coingecko/bobvault/polygon';
const GET_PAIRS_URL = `${BASE_URL}/pairs`;
const GET_OB_BOB_USDC = `${BASE_URL}/orderbook?ticker_id=BOB_USDC`;
const GET_OB_BOB_USDT = `${BASE_URL}/orderbook?ticker_id=BOB_USDT`;
const GET_OB_USDC_USDT = `${BASE_URL}/orderbook?ticker_id=USDC_USDT`;
const BOBonPolygon: Token = {
  address: '0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B',
  name: 'BOB',
  symbol: 'BOB',
  decimals: 18,
  price: 1,
  underlying: [],
};
const USDConPolygon: Token = {
  address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  name: 'USDC',
  symbol: 'USDC',
  decimals: 6,
  price: 1,
  underlying: [],
};
const USDTonPolygon: Token = {
  address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  name: 'USDC',
  symbol: 'USDC',
  decimals: 6,
  price: 1,
  underlying: [],
};

describe('#project #BOBProtocol #pool', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'BOB Protocol',
      path: join(__dirname, '../index.ts'),
      modules: [getBobVault('polygon')],
      contracts: {},
    });
  });

  test('Fetches all the expected tokens', async ({ project }) => {
    const [, mockAxios] = createMockContext({});
    mockAxios.onGet(GET_PAIRS_URL).reply(200, bobSwapPairsOnPolygon);

    const [tokens] = await project.preloadTokens();

    expect(tokens.length).toEqual(3);

    let count = 0;
    for (const asset of tokens) {
      if (asset.address === BOBonPolygon.address) count += 1;
      if (asset.address === USDConPolygon.address) count += 1;
      if (asset.address === USDTonPolygon.address) count += 1;
    }
    expect(count).toEqual(3);
  });

  test('Fetches all the expected pools', async ({ project }) => {
    const [, mockAxios] = createMockContext({});
    mockAxios.onGet(GET_PAIRS_URL).reply(200, bobSwapPairsOnPolygon);
    mockAxios.onGet(GET_OB_BOB_USDC).reply(200, obBobUsdcOnPolygon);
    mockAxios.onGet(GET_OB_BOB_USDT).reply(200, obBobUsdtOnPolygon);
    mockAxios.onGet(GET_OB_USDC_USDT).reply(200, obUsdcUsdtOnPolygon);

    const [pools] = await project.fetchPools();

    expect(pools.length).toEqual(1);
    expect(pools[0].supplied?.length).toEqual(3);

    const supplied = pools[0].supplied || [];
    for (const asset of supplied) {
      if (asset.token.address === BOBonPolygon.address)
        expect(asset.tvl).toEqual(4282996.165187129);
      if (asset.token.address === USDConPolygon.address) expect(asset.tvl).toEqual(717003.616633);
      if (asset.token.address === USDTonPolygon.address) expect(asset.tvl).toEqual(0.222814);
    }
  });
});
