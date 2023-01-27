import { Context } from '@defiyield/sandbox';

import { ADDRESS, WEEKS_IN_YEAR } from './constants';
import erc20Abi from '../../../../../packages/abis/erc20.abi.json';
import veSISDistributorAbi from '../abis/veSISDistributor.json';
import { BigNumber } from 'ethers';

export async function getVeSISApr({
  ethcall,
  ethcallProvider,
}: Pick<Context, 'ethcall' | 'ethcallProvider'>) {
  const sisContract = new ethcall.Contract(ADDRESS.SIS, erc20Abi);
  const distributorContract = new ethcall.Contract(ADDRESS.veSISDistributor, veSISDistributorAbi);

  const [distributorBalance, lockedBalance, lastTokenBalance] =
    await ethcallProvider.all<BigNumber>([
      sisContract.balanceOf(ADDRESS.veSISDistributor),
      sisContract.balanceOf(ADDRESS.veSIS),
      distributorContract.token_last_balance(),
    ]);

  return distributorBalance.sub(lastTokenBalance).mul(WEEKS_IN_YEAR).mul(100).div(lockedBalance);
}
