import { createMockContext, createTestProject, MockContracts } from '@defiyield/testing';
import { join } from 'path';
import { describe, test, expect, beforeEach } from 'vitest';
import { ADDRESS } from '../helpers/constants';
import { veSIS } from '../modules/veSIS';
import { Pool } from '../../../../sandbox';

const TVL = 2000;
const POSITION = 10000;
const UNLOCK_TIME = 1675146310;
const multiplier = 1e18;

const TEST_TOKEN = {
  address: '0x0000000000000000000000000000000000000000',
  decimals: 18,
  price: 0.5, // $1
  underlying: [],
};

const mockContracts: MockContracts = {
  [ADDRESS.SIS]: {
    balanceOf: () => TVL * multiplier,
  },
  [ADDRESS.veSIS]: {
    locked: () => [POSITION * multiplier, UNLOCK_TIME],
  },
  [ADDRESS.veSISDistributor]: {
    token_last_balance: () => [0],
    last_token_time: () => [0],
  },
  fallback: {
    //
  },
};

describe('#project #SymbiosisFinance #veSIS', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'SymbiosisFinance',
      path: join(__dirname, '../index.ts'),
      modules: [veSIS],
      contracts: mockContracts,
    });
  });

  test('Fetches all the expected tokens', async ({ project }) => {
    const [tokens] = await project.preloadTokens();

    expect(tokens.length).toEqual(1);

    expect(tokens[0]).toMatchObject({
      address: ADDRESS.SIS,
      name: expect.any(String),
      symbol: expect.any(String),
      decimals: expect.any(Number),
    });
  });

  test('Fetches all the expected pools', async () => {
    const [mockContext] = createMockContext(mockContracts);

    const veSISPools = await veSIS.fetchPools({
      tokens: [TEST_TOKEN],
      ...mockContext,
    });

    expect(veSISPools.length).toEqual(1);

    const [pool] = veSISPools as [Pool];

    expect(pool.supplied).toEqual([
      expect.objectContaining({
        token: TEST_TOKEN,
        tvl: 1000, // 2000 * 0.5
        apr: { year: expect.any(Number) },
      }),
    ]);
  });

  test('Fetches user position', async () => {
    const [mockContext] = createMockContext(mockContracts);

    const positions = await veSIS.fetchUserPositions({
      user: '0x0000000000000000000000000000000000000000',
      pools: [
        {
          id: 'veSIS',
          supplied: [
            {
              token: TEST_TOKEN,
            },
          ],
        },
      ],
      ...mockContext,
    });

    expect(positions.length).toEqual(1);

    const [pool] = positions as [Pool];

    expect(pool.supplied).toEqual([
      expect.objectContaining({
        balance: POSITION,
        token: TEST_TOKEN,
        unlockTime: UNLOCK_TIME * 1000,
      }),
    ]);
  });
});
