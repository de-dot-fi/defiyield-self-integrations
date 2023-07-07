export const stakePoolStatsQuery = `
query Tvl {
  durationTotalValueLockeds(
    where: {duration: "daily"}
    orderBy: durationId
    first: 1000
  ) {
    id
    lpLocked
    duration
    durationId
  }
}`;
