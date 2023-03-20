import { Context, FetchPoolsContext, FetchUserPositionsContext } from '@defiyield/sandbox';

const coinHallEndpoint = 'https://api.coinhall.org/api/v1/pairs';

interface IPairsResponse {
  data: {
    pairs: IPair[];
  };
}

interface IPair {
  asset_infos: {
    native_token?: {
      denom: string;
    };
    token?: {
      contract_addr: string;
    };
  }[];
  contract_addr: string;
  liquidity_token: string;
}

interface IContractInfoResponse {
  data: IPair;
}

interface IPairResponse {
  data: {
    assets: {
      info: {
        native_token?: {
          denom: string;
        };
        token?: {
          contract_addr: string;
        };
      };
      amount: string;
    }[];
    total_share: string;
  };
}

interface ICoinHallResponse {
  pairs: {
    pairAddress: string;
    apr7d: number;
  }[];
}

const join = (...parts: string[]): string =>
  parts
    .join('/')
    .split('/')
    .filter(Boolean)
    .join('/')
    .replace(/(http(s?)):\//, '$1://');

export async function getContracts(contract: string, { axios, endpoint }: Context) {
  const message = { pairs: {} };
  const segment = getMessageUrl(contract, message);

  const url = join(endpoint, segment);
  const { data } = await axios.get<IPairsResponse>(url);

  return data.data.pairs.map((pair) => pair.contract_addr);
}

export async function getContractInfo(
  address: string,
  { axios, endpoint }: Pick<Context, 'axios' | 'endpoint'>,
) {
  const message = { pair: {} };
  const segment = getMessageUrl(address, message);

  const url = join(endpoint, segment);
  const { data } = await axios.get<IContractInfoResponse>(url);

  return data.data;
}

export async function getPoolInfo(
  address: string,
  { axios, endpoint }: Pick<Context, 'axios' | 'endpoint'>,
) {
  const message = { pool: {} };
  const segment = getMessageUrl(address, message);

  const url = join(endpoint, segment);
  const { data } = await axios.get<IPairResponse>(url);

  return data.data;
}

export async function getBalance(contract: string, ctx: FetchUserPositionsContext) {
  const message = { balance: { address: ctx.user } };
  const segment = getMessageUrl(contract, message);

  const url = join(ctx.endpoint, segment);
  const { data } = await ctx.axios.get(url);

  return Number(data.data.balance);
}

export async function tradingApr(ctx: FetchPoolsContext): Promise<Map<string, number>> {
  const pairs = ctx.tokens.map((token) => token.address);

  const { data } = await ctx.axios.get<ICoinHallResponse>(coinHallEndpoint, {
    params: { addresses: pairs.join(',') },
  });

  return new Map(data.pairs.map((pair) => [pair.pairAddress, pair.apr7d]));
}

export function getMessageUrl(contract: string, message: Record<string, any>) {
  const enocodedQuery = Buffer.from(JSON.stringify(message)).toString('base64');
  return `/cosmwasm/wasm/v1/contract/${contract}/smart/${enocodedQuery}`;
}
