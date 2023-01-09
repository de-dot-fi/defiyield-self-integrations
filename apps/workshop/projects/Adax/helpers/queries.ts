import type { Context } from '@defiyield/sandbox';

interface IAccountAsset {
  stake_address: string;
  asset_list: {
    policy_id: string;
    asset_name: string;
    fingerprint: string;
    quantity: string;
  }[];
}

interface IPool {
  pool_name: string;
  pool_nft_name: string;
  pool_lp_amount: number;
  asset_a: IToken;
  asset_b: IToken;
}

interface IToken {
  ticker: string;
  name: string;
  symbol: string;
  amount: number;
  metadata: {
    metadata_decimals: number;
  };
}

export async function accountAssets(
  { axios }: Pick<Context, 'axios'>,
  stakeAddress: string,
): Promise<IAccountAsset | void> {
  const body = { ['_stake_addresses']: [stakeAddress] };
  const { data } = await axios.post('https://api.koios.rest/api/v0/account_assets', body);
  return data[0];
}

export async function getPools({ axios }: Pick<Context, 'axios'>): Promise<IPool[]> {
  const {
    data: { pools },
  } = await axios.post('https://amm-api.adax.pro', { endpoint: 'getPools' });

  return pools;
}
