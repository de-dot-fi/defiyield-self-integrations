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

const from = Math.floor(new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime() / 1000);
const to = parseInt((Date.now() / 1000).toString());
const timestampProp = 'id';
export const plpStatsQuery = `
query {
  glpStats(
    first: 1000
    orderBy: ${timestampProp}
    orderDirection: desc
    where: {
      period: daily
      ${timestampProp}_gte: ${from}
      ${timestampProp}_lte: ${to}
    }
    subgraphError: allow
  ) {
    ${timestampProp}
    aumInUsdg
    glpSupply
    distributedUsd
    distributedEth
  }
}`;
