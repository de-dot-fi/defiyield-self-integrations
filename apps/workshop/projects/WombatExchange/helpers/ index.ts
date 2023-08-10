import { Context, Pool } from '@defiyield/sandbox';

type ApiEndpoints = {
  [key: string]: string;
};

const apiEndpoints: ApiEndpoints = {
  ethereum: 'https://api.thegraph.com/subgraphs/name/wombat-exchange/wombat-exchange-eth',
  binance: 'https://api.thegraph.com/subgraphs/name/wombat-exchange/wombat-exchange-bsc',
  arbitrum: 'https://api.thegraph.com/subgraphs/name/wombat-exchange/wombat-exchange-arbone',
};

const poolsQuery = `
    query {
      assets {
        id
        symbol
        poolAddress
        underlyingToken {
          id
        }
        womBaseApr
        tvlUSD
      }
    }
`;

interface UnderlyingToken {
  id: string;
}

interface Asset {
  id: string;
  symbol: string;
  poolAddress: string;
  underlyingToken: UnderlyingToken;
  womBaseApr: string;
  tvlUSD: string;
}

interface PoolResponse {
  data: {
    assets: Asset[];
  };
}

export async function getPools(context: Context, chain: string): Promise<Pool[]> {
  const pools: Pool[] = [];

  if (chain in apiEndpoints) {
    const response = await context.axios.post<PoolResponse>(apiEndpoints[chain], {
      query: poolsQuery,
    });
    const assets: Asset[] = response.data.data.assets;

    assets.map((a) => {
      pools.push({
        id: a.poolAddress,
        supplied: [
          {
            token: a.underlyingToken.id,
            tvl: Number(a.tvlUSD),
            apr: { year: Number(a.womBaseApr) },
          },
        ],
      });
    });
  }

  return pools;
}
