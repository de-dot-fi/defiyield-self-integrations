import { createMockContext, createTestProject, MockContracts } from '@defiyield/testing';
import { join } from 'path';
import { describe, test, beforeEach, expect } from 'vitest';
import { CroSwap } from '../modules/CroSwap';
import { BigNumber } from 'ethers/lib/ethers';
import { UserPosition } from '../../../../sandbox/src/types/module';
import { CROSWAP_SUBGRAPH_URL, CROSWAP_FARMS_URL, GQL_GET_TOKENS } from '../helpers/const';
import { CroSwapToken, CroSwapTokens, TokenDayData, CroSwapFarms } from '../helpers/types';
import { fetchPoolsFromUrl, preloadTokensFromUrl } from '../helpers/util';
import { Token } from '../../../../sandbox/src/types/module';
import { GQL_HEADERS } from '../helpers/gql';

const mockTokens = <Token[]>[
  {
    address: '0xB0234DB57a9798cE960509387c966D55ED35206b',
    decimals: 18,
    name: 'MOCK-3',
    symbol: 'MOCK-3',
  },
  {
    address: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
    decimals: 18,
    name: 'MOCK-2',
    symbol: 'MOCK-2',
  },
  {
    address: '0x1Ba477CA252C0FF21c488d41759795E7E7812aB4',
    decimals: 18,
    name: 'MOCK-1',
    symbol: 'MOCK-1',
  },
];

const mockContracts: MockContracts = {
  '0x812d8983ead958512914713606e67022b965d738': {
    getPoolLength: () => 1,
    getPoolIdforLP: () => 0,
    getUserInfo: () => ({
      amount: BigNumber.from('501249152391048351783069'),
    }),
    pendingRewards: () => BigNumber.from('374438890683495831619460'),
  },
  '0xB0234DB57a9798cE960509387c966D55ED35206b': {
    balanceOf: () => BigNumber.from('0'),
    getReserves: () => ({
      _reserve0: BigNumber.from('291625472'),
      _reserve1: BigNumber.from('836566687674387021293479'),
    }),
    totalSupply: () => '15580063952326514',
    name: () => 'CroSwap LP',
    symbol: () => 'CroSwap-LP',
    decimals: () => 18,
  },
  '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23': {
    balanceOf: () => BigNumber.from('0'),
  },
  '0x1Ba477CA252C0FF21c488d41759795E7E7812aB4': {
    balanceOf: () => BigNumber.from('0'),
  },
  fallback: {},
};

