import { Context, LoggerInterface } from '../../../../sandbox/src/types/module';

export const ENDPOINT_API = 'https://bolide.fi/api/v1/vaults/list';

export interface TokenInfo {
  address: string;

  name: string;

  tvl: number;
}

export interface VaultInfo {
  name: string;

  address: string;

  chainId: number;

  tvl: number;

  apy: number;

  tokens: TokenInfo[];
}

export const getVaultList = async (
  axios: Context['axios'],
  logger: LoggerInterface,
  chainId: number,
): Promise<VaultInfo[]> => {
  try {
    const response = await axios.get(ENDPOINT_API);

    if (response.data) {
      return response.data.vaults.filter((vault: VaultInfo) => vault.chainId === chainId);
    }
  } catch (ex) {
    logger.error(ex);
  }
  return [];
};
