import erc20Abi from '@defiyield/abi/erc20.abi.json';
import type { ModuleDefinitionInterface } from '@defiyield/sandbox';
import { createMulticallChunker } from '@defiyield/utils/array';
import { BigNumber } from 'ethers';
import { WMasterChefABI } from '../abis/abi';
import { mapToChainId, SINGLE_TOKEN } from '../helpers/constants';
import { findTokenByAddress } from '../helpers/findTokenByAddress';
import { getFarms } from '../helpers/getFarms';
import { getUserPositions } from '../helpers/getUserPositions';
import { isSameAddr } from '../helpers/isSameAddress';
import { isSFSupportedChain, SFSupportedChain, SupportedDex } from '../helpers/types';

const throwIfUndefined = <T>(x: T | undefined): T => {
  if (x === undefined) throw new Error('Undefined');
  return x;
};

export const LYF = (chain: SFSupportedChain, dex: SupportedDex): ModuleDefinitionInterface => ({
  name: 'Single Finance LYF',
  chain,
  type: 'leverageFarming',

  async preloadTokens({ chain, axios, logger }) {
    if (!isSFSupportedChain(chain)) throw new Error('Unsupported chain: ' + chain);
    const tokens = (await getFarms(axios, chain, dex)).flatMap((farm) => [
      farm.token0.address[mapToChainId[chain]],
      farm.token1.address[mapToChainId[chain]],
      farm.lpToken.address[mapToChainId[chain]],
    ]);

    return [SINGLE_TOKEN[chain], ...tokens];
  },

  async fetchPools({ tokens, BigNumber, axios, ethcallProvider, ethcall }) {
    const farms = await getFarms(axios, chain, dex);
    return farms.map(({ id, lpToken, tvlInUSD, token0, token1, ...raw }) => {
      const token = findTokenByAddress(tokens, lpToken.address[mapToChainId[chain]]);
      if (!token) throw new Error('missing token: ' + lpToken.address[mapToChainId[chain]]);

      return {
        id,
        supplied: [
          {
            token,
            tvl: tvlInUSD,
            apr: {
              year:
                (raw.tradingFeeApr + raw.autoCompoundDexYieldPercent) * (1 - raw.perfFee) +
                raw.manualHarvestDexYieldPercent * (1 - raw.perfFee),
            },
          },
        ],
        borrowed: [
          ...(token0.borrowable
            ? [
                {
                  token: throwIfUndefined(
                    findTokenByAddress(tokens, token0.address[mapToChainId[chain]]),
                  ),
                },
              ]
            : []),
          ...(token1.borrowable
            ? [
                {
                  token: throwIfUndefined(
                    findTokenByAddress(tokens, token1.address[mapToChainId[chain]]),
                  ),
                },
              ]
            : []),
        ],
      };
    });
  },

  async fetchUserPositions({ pools, user, axios, BigNumber, ethcallProvider, ethcall }) {
    const positions = (await getUserPositions(axios, chain, user))
      .filter(({ stoplossAt }) => stoplossAt === null /* position not closed */)
      .filter(({ lpToken }) =>
        pools.find(
          ({ supplied }) =>
            supplied && isSameAddr(supplied[0].token.address, lpToken.address[mapToChainId[chain]]),
        ),
      );
    const multiCall = createMulticallChunker(ethcallProvider);

    const multiCallRes: [BigNumber, BigNumber][] = await multiCall(
      positions,
      ({ wmasterchef, collateralSize, collId, lpToken }) => {
        const wMasterChef = new ethcall.Contract(wmasterchef, WMasterChefABI);
        const lp = new ethcall.Contract(lpToken.address[mapToChainId[chain]], erc20Abi);
        return [wMasterChef.collSizeToLpBalance(collId, collateralSize), lp.totalSupply()];
      },
    );

    return positions.map(({ debt, lpToken, id }, index) => {
      const _debt: typeof debt = Object.keys(debt).reduce(
        (prev, cur) => ({ ...prev, [cur.toLowerCase()]: debt[cur] }),
        {},
      );

      const pool = pools.find(
        ({ supplied }) =>
          supplied && isSameAddr(supplied[0].token.address, lpToken.address[mapToChainId[chain]]),
      );

      if (!pool) throw new Error('missing pool: ' + lpToken.address[mapToChainId[chain]]);

      if (!pool.supplied || !pool.supplied[0]) throw new Error('missing supplie asset');

      const lp = pool.supplied[0].token;

      const lpBalance = new BigNumber(multiCallRes[index][0].toString())
        .dividedBy(10 ** lp.decimals)
        .toNumber();

      return {
        id: `${pool.id}-${id}`,
        supplied:
          pool.supplied &&
          pool.supplied.map((p) => ({
            ...p,
            balance: lpBalance,
          })),
        borrowed:
          pool.borrowed &&
          pool.borrowed.map((p) => ({
            ...p,
            balance: new BigNumber(_debt[p.token.address.toLowerCase()])
              .dividedBy(10 ** p.token.decimals)
              .toNumber(),
          })),
      };
    });
  },
});
