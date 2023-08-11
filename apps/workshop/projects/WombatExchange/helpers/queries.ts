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
