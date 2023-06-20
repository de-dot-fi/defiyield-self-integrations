import { Context } from '@defiyield/sandbox';

const API_ENDPOINT = 'https://back-mainnet.kord.fi/v1/graphql';

export const getKordFiLendingVaultsInfoQuery = `
  query {
    contractInfo {
      xtzDeposit
      xtzDepositIndex
      xtzGrossCredit
      xtzGrossCreditIndex
      xtzGrossCreditRate
      xtzDepositRate
      xtzLbShares

      tzbtcDeposit
      tzbtcDepositIndex
      tzbtcGrossCredit
      tzbtcGrossCreditIndex
      tzbtcGrossCreditRate
      tzbtcDepositRate
      tzbtcLbShares
    }
    externalInfo {
      lbApy
      xtzRate
      lbXtzRate

      lbTzbtcRate
      tzbtcRate
    }
  }
`;

export const getKordFiLendingUserInfoQuery = `
  query ($address: String) {
    userInfo(where: { address: { _eq: $address } }) {
      xtzDeposit
      xtzDepositIoDiff
      xtzGrossCredit
      xtzLbShares

      tzbtcDeposit
      tzbtcDepositIoDiff
      tzbtcGrossCredit
      tzbtcLbShares
    }
    contractInfo {
      xtzDepositIndex
      xtzGrossCreditIndex

      tzbtcDepositIndex
      tzbtcGrossCreditIndex
    }
    externalInfo {
      lbXtzRate

      xtzTzbtcRate
      lbTzbtcRate
    }
  }
`;

export interface KordFiLendingVaultsInfo {
  contractInfo: {
    xtzDeposit: string;
    xtzDepositIndex: string;
    xtzGrossCredit: string;
    xtzGrossCreditIndex: string;
    xtzGrossCreditRate: string;
    xtzDepositRate: string;
    xtzLbShares: string;

    tzbtcDeposit: string;
    tzbtcDepositIndex: string;
    tzbtcGrossCredit: string;
    tzbtcGrossCreditIndex: string;
    tzbtcGrossCreditRate: string;
    tzbtcDepositRate: string;
    tzbtcLbShares: string;
  }[];
  externalInfo: {
    lbApy: string;
    xtzRate: string;
    lbXtzRate: string;

    lbTzbtcRate: string;
    tzbtcRate: string;
  }[];
}

export interface KordFiLendingUserInfo {
  userInfo: {
    xtzDeposit: string;
    xtzGrossCredit: string;
    xtzDepositIoDiff: string;
    xtzLbShares: string;

    tzbtcDeposit: string;
    tzbtcGrossCredit: string;
    tzbtcDepositIoDiff: string;
    tzbtcLbShares: string;
  }[];
  contractInfo: {
    xtzGrossCreditIndex: string;
    xtzDepositIndex: string;
    tzbtcGrossCreditIndex: string;
    tzbtcDepositIndex: string;
  }[];
  externalInfo: {
    lbXtzRate: string;

    xtzTzbtcRate: string;
    lbTzbtcRate: string;
  }[];
}

export const makeKordFiApiRequest = async <T = unknown>(
  { axios, logger }: Context,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T | null> => {
  try {
    const response = await axios.post<{ data: T }>(API_ENDPOINT, { query, variables });

    if (response?.data?.data) {
      return response.data.data;
    }
  } catch (error) {
    logger.error(error);
  }

  return null;
};
