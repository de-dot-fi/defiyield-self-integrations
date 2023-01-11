import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';

export const Zero: BigNumber = /*#__PURE__*/ BigNumber.from(0);

export const e18 = parseEther('1');

export const MAX_BPS = BigNumber.from('10000');

export const secondsInYear = 31536000;
