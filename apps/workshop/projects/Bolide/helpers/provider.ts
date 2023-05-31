export const ENDPOINT_API = 'https://bolide.fi/api/v1/vaults/list';

export const getVaultList = async (
  axios: any,
  logger: any,
  chainId: number,
): Promise<any | null> => {
  try {
    const response = await axios.get(ENDPOINT_API);

    if (response.data) {
      return response.data.vaults.filter((vault: any) => vault.chainId === chainId);
    }
  } catch (ex) {
    logger.error(`Call to ${ENDPOINT_API} failed`, ex);
  }
  return null;
};
