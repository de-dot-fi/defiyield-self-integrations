import { Context, FetchPoolsContext, FetchUserPositionsContext } from '@defiyield/sandbox';
import { join } from '../../../common/utils/urls';
import { PairsResponse, ContractInfoResponse, PairResponse, CoinHallResponse } from './types';

const coinHallEndpoint = 'https://api.coinhall.org/api/v1/pairs';

export async function getContracts(contract: string, { axios, endpoint }: Context) {
  const message = { pairs: {} };
  const segment = getMessageUrl(contract, message);

  const url = join(endpoint, segment);
  const { data } = await axios.get<PairsResponse>(url);

  return data.data.pairs.map((pair) => pair.contract_addr);
}

export async function getContractInfo(
  address: string,
  { axios, endpoint }: Pick<Context, 'axios' | 'endpoint'>,
) {
  const message = { pair: {} };
  const segment = getMessageUrl(address, message);

  const url = join(endpoint, segment);
  const { data } = await axios.get<ContractInfoResponse>(url);

  return data.data;
}

export async function getPoolInfo(
  address: string,
  { axios, endpoint }: Pick<Context, 'axios' | 'endpoint'>,
) {
  const message = { pool: {} };
  const segment = getMessageUrl(address, message);

  const url = join(endpoint, segment);
  const { data } = await axios.get<PairResponse>(url);

  return data.data;
}

export async function getBalances(ctx: FetchUserPositionsContext) {
  const contracts = ctx.pools
    .map((pool) => [
      pool.supplied?.[0].token.address as string,
      pool.supplied?.[0].token.metadata?.contract as string,
    ])
    .filter((pool) => pool[0] && pool[1]);

  return await fetchBalances(ctx, contracts);
}

async function fetchBalances(ctx: FetchUserPositionsContext, contracts: string[][]) {
  const promises = contracts.map((contract) => {
    const message = { balance: { address: ctx.user } };
    const segment = getMessageUrl(contract[1], message);
    const url = join(ctx.endpoint, segment);
    return ctx.axios.get(url);
  });

  const responses = await Promise.allSettled(promises);

  return responses.reduce((acc, response, index) => {
    if (response.status === 'fulfilled') {
      const contract = contracts[index];
      acc.set(contract[0], Number(response.value.data.data.balance));
    }
    return acc;
  }, new Map<string, number>());
}

export async function tradingApr(ctx: FetchPoolsContext): Promise<Map<string, number>> {
  const pairs = ctx.tokens.map((token) => token.address);

  const { data } = await ctx.axios.get<CoinHallResponse>(coinHallEndpoint, {
    params: { addresses: pairs.join(',') },
  });

  return new Map(data.pairs.map((pair) => [pair.pairAddress, pair.apr7d]));
}

export function getMessageUrl(contract: string, message: Record<string, any>) {
  const enocodedQuery = Buffer.from(JSON.stringify(message)).toString('base64');
  return `/cosmwasm/wasm/v1/contract/${contract}/smart/${enocodedQuery}`;
}
