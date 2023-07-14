export const getApr = (
  borrowingInterest: number,
  totalBorrow: number,
  totalSupply: number,
  lendingPerformanceFee: number,
) => {
  return borrowingInterest * (totalBorrow / totalSupply) * (1 - lendingPerformanceFee);
};
