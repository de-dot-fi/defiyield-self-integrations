import { ComplexAsset, FetchTokenPricesContext, TokenExtra } from '@defiyield/sandbox';
import { getPoolInfo } from '.';
import { normalizeDecimals } from '../../../common/utils/numbers';
import { NativeTokenAssetInfo, PoolInfo, TokenAssetInfo } from './types';

export async function fetchMissingTokenPricesForAsset(
  asset: ComplexAsset,
  ctx: FetchTokenPricesContext,
): Promise<TokenExtra | void> {
  const tokenA = asset.underlying[0];
  const tokenB = asset.underlying[1];

  if (!tokenA?.price || !tokenB?.price) {
    return;
  }

  const info = await getPoolInfo(asset.address, ctx);

  const totalSupply = normalizeDecimals(ctx, info.total_share, asset.decimals);
  const reserveA = findAsset(info, tokenA.address);
  const reserveB = findAsset(info, tokenB.address);

  if (!reserveA?.amount || !reserveB?.amount) {
    return;
  }

  const amountA = normalizeDecimals(ctx, reserveA.amount, tokenA.decimals, true);
  const amountB = normalizeDecimals(ctx, reserveB.amount, tokenB.decimals, true);
  const price = amountA.times(tokenA.price).plus(amountB.times(tokenB.price)).div(totalSupply);

  return {
    address: asset.address,
    price: price.toNumber(),
    underlying: [
      {
        address: tokenA.address,
        reserve: reserveA.amount,
      },
      {
        address: tokenB.address,
        reserve: reserveB.amount,
      },
    ],
    totalSupply: info.total_share,
  };
}
function findAsset(info: PoolInfo, address: string) {
  return info.assets.find((t) => {
    if (isNativeTokenAssetInfo(t.info)) {
      return t.info.native_token.denom === address;
    } else if (isTokenAssetInfo(t.info)) {
      return t.info.token.contract_addr === address;
    }
    return undefined;
  });
}

function isTokenAssetInfo(obj: any): obj is TokenAssetInfo {
  return 'token' in obj;
}

function isNativeTokenAssetInfo(obj: any): obj is NativeTokenAssetInfo {
  return 'native_token' in obj;
}
