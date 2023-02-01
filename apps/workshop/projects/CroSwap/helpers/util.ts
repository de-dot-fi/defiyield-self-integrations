import { Pool } from '@defiyield/sandbox';
import { CroSwapFarms, CroSwapTokens } from './types';
import { findToken } from '../../../../../packages/utils/array';
import { Context, Token } from '../../../../sandbox/src/types/module';
import { GQL_GET_TOKENS } from './const';
import { subgraph } from './gql';
import pairAbi from '../abis/pair.abi.json';
import type * as ethcall from 'ethcall';

export async function fetchPoolsFromUrl(
  context: Context,
  tokens: Token[],
  url: string,
): Promise<Pool[]> {
  const finder = findToken(tokens);

  return await context.axios.get(url).then(async (response: { data: any }) => {
    const pools = [];
    const { ethcall, ethcallProvider } = context;
    const entries = Object.entries<CroSwapFarms>(response.data);
    for (const [, value] of entries) {
      const contract = new ethcall.Contract(value.pair.pairAddress, pairAbi);

      const [name, symbol, decimals] = (await ethcallProvider.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
      ])) as [string, string, number];

      pools.push(<Pool>{
        id: value.pair.pairAddress,
        supplied: [
          {
            token: {
              address: value.pair.pairAddress,
              name: name,
              symbol: symbol,
              decimals: decimals,
              underlying: [finder(value.pair.address0), finder(value.pair.address1)],
            },
            tvl: parseFloat(value.totalStakedUSD),
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
