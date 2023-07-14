import { Context } from '@defiyield/sandbox';
import { mapToChainId, API_ENDPOINT } from '../helpers/constants';
import { SFSupportedChain, UserLendingBalance } from '../helpers/types';

export const getUserLending = async (
  axios: Context['axios'],
  chain: SFSupportedChain,
  owner: string,
): Promise<UserLendingBalance[]> => {
  return (await axios.get(`${API_ENDPOINT}/lending?owner=${owner}&chainid=${mapToChainId[chain]}`))
    .data.data;
};
