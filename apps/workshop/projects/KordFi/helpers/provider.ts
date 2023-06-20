import { Context, LoggerInterface } from '@defiyield/sandbox';

const API_ENDPOINT = 'https://back-mainnet.kord.fi/v1/graphql';

export const getKordFiLendingVaultsInfoQuery = `
  query {
    contractInfo {
      xtzDeposit
      xtzDepositIndex
      xtzGrossCredit
      xtzGrossCreditIndex
      xtzDepositRate

      tzbtcDeposit
      tzbtcDepositIndex
      tzbtcGrossCredit
      tzbtcGrossCreditIndex
      tzbtcDepositRate
    }
  }
`;

export const getKordFiLendingUserInfoQuery = `
  query ($address: String) {
    userInfo(where: { address: { _eq: $address } }) {
      xtzDeposit
      xtzDepositIoDiff

      tzbtcDeposit
      tzbtcDepositIoDiff
    }
    contractInfo {
      xtzDepositIndex

      tzbtcDepositIndex
    }
  }
`;

export interface KordFiLendingVaultsInfo {
  contractInfo: {
    xtzDeposit: string;
    xtzDepositIndex: string;
    xtzGrossCredit: string;
    xtzGrossCreditIndex: string;
    xtzDepositRate: string;

    tzbtcDeposit: string;
    tzbtcDepositIndex: string;
    tzbtcGrossCredit: string;
    tzbtcGrossCreditIndex: string;
    tzbtcDepositRate: string;
  }[];
}

export interface KordFiLendingUserInfo {
  userInfo: {
    xtzDeposit: string;
    xtzDepositIoDiff: string;

    tzbtcDeposit: string;
    tzbtcDepositIoDiff: string;
  }[];
  contractInfo: {
    xtzDepositIndex: string;

    tzbtcDepositIndex: string;
  }[];
}

export const makeKordFiApiRequest = async <T = any>(
  { axios, logger }: Context,
  query: string,
  variables: Record<string, any> = {},
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
