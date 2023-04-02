export type DataResponse<T = never> = { data: T };

export type PairsResponse = DataResponse<{ pairs: Pair[] }>;
export type ContractInfoResponse = DataResponse<Pair>;
export type PairResponse = DataResponse<PoolInfo>;

export type Pair = {
  asset_infos: (NativeTokenAssetInfo | TokenAssetInfo)[];
  contract_addr: string;
  liquidity_token: string;
};

export type PoolInfo = {
  assets: {
    info: NativeTokenAssetInfo | TokenAssetInfo;
    amount: string;
  }[];
  total_share: string;
};

export type TokenAssetInfo = { token: { contract_addr: string } };
export type NativeTokenAssetInfo = { native_token: { denom: string } };
export type CoinHallResponse = { pairs: { pairAddress: string; apr7d: number }[] };
