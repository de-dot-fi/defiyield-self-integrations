import { Context, ModuleDefinitionInterface, Pool, Token, UserPosition } from '@defiyield/sandbox';
import { normalizeDecimals } from '../../../common/utils/numbers';
import { KordFiLendingAssets, KordFiPrefix } from '../helpers/constants';
import {
  getKordFiLendingUserInfoQuery,
  getKordFiLendingVaultsInfoQuery,
  KordFiLendingUserInfo,
  KordFiLendingVaultsInfo,
  makeKordFiApiRequest,
} from '../helpers/provider';

export const KordFiLeverageFarming: ModuleDefinitionInterface = {
  name: 'KordFi Leverage Farming',
  chain: 'tezos',
  type: 'leverageFarming',

  async preloadTokens() {
    return KordFiLendingAssets;
  },

  async fetchPools(ctx) {
    const vaults: Pool[] = [];

    const response = await makeKordFiApiRequest<KordFiLendingVaultsInfo>(
      ctx,
      getKordFiLendingVaultsInfoQuery,
    );

    const vaultsInfo = response?.contractInfo[0];
    const externalInfo = response?.externalInfo[0];

    if (!vaultsInfo || !externalInfo) {
      return vaults;
    }

    const xtzToken = ctx.tokens.find(({ address }) => address === KordFiLendingAssets[0]);
    const tzBtcToken = ctx.tokens.find(({ address }) => address === KordFiLendingAssets[1]);

    if (xtzToken && tzBtcToken) {
      vaults.push(formatToPool(ctx, xtzToken, xtzToken, vaultsInfo, externalInfo, 'xtz'));
      vaults.push(formatToPool(ctx, xtzToken, tzBtcToken, vaultsInfo, externalInfo, 'tzbtc'));
    }

    return vaults;
  },

  async fetchUserPositions(ctx) {
    const { BigNumber } = ctx;
    const userPositions: UserPosition[] = [];

    const response = await makeKordFiApiRequest<KordFiLendingUserInfo>(
      ctx,
      getKordFiLendingUserInfoQuery,
      {
        address: ctx.user,
      },
    );

    const poolInfo = response?.contractInfo[0];
    const userInfo = response?.userInfo[0];
    const externalInfo = response?.externalInfo[0];

    if (!userInfo || !poolInfo || !externalInfo) {
      return userPositions;
    }

    ctx.pools.forEach((pool) => {
      calculateUserPosition(ctx, userPositions, pool, userInfo, poolInfo, externalInfo);
    });

    return userPositions;
  },
};

const calculateUserPosition = (
  ctx: Context,
  userPositions: UserPosition[],
  pool: Pool,
  userInfo: KordFiLendingUserInfo['userInfo']['0'],
  poolInfo: KordFiLendingUserInfo['contractInfo']['0'],
  externalInfo: KordFiLendingUserInfo['externalInfo']['0'],
) => {
  const userPosition: UserPosition = {
    id: pool.id,
  };

  const userBorrowed = new ctx.BigNumber(
    userInfo[`${pool.extra?.prefix as KordFiPrefix}GrossCredit`] || 0,
  );
  const borrowedIndex = poolInfo[`${pool.extra?.prefix as KordFiPrefix}GrossCreditIndex`];

  const { token, apr, tvl } = pool.borrowed?.[0] || {};

  const borrowedAmount = normalizeDecimals(
    ctx,
    userBorrowed.multipliedBy(borrowedIndex),
    pool.borrowed?.[0]?.token.decimals || 0,
    true,
  );

  const userSupplied = new ctx.BigNumber(userInfo[`${pool.extra?.prefix as KordFiPrefix}LbShares`])
    .multipliedBy(externalInfo.lbXtzRate)
    .minus(
      borrowedAmount.dividedBy(pool.extra?.prefix === 'tzbtc' ? externalInfo.xtzTzbtcRate : 1),
    );

  if (userBorrowed.gt(0) && token) {
    userPosition.borrowed = [
      {
        token,
        apr,
        tvl,
        balance: borrowedAmount.toNumber(),
      },
    ];
  }

  if (userSupplied.gt(0)) {
    const { token, apr, tvl } = pool.supplied?.[0] || {};

    if (token) {
      userPosition.supplied = [
        {
          token,
          apr,
          tvl,
          balance: userSupplied.toNumber(),
        },
      ];
    }
  }

  if (userPosition?.supplied?.length || userPosition?.borrowed?.length) {
    userPositions.push(userPosition);
  }
};

const formatToPool = (
  ctx: Context,
  supplyToken: Token,
  borrowToken: Token,
  vaultsInfo: KordFiLendingVaultsInfo['contractInfo'][0],
  externalInfo: KordFiLendingVaultsInfo['externalInfo'][0],
  prefix: KordFiPrefix,
): Pool => {
  const { BigNumber } = ctx;

  const supplied = new BigNumber(vaultsInfo[`${prefix}LbShares`])
    .multipliedBy(prefix === 'xtz' ? externalInfo.lbXtzRate : externalInfo.lbTzbtcRate)
    .multipliedBy(externalInfo[`${prefix}Rate`]);
  const borrowed = normalizeDecimals(
    ctx,
    new BigNumber(vaultsInfo[`${prefix}GrossCredit`]).multipliedBy(
      vaultsInfo[`${prefix}GrossCreditIndex`],
    ),
    borrowToken.decimals,
    true,
  );

  const apr = new BigNumber(externalInfo.lbApy)
    .plus(vaultsInfo[`${prefix}GrossCreditRate`])
    .dividedBy(100)
    .toNumber();

  return {
    id: `${supplyToken.address}-${borrowToken.address}`,
    supplied: [
      {
        token: supplyToken,
        tvl: supplied.toNumber(),
        apr: { year: apr },
      },
    ],
    borrowed: [
      { token: borrowToken, tvl: borrowed.multipliedBy(borrowToken?.price || 0).toNumber() },
    ],
    extra: { prefix },
  };
};
