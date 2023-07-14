export const getRewardApr = (
  stakedTvl: number,
  allocPoint: number,
  totalAllocPoint: number,
  singlePerBlock: number,
  singlePrice: number,
  blocksPerYear: number,
) => {
  return (
    (((allocPoint / totalAllocPoint) * singlePerBlock * singlePrice) / stakedTvl) * blocksPerYear
  );
};
