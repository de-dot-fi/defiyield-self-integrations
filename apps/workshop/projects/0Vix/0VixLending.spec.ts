import { describe, test, expect, beforeEach } from 'vitest';
import { createMockContext, createTestProject, MockContracts } from '@defiyield/testing';
import { Lending0Vix } from './lending';
import { join } from 'path';

const mockMarketAddresses = ['0xdeadbeef', '0xcafebabe'];

const mockContracts: MockContracts = {
  '0x8849f1a0cB6b5D6076aB150546EddEe193754F1C': {
    getAllMarkets: () => mockMarketAddresses,
    markets: (market: string) =>
      ({
        '0xdeadbeef': { collateralFactorMantissa: 960000000000000000 },
        '0xcafebabe': { collateralFactorMantissa: 630000000000000000 },
      }[market]),
  },
  fallback: {
    supplyRatePerTimestamp: () => '31500000000',
    borrowRatePerTimestamp: () => '12500000000',
  },
};

describe('#project #lending #0Vix', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: '0Vix',
      path: join(__dirname, 'index.ts'),
      modules: [Lending0Vix],
      contracts: mockContracts,
    });
  });

  test('Token Addresses are resolved and found', async () => {
    const [mockContext] = createMockContext(mockContracts);

    const tokens = await Lending0Vix.preloadTokens(mockContext);

    expect(tokens).toEqual(mockMarketAddresses);
    expect(tokens.length).toEqual(mockMarketAddresses.length);
    expect(mockContext.ethcall.Contract).toBeCalledTimes(1);
    expect(mockContext.ethcallProvider.all).toBeCalledTimes(1);
  });

  test('Fetches All tokens', async ({ project }) => {
    const [tokens] = await project.preloadTokens();

    expect(tokens.length).toEqual(2);
  });

  test('Fetches All Pools', async ({ project }) => {
    const [tokens] = await project.preloadTokens();

    const [mockContext] = createMockContext(mockContracts);

    const pools = await Lending0Vix.fetchPools({ tokens, ...mockContext });

    expect(pools.length).toEqual(2);
  });

  test('Calculates the correct ltv', async ({ project }) => {
    const [pools] = await project.fetchPools();

    expect(pools[0].supplied?.[0].ltv).toEqual(0.96);
    expect(pools[1].supplied?.[0].ltv).toEqual(0.63);
  });

  test('Calculates the correct supplied apr', async ({ project }) => {
    const [pools] = await project.fetchPools();

    expect(pools[0].supplied?.[0].apr?.year).toEqual(0.993384);
  });
  test('Calculates the correct borrowed apr', async ({ project }) => {
    const [pools] = await project.fetchPools();

    expect(pools[1].borrowed?.[0].apr?.year).toEqual(0.3942);
  });
});
