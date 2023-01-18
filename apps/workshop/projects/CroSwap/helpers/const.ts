export const CROSWAP_SUBGRAPH_URL = 'https://graph.croswap.com/subgraphs/name/croswap/croswap-v1';
export const CRONOS_MULTICALL_2 = '0x5e954f5972EC6BFc7dECd75779F10d848230345F';
export const CROSWAP_TOKEN = '0x1Ba477CA252C0FF21c488d41759795E7E7812aB4';
export const CROSWAP_FARMS = '0x812d8983ead958512914713606e67022b965d738';

export const GQL_GET_TOKENS = `
  query getTokens {
    tokens {
      id
      tokenDayData(orderBy: date, orderDirection: desc, first: 1) {
        priceUSD
      }
      decimals
      totalSupply
    }
  }
`;
