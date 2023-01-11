import { chain } from './../../AuraFinance/modules/AuraBal';
import { UnderlyingAsset } from './../../../../sandbox/src/types/module';
import { Token } from '@defiyield/sandbox';
import { Zero } from './../helpers/constant';

import { createTestProject, MockContracts } from '@defiyield/testing';
import { BigNumber } from 'ethers';
import { join } from 'path';
import { describe, test, expect, beforeEach } from 'vitest';
import {
  CHAINLINK_ORACLE_ADDR,
  COMPOSITION_TOKENS,
  PLP_STAKING_ADDR,
  PLP_STAKING_REVENUE_ADDR,
  PLP_TOKEN_ADDR,
  POOL_DIAMOND_ADDR,
} from '../helpers/config';
import { PLPStaking } from '../modules/PLPStaking';

const mockContracts: MockContracts = {
  [PLP_STAKING_REVENUE_ADDR]: {
    rewardRate: () => BigNumber.from('218'),
    pendingReward: (user: string) => BigNumber.from('200000000'), //200e6
  },
  [PLP_STAKING_ADDR]: {
    calculateTotalShare: (addr: string) => BigNumber.from('1294669305590076873498207'),
    getUserTokenAmount: (tokenAddr: string, userAddr: string) =>
      BigNumber.from('100000000000000000000'),
  },
  [CHAINLINK_ORACLE_ADDR]: {
    getMaxPrice: (addr: string) => BigNumber.from('1000079860000000000000000000000'),
    getMinPrice: (addr: string) => BigNumber.from('1000000000000000000000000000000'),
  },
  [POOL_DIAMOND_ADDR]: {
    getAumE18: (isMaxPrice: boolean) =>
      isMaxPrice
        ? BigNumber.from('1493489228353967348154413')
        : BigNumber.from('1492259524882424811143073'),
    liquidityOf: (addr: string) => {
      switch (addr.toLowerCase()) {
        case COMPOSITION_TOKENS.WMATIC:
          return BigNumber.from('91580492872939168472675');
        case COMPOSITION_TOKENS.WETH:
          return BigNumber.from('294234396040502833636');
        case COMPOSITION_TOKENS.WBTC:
          return BigNumber.from('1739382384');
        case COMPOSITION_TOKENS.USDC:
          return BigNumber.from('583132912396');
        case COMPOSITION_TOKENS.USDT:
          return BigNumber.from('146042409563');
        default:
          return Zero;
      }
    },
  },
  [PLP_TOKEN_ADDR]: {
    totalSupply: () => BigNumber.from('1419699023359249107958990'),
  },
};

describe('#project #Perp88 #staking', () => {
  beforeEach(async (context) => {
    context.project = await createTestProject({
      name: 'Perp88',
      path: join(__dirname, '../index.ts'),
      modules: [PLPStaking],
      contracts: mockContracts,
    });
  });

  test('The expected number of tokens are found', async ({ project }) => {
    const [tokens] = await project.preloadTokens();
    expect(tokens.length).toEqual(6);
  });

  test('Supplied tokens and Rewarded tokens formatted properly', async ({ project }) => {
    const [pools] = await project.fetchPools();

    expect(pools.length).toEqual(1);
    expect(pools[0].supplied?.length).toEqual(1);
    expect(pools[0].rewarded?.length).toEqual(1);

    expect(pools[0].supplied?.[0]).toEqual(
      expect.objectContaining({
        token: expect.objectContaining({
          name: 'PLP Token',
          price: 1.0515,
          chainId: 3, //internal chainId
        }),
        apr: {
          year: 0.005,
        },
      }),
    );

    expect(pools[0].rewarded?.[0]).toEqual(
      expect.objectContaining({
        token: expect.objectContaining({
          address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        }),
      }),
      expect.not.objectContaining({
        apr: undefined,
      }),
    );
  });

  test('fetches user balances', async ({ project }) => {
    const pools = await project.fetchUserPositions('0x-chentang88158');

    expect(pools.length).toEqual(1);
    expect(pools[0].id).toEqual('PLP POOL User Staking');
    expect(pools[0].supplied?.length).toEqual(1);
    expect(pools[0].rewarded?.length).toEqual(1);
    expect(pools[0].supplied?.[0]).toEqual(
      expect.objectContaining({
        token: expect.objectContaining({
          name: 'PLP Token',
          price: 1.0515,
          chainId: 3, //internal chainId
        }),
        apr: {
          year: 0.005,
        },
        tvl: 918747.2726971059,
        balance: 100,
      }),
    );
    expect(pools[0].rewarded?.[0]).toEqual(
      expect.objectContaining({
        token: expect.objectContaining({
          address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        }),
        balance: 200,
      }),
      expect.not.objectContaining({
        apr: undefined,
        tvl: undefined,
      }),
    );
  });
});
