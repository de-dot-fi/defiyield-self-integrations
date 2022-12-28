import { createClient, gql } from '@urql/core';
import config from '../../config';
import { Address, Token } from '../types/module';

const client = createClient({
  url: config.graphql.endpoint,
  fetchOptions: () => {
    const { apiKey } = config.graphql;

    return {
      headers: { 'X-Api-Key': apiKey || '' },
    };
  },
});

const AssetUnderlyingFragment = gql`
  fragment AssetUnderlyingFragment on AssetUnderlying {
    address
    name
    symbol
    decimals
    icon
    displayName
    price
    chainId
  }
`;
const AssetFragment = gql`
  fragment AssetFragment on Asset {
    address
    name
    symbol
    decimals
    icon
    displayName
    price
    chainId
  }
`;

const NestedAssetFragment = gql`
  fragment NestedAssetFragment on Asset {
    ...AssetFragment
    underlying {
      ...AssetUnderlyingFragment
    }
  }
  ${AssetFragment}
  ${AssetUnderlyingFragment}
`;

const ASSETS_QUERY = gql`
  query FetchAssets($first: Int!, $skip: Int!, $chainId: Int, $addresses: [String!]) {
    assets(first: $first, skip: $skip, where: { chainId: $chainId, addresses: $addresses }) {
      ...NestedAssetFragment
    }
  }
  ${NestedAssetFragment}
`;

const ASSETS_CACHED_QUERY = gql`
  query FetchAssets($first: Int!, $skip: Int!, $chainId: Int, $addresses: [String!]) {
    assets: assetsCached(
      first: $first
      skip: $skip
      where: { chainId: $chainId, addresses: $addresses }
    ) {
      ...NestedAssetFragment
    }
  }
  ${NestedAssetFragment}
`;

export async function fetchTokens(
  assets: {
    address: Address;
    chainId: number;
  }[],
): Promise<Token[]> {
  if (!assets.length) {
    return [];
  }
  const chains = new Set<number>();
  const addresses = new Set<Address>();
  assets.forEach(({ address, chainId }) => {
    chains.add(chainId);
    addresses.add(address);
  });

  const query = config.graphql.apiKey ? ASSETS_QUERY : ASSETS_CACHED_QUERY;
  const variables = {
    first: 50,
    skip: 0,
    chainId: Array.from(chains).find((a) => a),
    addresses: Array.from(addresses),
  };

  // TODO: Pagination
  const response = await client.query<{ assets: Token[] }>(query, variables).toPromise();

  if (response?.data?.assets) {
    return response.data.assets;
  }

  throw response.error;
}
