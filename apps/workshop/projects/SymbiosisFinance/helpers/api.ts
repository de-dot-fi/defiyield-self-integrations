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
  const {
    data: { apr },
  } = await context.axios.get(`${BASE_API_URL}/crosschain/v1/pool-apr/${pool.chainId}`);
  return apr;
}
