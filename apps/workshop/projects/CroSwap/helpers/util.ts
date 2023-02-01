import { Pool } from '@defiyield/sandbox';
import { CroSwapFarms, CroSwapTokens } from './types';
import { findToken } from '../../../../../packages/utils/array';
import { Context, Token } from '../../../../sandbox/src/types/module';
import { GQL_GET_TOKENS } from './const';
import { subgraph } from './gql';

export async function fetchPoolsFromUrl(
  context: Context,
  tokens: Token[],
  url: string,
): Promise<Pool[]> {
  const finder = findToken(tokens);

  return await context.axios.get(url).then((response: { data: any }) => {
    const pools = [];
    const entries = Object.entries<CroSwapFarms>(response.data);
    for (const [, value] of entries) {
      pools.push(<Pool>{
        id: value.pair.pairAddress,
        supplied: [
          {
            token: finder(value.pair.address0),
            tvl: parseFloat(value.pair.reserve0USD),
          },
          {
            token: finder(value.pair.address1),
            tvl: parseFloat(value.pair.reserve1USD),
          },
        ],
        rewarded: [
          {
            token: finder(value.emittedTokenAddress),
            apr: {
              year: value.apr / 100,
            },
          },
        ],
      });
    }
    return pools;
  });
}

export function preloadTokensFromUrl(ctx: Context, url: string): Promise<string[]> {
  return subgraph<CroSwapTokens>(ctx, 'getTokens', GQL_GET_TOKENS, null, url).then((cst) => {
    return cst.tokens.map((token: any) => token.id);
  });
}
