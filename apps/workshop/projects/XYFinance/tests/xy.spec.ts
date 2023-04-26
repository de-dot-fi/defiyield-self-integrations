import { createMockContext, createTestProject, MockContracts } from '@defiyield/testing';
import { Pool } from '@defiyield/sandbox';
import { join } from 'path';
import { describe, test, expect, beforeEach } from 'vitest';
import { veXY } from '../modules/veXY';
import { VEXYS } from '../helpers/config';

const TVL = 2000;
const POSITION = 10000;
const UNLOCK_TIME = 1675146310;
const multiplier = 1e18;

const TEST_TOKEN = {
  address: '0x7777777777777777777777777777777777777777',
  decimals: 18,
  price: 10,
  underlying: [],
};

const VEXY = VEXYS['ethereum'];
if (!VEXY) {
  throw new Error('Unsupported chain');
}

const mockContracts: MockContracts = {
  [VEXY.xy]: {
    balanceOf: () => TVL * multiplier,
  },
  [VEXY.veXY]: {
    locked: () => [POSITION * multiplier, UNLOCK_TIME],
  },
  fallback: {},
};

describe('Project XY Finance @ De.Fi', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'XYFinance',
      path: join(__dirname, '../index.ts'),
      modules: [veXY('ethereum')],
      contracts: mockContracts,
    });
  });

  test('Fetches all the expected tokens', async ({ project }) => {
    const [tokens] = await project.preloadTokens();

    expect(tokens.length).toEqual(1);

    expect(tokens[0]).toMatchObject({
      address: VEXY.xy,
      name: expect.any(String),
      symbol: expect.any(String),
      decimals: expect.any(Number),
    });
  });

  test('Fetches user position', async () => {
    const [mockContext] = createMockContext(mockContracts);

    const positions = await veXY('ethereum').fetchUserPositions({
      user: '0x0000000000000000000000000000000000000000',
      pools: [
        {
          id: 'veXY-ethereum',
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
