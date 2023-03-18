export const ENDPOINT_API = 'https://bolide.fi/api';

export interface AprInfo {
  stakingApy: string;

  farmingApy: string;

  strategiesApy: Array<{
    storageAddress: string;

    apy: number;
  }>;
}

export interface TvlInfo {
  stakingTvl: string;

  farmingTvl: string;

  strategiesTvl: Array<{
    storageAddress: string;

    tokensTvl: Record<string, { tvl: number }>;
  }>;
}

export const getApy = async (axios: any, logger: any): Promise<AprInfo | null> => {
  const url = `${ENDPOINT_API}/apy`;
  try {
    const response = await axios.get(url);

    if (response.data) {
      return response.data;
    }
  } catch (ex) {
    logger.error(`Call to ${url} failed`, ex);
  }
  return null;
};

export const getTvl = async (axios: any, logger: any): Promise<TvlInfo | null> => {
  const url = `${ENDPOINT_API}/tvl`;
  try {
    const response = await axios.get(url);

    if (response.data) {
      return response.data;
    }
  } catch (ex) {
    logger.error(`Call to ${url} failed`, ex);
  }
  return null;
};
