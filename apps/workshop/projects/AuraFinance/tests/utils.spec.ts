import { describe, test, expect } from 'vitest';
import { getExtraRewarders, getPoolInfos } from '../helpers/utils';
import { createMockContext, MockContracts } from '@defiyield/testing';

describe('#project #utils #aura', () => {
  test('Gets extra booster rewarders', async () => {
    const mockRewarderAddresses = ['0xdeadbeef', '0xcafebabe'];

    const mockContracts: MockContracts = {
      // auroraBalRewards
      '0x5e5ea2048475854a5702f5b8468a51ba1296efcc': {
        extraRewardsLength: () => 2,
        extraRewards: (n: number) => mockRewarderAddresses[n],
      },
    };

    const [mockContext] = createMockContext(mockContracts);

    const rewarders = await getExtraRewarders(mockContext);

    expect(rewarders).toEqual(mockRewarderAddresses);
    expect(mockContext.ethcall.Contract).toBeCalledTimes(2);
    expect(mockContext.ethcallProvider.all).toBeCalledTimes(2);
  });

  test('gets extra booster pool info', async () => {
    const mockContracts: MockContracts = {
      // booster
      '0x7818A1DA7BD1E64c199029E86Ba244a9798eEE10': {
        poolLength: () => 5,
        poolInfo: () => ({
          lptoken: '0xdeadbeef',
          token: '0xcafebabe',
          gauge: '0xba5eba11',
          crvRewards: '0xdeficafe',
          stash: '0xca11ab1e',
          shutdown: Math.random() > 0.5,
        }),
      },
    };

    const [mockContext] = createMockContext(mockContracts);

    const pools = await getPoolInfos(mockContext);

    expect(pools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          lptoken: expect.any(String),
          token: expect.any(String),
          gauge: expect.any(String),
          crvRewards: expect.any(String),
          stash: expect.any(String),
          shutdown: expect.any(Boolean),
        }),
      ]),
    );

    expect(mockContext.ethcall.Contract).toBeCalledTimes(1);
    expect(mockContext.ethcallProvider.all).toBeCalledTimes(2);
  });
});
