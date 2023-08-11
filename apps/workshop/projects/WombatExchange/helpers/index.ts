import { Context } from '@defiyield/sandbox';
import { assetsQuery, poolsQuery, tokensQuery } from './queries';

type ApiEndpoints = {
  [key: string]: string;
};

const apiEndpoints: ApiEndpoints = {
  ethereum: 'https://api.thegraph.com/subgraphs/name/wombat-exchange/wombat-exchange-eth',
  binance: 'https://api.thegraph.com/subgraphs/name/wombat-exchange/wombat-exchange-bsc',
  arbitrum: 'https://api.thegraph.com/subgraphs/name/wombat-exchange/wombat-exchange-arbone',
};

interface Token {
  price: string;
  id: string;
  name: string;
  symbol: string;
  decimals: string;
}

interface TokenResponse {
  data: {
    tokens: Token[];
  };
}

interface UnderlyingToken {
  id: string;
  name: string;
  decimals: string;
  price: string;
}

export interface Pool {
  id: string;
  assets: Asset[];
}

export interface Asset {
  id: string;
  symbol: string;
  poolAddress: string;
  underlyingToken: UnderlyingToken;
  womBaseApr: string;
  tvlUSD: string;
}

interface PoolResponse {
  data: {
    pools: Pool[];
  };
}

interface AssetResponse {
  data: {
    assets: Asset[];
  };
}

export async function getTokensData(context: Context, chain: string): Promise<string[]> {
  const result: string[] = [];

  if (chain in apiEndpoints) {
    const response = await context.axios.post<TokenResponse>(apiEndpoints[chain], {
      query: tokensQuery,
    });
    const tokens: Token[] = response.data.data.tokens;

    tokens.map((t) => {
      result.push(t.id);
    });
  }

  return result;
}

export async function getPoolsData(context: Context, chain: string): Promise<Pool[]> {
  if (chain in apiEndpoints) {
    const response = await context.axios.post<PoolResponse>(apiEndpoints[chain], {
      query: poolsQuery,
    });
    const pools: Pool[] = response.data.data.pools;
    return pools;
  }

  return [];
}

export async function getAssetsData(context: Context, chain: string): Promise<Asset[]> {
  if (chain in apiEndpoints) {
    const response = await context.axios.post<AssetResponse>(apiEndpoints[chain], {
      query: assetsQuery,
    });
    const assets: Asset[] = response.data.data.assets;
    return assets;
  }

  return [];
}
