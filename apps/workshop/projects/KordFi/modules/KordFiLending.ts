import type {
  Context,
  ModuleDefinitionInterface,
  Pool,
  Token,
  UserPosition,
} from '@defiyield/sandbox';
import { TezosLiquidityBakingRewards } from '../../../common/constants/tezos.constants';
import { normalizeDecimals } from '../../../common/utils/numbers';
import { KordFiLendingAssets, KordFiPrefix } from '../helpers/constants';
import {
  getKordFiLendingUserInfoQuery,
  getKordFiLendingVaultsInfoQuery,
  KordFiLendingUserInfo,
  KordFiLendingVaultsInfo,
  makeKordFiApiRequest,
} from '../helpers/provider';

interface PoolExtra {
  prefix: KordFiPrefix;
}

export const KordFiLending: ModuleDefinitionInterface = {
  name: 'KordFi Lending',
  chain: 'tezos',
  type: 'lending',

  async preloadTokens() {
    return KordFiLendingAssets;
  },

  async fetchPools(ctx) {
    const vaults: Pool[] = [];

    const vaultsInfo = (
      await makeKordFiApiRequest<KordFiLendingVaultsInfo>(ctx, getKordFiLendingVaultsInfoQuery)
    )?.contractInfo[0];

    if (!vaultsInfo) {
      return vaults;
    }

    const xtzToken = ctx.tokens.find(({ address }) => address === KordFiLendingAssets[0]);
    const tzBtcToken = ctx.tokens.find(({ address }) => address === KordFiLendingAssets[1]);

    if (xtzToken) {
      vaults.push(formatToPool(ctx, xtzToken, vaultsInfo, 'xtz'));
    }
    if (tzBtcToken) {
      vaults.push(formatToPool(ctx, tzBtcToken, vaultsInfo, 'tzbtc'));
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

    if (!userInfo || !poolInfo) {
      return userPositions;
    }

    ctx.pools.forEach((pool) => {
      const userSupplied = new BigNumber(
        userInfo[`${pool.extra?.prefix as KordFiPrefix}Deposit`] || 0,
      );
      const suppliedIndex = poolInfo[`${pool.extra?.prefix as KordFiPrefix}DepositIndex`];

      if (userSupplied.gt(0)) {
        const { token, apr, tvl } = pool.supplied?.[0] || {};

        if (!token) {
          return;
        }

        userPositions.push({
          id: pool.id,
          supplied: [
            {
              token,
              apr,
              tvl,
              balance: normalizeDecimals(
                ctx,
                userSupplied.multipliedBy(suppliedIndex),
                token.decimals,
              ),
            },
          ],
        });
      }
    });

    return userPositions;
  },
};

const formatToPool = (
  ctx: Context,
  token: Token,
  vaultsInfo: KordFiLendingVaultsInfo['contractInfo'][0],
  prefix: KordFiPrefix,
): Pool => {
  const { BigNumber } = ctx;
  const supplied = normalizeDecimals(
    ctx,
    new BigNumber(vaultsInfo[`${prefix}Deposit`]).multipliedBy(vaultsInfo[`${prefix}DepositIndex`]),
    token.decimals,
    true,
  );
  const borrowed = normalizeDecimals(
    ctx,
    new BigNumber(vaultsInfo[`${prefix}GrossCredit`]).multipliedBy(
      vaultsInfo[`${prefix}GrossCreditIndex`],
    ),
    token.decimals,
    true,
  );

  const apr = new BigNumber(vaultsInfo[`${prefix}DepositRate`]).dividedBy(100).toNumber();
  const bakingRewards =
    prefix === 'xtz'
      ? new BigNumber(1)
          .minus(borrowed.dividedBy(supplied))
          .multipliedBy(TezosLiquidityBakingRewards)
          .dividedBy(100)
          .toNumber()
      : 0;

  return {
    id: token.address,
    supplied: [
      {
        token,
        tvl: supplied.multipliedBy(token?.price || 0).toNumber(),
        apr: { year: apr + bakingRewards },
      },
    ],
    borrowed: [{ token, tvl: borrowed.multipliedBy(token?.price || 0).toNumber() }],
    extra: { prefix },
  };
};
