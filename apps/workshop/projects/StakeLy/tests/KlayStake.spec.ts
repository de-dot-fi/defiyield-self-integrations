import { Pool } from '@defiyield/sandbox';
import { createMockContext, createTestProject, MockContracts } from '@defiyield/testing';
import { join } from 'path';
import { describe, test, expect, beforeEach } from 'vitest';

import { KlayStake } from '../modules/KlayStake';

const APR = 12.13;
const TOTAL_STAKING = 123 * 1e18;
const BALANCE_OF = 2 * 1e18;
const TEST_TOKEN = {
  address: '0x-test-token',
  decimals: 18,
  price: 10,
  underlying: [],
};
const stKlayAddress = '0xF80F2b22932fCEC6189b9153aA18662b15CC9C00';

const mockContracts: MockContracts = {
  [stKlayAddress]: {
    balanceOf: () => BALANCE_OF,
    totalStaking: () => TOTAL_STAKING,
  },
  fallback: {},
};

describe('#project #StakeLy #KlayStake', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'StakeLy',
      path: join(__dirname, '../index.ts'),
      modules: [KlayStake],
      contracts: mockContracts,
    });
  });

  test('Fetches all the expected tokens', async ({ project }) => {
    const [tokens] = await project.preloadTokens();

    expect(tokens.length).toEqual(1);

    expect(tokens[0]).toMatchObject({
      address: stKlayAddress,
      name: expect.any(String),
      symbol: expect.any(String),
      decimals: expect.any(Number),
    });
  });

  // TODO fix axis

  test('Fetches all the expected pools', async () => {
    const [mockContext, mockAxios] = createMockContext(mockContracts);
    mockAxios.onGet('https://stake.ly/api/stats/stKlay/apr').reply(200, { value: APR });

    const stKlayPools = await KlayStake.fetchPools({
      tokens: [TEST_TOKEN],
      ...mockContext,
    });

    expect(stKlayPools.length).toEqual(1);

    const [pool] = stKlayPools as [Pool];

    expect(pool.supplied).toEqual([
      expect.objectContaining({
        token: TEST_TOKEN,
        apr: { year: expect.any(Number) },
        tvl: expect.any(Number),
      }),
    ]);
  });

  test('Calculates the correct reward apr and tvl', async () => {
    const [mockContext, mockAxios] = createMockContext(mockContracts);
    mockAxios.onGet('https://stake.ly/api/stats/stKlay/apr').reply(200, { value: APR });

    const stKlayPools = await KlayStake.fetchPools({
      tokens: [TEST_TOKEN],
      ...mockContext,
    });

    expect(stKlayPools.length).toEqual(1);

    const [supply] = stKlayPools[0]?.supplied || [];

    expect(supply).toBeDefined();

    expect(supply.tvl).toEqual((TOTAL_STAKING / 1e18) * 10);
    expect(supply.apr?.year).toEqual(APR / 100);
  });
});
