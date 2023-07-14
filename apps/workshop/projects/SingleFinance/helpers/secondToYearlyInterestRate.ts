import { BigNumber } from 'ethers';

export const secondToYearlyInterestRate = (rate: BigNumber) =>
  (Number(rate) * (60 * 60 * 24 * 365)) / 1000000000000000000;
