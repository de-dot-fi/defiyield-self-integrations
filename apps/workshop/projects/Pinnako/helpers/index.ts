import { FetchPoolsContext } from '@defiyield/sandbox';
import { plpStatsQuery, stakePoolStatsQuery } from './queries';

export const jitoEndpoint = 'https://api.studio.thegraph.com/query/49418/zkamin_tvl/version/latest';
export const plpEndpoint =
  'https://api.studio.thegraph.com/query/49418/zkmain_stats/version/latest';
interface StakePoolStats {
  id: string;
  lpLocked: string;
  duration: number;
  durationId: string;
}

interface StakePoolStatsResponse {
  data: {
    durationTotalValueLockeds: StakePoolStats[];
  };
}

export async function jitoStats({ axios }: Pick<FetchPoolsContext, 'axios'>) {
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
  const stats = response.data.data.durationTotalValueLockeds;
  const apr = 0;
  const tvl = stats[stats.length - 1]?.lpLocked || 0;

  return { apr, tvl };
}

export async function plpStats({ axios }: Pick<FetchPoolsContext, 'axios'>) {
  const end = new Date();
  const start = new Date();

  start.setDate(start.getDate() - 5);

  const response = await axios.post(plpEndpoint, {
    query: plpStatsQuery,
    variables: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  });
  const stats = response.data.data.glpStats;
  const plpPrice = stats[0]?.aumInUsdg / stats[0]?.glpSupply / Math.pow(10, 12);
  return { plpPrice };
}
