import { Context } from '@defiyield/sandbox';

type Decimals = string | number;
type BigNumber = Context['BigNumber']['prototype'];

export function normalizeDecimals(
  { BigNumber }: Context,
  number: Decimals | BigNumber,
  decimals: Decimals,
  returnAsBigNumber: true,
): BigNumber;
export function normalizeDecimals(
  { BigNumber }: Context,
  number: Decimals | BigNumber,
  decimals: Decimals,
  returnAsBigNumber?: false,
): number;
export function normalizeDecimals(
  { BigNumber }: Context,
  number: Decimals | BigNumber,
  decimals: Decimals,
  returnAsBigNumber = false,
): number | BigNumber {
  const result = new BigNumber(number).div(new BigNumber(10).pow(decimals));
  return returnAsBigNumber ? result : result.toNumber();
}
