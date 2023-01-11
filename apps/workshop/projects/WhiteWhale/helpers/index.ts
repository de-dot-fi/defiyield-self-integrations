import { Context, FetchTokenDetailsContext } from '@defiyield/sandbox';

export const factory = 'juno14m9rd2trjytvxvu4ldmqvru50ffxsafs8kequmfky7jh97uyqrxqs5xrnx';

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
}

interface IPairResponse {
  data: IPair;
}

export async function getContracts({ axios, endpoint }: Context) {
  const message: Record<string, any> = { pairs: {} };
  const segment = getMessageUrl(factory, message);

  const url = new URL(segment, endpoint).toString();
  const { data } = await axios.get<IPairsResponse>(url);

  return data.data.pairs.map((pair) => pair.contract_addr);
}

export async function getContractUnderlying({
  axios,
  endpoint,
  address,
}: FetchTokenDetailsContext) {
  const message: Record<string, any> = { pair: {} };
  const segment = getMessageUrl(address, message);

  const url = new URL(segment, endpoint).toString();
  const { data } = await axios.get<IPairResponse>(url);

  return [
    data.data.asset_infos[0].native_token?.denom || data.data.asset_infos[0].token?.contract_addr,
    data.data.asset_infos[1].native_token?.denom || data.data.asset_infos[1].token?.contract_addr,
  ];
}

export function getMessageUrl(contract: string, message: Record<string, any>) {
  const enocodedQuery = Buffer.from(JSON.stringify(message)).toString('base64');
  return `/cosmwasm/wasm/v1/contract/${contract}/smart/${enocodedQuery}`;
}
