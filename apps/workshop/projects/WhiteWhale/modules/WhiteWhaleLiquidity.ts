import type {
  FetchPoolsContext,
  FetchTokenDetailsContext,
  FetchTokenPricesContext,
  FetchUserPositionsContext,
  ModuleDefinitionInterface,
  Pool,
  SupportedChain,
  TokenDetail,
  TokenExtra,
  UserPosition,
} from '@defiyield/sandbox';
import { normalizeDecimals } from '../../../common/utils/numbers';
import { getContracts, getContractInfo, getBalances, tradingApr } from '../helpers';
import { fetchMissingTokenPricesForAsset } from '../helpers/calculation';
import { WHITE_WHALE_POOLS } from '../helpers/config';

export function WhiteWhaleLiquidity(chain: SupportedChain): ModuleDefinitionInterface {
  const currentPool = WHITE_WHALE_POOLS[chain];
  if (!currentPool) {
    throw new Error('Unsupported chain');
  }

  return {
    name: `WhiteWhale Liquidity: ${chain}`,
    chain,
    type: 'pools',

    async preloadTokens(ctx) {
      return await getContracts(currentPool.factory, ctx);
    },

    fetchMissingTokenDetails,

    fetchMissingTokenPrices,

    fetchPools,

    fetchUserPositions,
  };
}

async function fetchMissingTokenDetails(ctx: FetchTokenDetailsContext) {
  const info = await getContractInfo(ctx.address, ctx);
  const underlying = info.asset_infos.map(
    (t: any) => t.native_token?.denom || t.token?.contract_addr,
  );
  if (Array.isArray(underlying)) {
    return <TokenDetail>{
      decimals: 6,
      address: ctx.address,
      underlying,
      metadata: { contract: info.liquidity_token },
    };
  }
  return void 0;
}

async function fetchMissingTokenPrices(ctx: FetchTokenPricesContext) {
  const results: TokenExtra[] = [];

  for await (const asset of ctx.assets) {
    const result = await fetchMissingTokenPricesForAsset(asset, ctx);
    if (result) {
      results.push(result);
    }
  }

  return results;
}

async function fetchPools(ctx: FetchPoolsContext) {
  const { BigNumber, tokens } = ctx;
  const aprs = await tradingApr(ctx);

  return tokens.reduce((result: Pool[], token) => {
    if (token.underlying.length !== 2) {
      return result;
    }

    const tvl = new BigNumber(token.price ?? 0).times(token.totalSupply ?? 0).toNumber();
    const apr = new BigNumber(aprs.get(token.address) ?? 0).div(100).toNumber();

    result.push({
      id: token.address,
      supplied: [{ token, tvl, apr: { year: apr } }],
    });

    return result;
  }, []);
}

async function fetchUserPositions(ctx: FetchUserPositionsContext): Promise<UserPosition[]> {
  const balances: Map<string, number> = await getBalances(ctx);

  return ctx.pools.reduce((acc: UserPosition[], pool) => {
    const supply = pool?.supplied?.[0];
    const rawBalance = supply && balances.get(supply.token.address);
    if (rawBalance && rawBalance > 0) {
      const balance = normalizeDecimals(ctx, rawBalance, supply.token.decimals);
      acc.push({
        id: pool.id,
        supplied: [Object.assign({ balance }, supply)],
      });
    }
    return acc;
  }, []);
}
