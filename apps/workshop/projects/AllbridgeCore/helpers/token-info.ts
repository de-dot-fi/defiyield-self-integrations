import type { Context } from "@defiyield/sandbox";
import {ChainSymbol} from './chain';

export type ChainInfo = Record<ChainSymbol, {tokens: TokenInfo[]}>;

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  poolAddress: string;
  tokenAddress: string;
  apr: string;
  lpRate: string;
}

const BASE_URL = 'https://core.api.allbridgecoreapi.net';

export async function getTokenInfos(ctx: Context, chainSymbol: ChainSymbol): Promise<TokenInfo[]> {
  const tokenInfos = await getChainInfos(ctx);
  return tokenInfos[chainSymbol].tokens;
}

export async function getTokenInfo(ctx: Context, chainSymbol: ChainSymbol, tokenAddress: string): Promise<TokenInfo | undefined> {
  const tokenInfos = await getTokenInfos(ctx, chainSymbol);
  return tokenInfos.find(info => info.tokenAddress.toLowerCase() === tokenAddress.toLowerCase());
}

async function getChainInfos(ctx: Context): Promise<ChainInfo> {
  const result = await ctx.axios.get<ChainInfo>(`${BASE_URL}/token-info`);
  return result.data;
}
