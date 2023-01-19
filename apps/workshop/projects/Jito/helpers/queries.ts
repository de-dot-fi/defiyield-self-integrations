export const stakePoolStatsQuery = `
query QueryRoot($start: String!, $end: String!) {
  getStakePoolStats(
    req: {
      bucketType: DAILY
      rangeFilter: { start: $start, end: $end }
      sortBy: { field: BLOCK_TIME, order: DESC }
    }
  ) {
    tvl {
      data
      date
    }
    apy {
      data
      date
    }
  }
}`;
