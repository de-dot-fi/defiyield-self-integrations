const ENDPOINT_API = 'https://bolide.fi/api/';

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

export const getApy = async (axios: any): Promise<AprInfo | null> => {
  try {
    const response = await axios.get(`${ENDPOINT_API}/apy`);

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error(error);
  }

  return null;
};

export const getTvl = async (axios: any): Promise<TvlInfo | null> => {
  try {
    const response = await axios.get(`${ENDPOINT_API}/tvl`);

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error(error);
  }

  return null;
};