describe('#project #CroSwap #todo', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'CroSwap',
      path: join(__dirname, '../index.ts'),
      modules: [CroSwap],
      contracts: mockContracts,
    });
  });

  test('fetches all tokens', async ({ project }) => {
    const [mockContext, mockAxios] = createMockContext(mockContracts);
    mockAxios.onPost('/subgraph').reply(200, {
      data: <CroSwapTokens>{
        tokens: [
          {
            id: '0xB0234DB57a9798cE960509387c966D55ED35206b',
            tokenDayData: [
              {
                priceUSD: '0.0',
              },
            ],
            decimals: '18',
            totalSupply: '15580063952326514',
          },
          {
            id: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
            tokenDayData: [
              {
                priceUSD: '0.0',
              },
            ],
            decimals: '18',
            totalSupply: '15580063952326514',
          },
          {
            id: '0x1Ba477CA252C0FF21c488d41759795E7E7812aB4',
            tokenDayData: [
              {
                priceUSD: '0.0',
              },
            ],
            decimals: '18',
            totalSupply: '15580063952326514',
          },
        ],
      },
    });

    const tokens = await preloadTokensFromUrl(mockContext, '/subgraph');

    expect(tokens.length).toEqual(3);
  });

  test('fetches all pools', async ({ project }) => {
    const [mockContext, mockAxios] = createMockContext(mockContracts);
    mockAxios.onGet('/farms').reply(200, {
      'MOCK1-MOCK2-MOCK1': <CroSwapFarms>{
        address: '0x812d8983ead958512914713606e67022b965d738',
        id: 0,
        name: 'MOCK1-MOCK2',
        pair: {
          pairAddress: '0xB0234DB57a9798cE960509387c966D55ED35206b',
          address0: '0x1Ba477CA252C0FF21c488d41759795E7E7812aB4',
          address1: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
          reserve0USD: '0.0',
          reserve1USD: '0.0',
        },
        emittedTokenAddress: '0x1Ba477CA252C0FF21c488d41759795E7E7812aB4',
        totalStakedUSD: '0.0',
      },
    });

    const pools = await fetchPoolsFromUrl(mockContext, mockTokens, '/farms');

    expect(pools.length).toEqual(1);

    const [pool] = pools;

    expect(pool.supplied).toEqual([
      expect.objectContaining({
        token: expect.objectContaining({
          address: expect.any(String),
          name: expect.any(String),
          symbol: expect.any(String),
          decimals: expect.any(Number),
          underlying: expect.objectContaining([
            expect.objectContaining({
              address: expect.any(String),
              name: expect.any(String),
              symbol: expect.any(String),
              decimals: expect.any(Number),
            }),
            expect.objectContaining({
              address: expect.any(String),
              name: expect.any(String),
              symbol: expect.any(String),
              decimals: expect.any(Number),
            }),
          ]),
        }),
        tvl: expect.any(Number),
      }),
    ]);

    expect(pool.rewarded?.length).toEqual(1);

    expect(pool.rewarded).toEqual([
      expect.objectContaining({
        token: expect.objectContaining({
          address: expect.any(String),
          name: expect.any(String),
          symbol: expect.any(String),
          decimals: expect.any(Number),
        }),
      }),
    ]);
  });

  test('fetches all users', async ({ project }) => {
    const [mockContext, mockAxios] = createMockContext(mockContracts);
    mockAxios.onGet('/farms').reply(200, {
      'MOCK1-MOCK2-MOCK1': <CroSwapFarms>{
        address: '0x812d8983ead958512914713606e67022b965d738',
        id: 0,
        name: 'MOCK1-MOCK2',
        pair: {
          pairAddress: '0xB0234DB57a9798cE960509387c966D55ED35206b',
          address0: '0x1Ba477CA252C0FF21c488d41759795E7E7812aB4',
          address1: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
          reserve0USD: '0.0',
          reserve1USD: '0.0',
        },
        emittedTokenAddress: '0x1Ba477CA252C0FF21c488d41759795E7E7812aB4',
        totalStakedUSD: '0.0',
      },
    });

    const pools = await fetchPoolsFromUrl(mockContext, mockTokens, '/farms');

    const [position] = (await CroSwap.fetchUserPositions({
      pools: pools,
      user: '0x6c3A0E2E78848274B7E3346b8Ef8a4cBB2fEE2a9',
      ...mockContext,
    })) as UserPosition[];

    expect(position).toMatchObject({
      id: expect.any(String),
      supplied: [
        expect.objectContaining({
          token: expect.objectContaining({
            address: expect.any(String),
            name: expect.any(String),
            symbol: expect.any(String),
            decimals: expect.any(Number),
            underlying: expect.objectContaining([
              expect.objectContaining({
                address: expect.any(String),
                name: expect.any(String),
                symbol: expect.any(String),
                decimals: expect.any(Number),
              }),
              expect.objectContaining({
                address: expect.any(String),
                name: expect.any(String),
                symbol: expect.any(String),
                decimals: expect.any(Number),
              }),
            ]),
          }),
          balance: expect.any(Number),
        }),
      ],
      rewarded: [
        expect.objectContaining({
          token: expect.objectContaining({
            address: expect.any(String),
            name: expect.any(String),
            symbol: expect.any(String),
            decimals: expect.any(Number),
          }),
          balance: expect.any(Number),
        }),
      ],
    });
  });
});
