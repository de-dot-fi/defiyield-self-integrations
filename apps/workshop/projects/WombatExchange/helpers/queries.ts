export const tokensQuery = `
    query  {
        tokens {
            price
            id
            name
            symbol
            decimals
        }
    }
`;

export const poolsQuery = `
    query {
      pools {
        id
        assets {
          id
          symbol
          poolAddress
          underlyingToken {
            id
            name
            decimals
            price
          }
          womBaseApr
          tvlUSD
        }
      }
    }
`;

export const assetsQuery = `
    query {
      assets {
        id
        symbol
        poolAddress
        underlyingToken {
          id
          name
          decimals
          price
        }
        womBaseApr
        tvlUSD
      }
    }
`;
