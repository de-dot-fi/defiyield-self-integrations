import { Address, Context } from '@defiyield/sandbox';
import { Pool } from './config';

const BASE_API_URL = 'https://api-v2.symbiosis.finance';

export async function getPoolTvl(context: Context, pool: Pool): Promise<number> {
  const {
    data: { tvl },
  } = await context.axios.get(`${BASE_API_URL}/crosschain/v1/pool-tvl/${pool.poolIndex}`);
  return tvl;
}

export async function getUserPosition(
  context: Context,
  pool: Pool,
  user: Address,
): Promise<number> {
  const {
    data: { position },
  } = await context.axios.get(
    `${BASE_API_URL}/crosschain/v1/user-position/${pool.poolIndex}/${pool.chainId}/${user}`,
  );
  return position;
}

export async function getPoolApr(context: Context, pool: Pool): Promise<number> {
  const aprData = await context.axios.get(`${BASE_API_URL}/farming/v1/apr`);

  let apr = null;
  for (let j = 0; j < aprData.data.length; j++) {
    const item = aprData.data[j];
    for (let i = 0; i < item.pools.length; i++) {
      if (item.pools[i].chainId === pool.chainId) {
        apr = item.pools[i].apr;
        break;
      }
    }
    if (apr) {
      break;
    }
  }
  return apr || 0;
}
