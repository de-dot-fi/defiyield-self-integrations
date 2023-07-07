import { FetchPoolsContext } from '@defiyield/sandbox';
import { stakePoolStatsQuery } from './queries';

export const jitoEndpoint = 'https://api.studio.thegraph.com/query/49418/zkamin_tvl/version/latest';

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
