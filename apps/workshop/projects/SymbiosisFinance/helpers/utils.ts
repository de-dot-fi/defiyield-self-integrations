import { Context } from '@defiyield/sandbox';
import { SECONDS_IN_WEEK, WEEKS_IN_YEAR } from './constants';
import erc20Abi from '../../../../../packages/abis/erc20.abi.json';
import veSISDistributorAbi from '../abis/veSISDistributor.json';
import { VeConfig } from './config';

export async function getVeSISApr(
  {
    ethcall,
    ethcallProvider,
    BigNumber,
  }: Pick<Context, 'ethcall' | 'ethcallProvider' | 'BigNumber'>,
  veConfig: VeConfig,
) {
  const sisContract = new ethcall.Contract(veConfig.sis, erc20Abi);
  const distributorContract = new ethcall.Contract(veConfig.veSISDistributor, veSISDistributorAbi);

  const [distributorBalance, lockedBalance, lastTokenBalance, lastTokenTime] =
    await ethcallProvider.all<typeof BigNumber>([
      sisContract.balanceOf(veConfig.veSISDistributor),
      sisContract.balanceOf(veConfig.veSis),
      distributorContract.token_last_balance(),
      distributorContract.last_token_time(),
    ]);
  const balance = new BigNumber(distributorBalance.toString());
  let freeBalance = balance.minus(lastTokenBalance.toString());

  if (freeBalance.eq(0)) {
    const prevEpochTime = new BigNumber(lastTokenTime.toString())
      .minus(SECONDS_IN_WEEK)
      .dividedToIntegerBy(SECONDS_IN_WEEK)
      .multipliedBy(SECONDS_IN_WEEK);

    const [tokensPerWeek] = await ethcallProvider.all<typeof BigNumber>([
      distributorContract.tokens_per_week(prevEpochTime.toString()),
    ]);
    freeBalance = new BigNumber(tokensPerWeek.toString());
  }

  return freeBalance.multipliedBy(WEEKS_IN_YEAR).div(lockedBalance.toString()).toNumber();
}
