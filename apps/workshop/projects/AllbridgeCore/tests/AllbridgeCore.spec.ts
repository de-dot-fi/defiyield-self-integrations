import {createMockContext, createTestProject, MockContracts} from '@defiyield/testing';
import {join} from 'path';
import {describe, test, expect, beforeEach} from 'vitest';
import {getAllbridgeModule} from '../modules/AllbridgePool';
import tokenInfoData from './token-info-data.json'
import {Token} from '@defiyield/sandbox';

const SYSTEM_PRECISION = 1e3;
const TOKEN_BALANCE_1 = 2.3 * SYSTEM_PRECISION;
const TOKEN_BALANCE_2 = 3.4 * SYSTEM_PRECISION;
const LP_AMOUNT_1 = 4.5 * SYSTEM_PRECISION;
const LP_AMOUNT_2 = 5.6 * SYSTEM_PRECISION;
const TOKEN_INFO_URL = 'https://core.api.allbridgecoreapi.net/token-info';
const mockContracts: MockContracts = {
  '0x179aaD597399B9ae078acFE2B746C09117799ca0': {
    tokenBalance: () => TOKEN_BALANCE_1,
    userInfo: () => ({lpAmount: LP_AMOUNT_1})

  },
  '0xB19Cd6AB3890f18B662904fd7a40C003703d2554': {
    tokenBalance: () => TOKEN_BALANCE_2,
    userInfo: () => ({lpAmount: LP_AMOUNT_2})
  },
  fallback: {},
};

function createFakeToken(address: string): Token {
  return {
    address,
    name: 'Fake Token',
    symbol: 'fake',
    decimals: 18,
    price: 10,
    underlying: [],
  };
}

describe('#project #AllbridgeCore #pool', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'AllbridgeCore',
      path: join(__dirname, '../index.ts'),
      modules: [getAllbridgeModule('BSC')],
      contracts: mockContracts,
    });
  });

  test('Fetches all the expected tokens', async ({project}) => {
    const [, mockAxios] = createMockContext(mockContracts);
    mockAxios.onGet(TOKEN_INFO_URL).reply(200, tokenInfoData);
    const tokensPerModule = await project.preloadTokens();
    expect(tokensPerModule).toEqual([
      [
        createFakeToken(tokenInfoData.BSC.tokens[0].tokenAddress),
        createFakeToken(tokenInfoData.BSC.tokens[1].tokenAddress),
      ]
    ])
  });

  test('Fetches all the expected pools', async ({project}) => {
    const [, mockAxios] = createMockContext(mockContracts);
    mockAxios.onGet(TOKEN_INFO_URL).reply(200, tokenInfoData);
    const pools = await project.fetchPools();

    expect(pools).toEqual([
        [
          {
            id: tokenInfoData.BSC.tokens[0].poolAddress,
            supplied: [{
              "token": createFakeToken(tokenInfoData.BSC.tokens[0].tokenAddress),
              "tvl": 23, // system precision 3, token price 10
              "apr": {
                "year": +tokenInfoData.BSC.tokens[0].apr
              }
            }],
            extra: {"lpRate": +tokenInfoData.BSC.tokens[0].lpRate}
          },
          {
            id: tokenInfoData.BSC.tokens[1].poolAddress,
            supplied: [{
              "token": createFakeToken(tokenInfoData.BSC.tokens[1].tokenAddress),
              "tvl": 34,// system precision 3, token price 10
              "apr": {
                "year": +tokenInfoData.BSC.tokens[1].apr
              }
            }],
            extra: {"lpRate": +tokenInfoData.BSC.tokens[1].lpRate}
          },
        ]
      ]
    )
  });

  test('Calculates the correct reward apr for active pools', async ({project}) => {
    const [, mockAxios] = createMockContext(mockContracts);
    mockAxios.onGet(TOKEN_INFO_URL).reply(200, tokenInfoData);
      const userPositions = await project.fetchUserPositions('0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5');
      expect(userPositions).toEqual([
        {
          "id": tokenInfoData.BSC.tokens[0].poolAddress,
          "supplied": [
            {
              "token": createFakeToken(tokenInfoData.BSC.tokens[0].tokenAddress),
              "tvl": 23,
              "apr": {
                "year": +tokenInfoData.BSC.tokens[0].apr
              },
              "balance": 4.5 * +tokenInfoData.BSC.tokens[0].lpRate
            }
          ]
        },
        {
          "id": tokenInfoData.BSC.tokens[1].poolAddress,
          "supplied": [
            {
              "token": createFakeToken(tokenInfoData.BSC.tokens[1].tokenAddress),
              "tvl": 34,
              "apr": {
                "year": +tokenInfoData.BSC.tokens[1].apr
              },
              "balance": 5.6 * +tokenInfoData.BSC.tokens[1].lpRate
            }
          ]
        }
      ])
  });
});


