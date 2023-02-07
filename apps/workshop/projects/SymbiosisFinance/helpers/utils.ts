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

export async function getPoolApr(context: Context, chainId: number): Promise<number> {
  const aprData = await context.axios.get('https://api-v2.symbiosis.finance/farming/v1/apr');

  let apr = null;
  for (let j = 0; j < aprData.data.length; j++) {
    const item = aprData.data[j];
    for (let i = 0; i < item.pools.length; i++) {
      if (item.pools[i].chainId === chainId) {
        apr = item.pools[i].apr * 100;
        break;
      }
    }
    if (apr) {
      break;
    }
  }
  return apr || 0;
}
