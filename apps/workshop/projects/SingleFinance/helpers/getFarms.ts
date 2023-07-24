import { Context } from '@defiyield/sandbox';
import { API_ENDPOINT, mapToChainId } from '../helpers/constants';
import { Farm, SFSupportedChain, SupportedDex } from '../helpers/types';

export const getFarms = async (
  axios: Context['axios'],
  chain: SFSupportedChain,
  dex: SupportedDex,
): Promise<Farm[]> => {
  return (await axios.get(`${API_ENDPOINT}/info/farms?dex=${dex}&chainid=${mapToChainId[chain]}`))
    .data.data.farms;
};
