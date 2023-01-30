import { Context } from '@defiyield/sandbox';
import { ADDRESS, WEEKS_IN_YEAR } from './constants';
import erc20Abi from '../../../../../packages/abis/erc20.abi.json';
import veSISDistributorAbi from '../abis/veSISDistributor.json';

export async function getVeSISApr({
  ethcall,
  ethcallProvider,
  BigNumber,
}: Pick<Context, 'ethcall' | 'ethcallProvider' | 'BigNumber'>) {
  const sisContract = new ethcall.Contract(ADDRESS.SIS, erc20Abi);
  const distributorContract = new ethcall.Contract(ADDRESS.veSISDistributor, veSISDistributorAbi);

  const [distributorBalance, lockedBalance, lastTokenBalance] = await ethcallProvider.all<
    typeof BigNumber
  >([
    sisContract.balanceOf(ADDRESS.veSISDistributor),
    sisContract.balanceOf(ADDRESS.veSIS),
    distributorContract.token_last_balance(),
  ]);

  return new BigNumber(distributorBalance.toString())
    .minus(lastTokenBalance.toString())
    .multipliedBy(WEEKS_IN_YEAR)
    .multipliedBy(100)
    .div(lockedBalance.toString())
    .toNumber();
}
