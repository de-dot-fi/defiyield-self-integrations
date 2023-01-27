import { FetchPoolsContext, FetchUserPositionsContext } from '@defiyield/sandbox';
import { stakePoolStatsQuery } from './queries';

export const jitoToken = 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn';
export const solToken = '11111111111111111111111111111111';
export const jitoEndpoint = 'https://kobe.mainnet.jito.network/';

interface StakePoolStats {
  tvl: {
    data: number;
    date: string;
  }[];
  apy: {
    data: number;
    date: string;
  }[];
}

interface StakePoolStatsResponse {
  data: {
    getStakePoolStats: StakePoolStats;
  };
}

export async function jitoStats({
  axios,
}: Pick<FetchPoolsContext, 'axios'>): Promise<{ apr: number; tvl: number }> {
  const end = new Date();
  const start = new Date();

  start.setDate(start.getDate() - 5);

  const response = await axios.post<StakePoolStatsResponse>(jitoEndpoint, {
    query: stakePoolStatsQuery,
    variables: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  });

  const stats = response.data.data.getStakePoolStats;
  const apr = stats.apy[stats.apy.length - 1]?.data || 0;
  const tvl = stats.tvl[stats.tvl.length - 1]?.data || 0;

  return { apr, tvl };
}

export async function getBalance(ctx: FetchUserPositionsContext) {
  const { Connection, PublicKey } = ctx.solana.web3;
  const connection = new Connection(ctx.endpoint);

  const accountBalance = await connection.getParsedTokenAccountsByOwner(new PublicKey(ctx.user), {
    mint: new PublicKey(jitoToken),
  });

  return accountBalance.value[0]?.account?.data?.parsed;
}
