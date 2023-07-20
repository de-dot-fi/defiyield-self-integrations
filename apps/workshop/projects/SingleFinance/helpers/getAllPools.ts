import { Context } from '@defiyield/sandbox';
import { AVAILABLE_POOLS, mapToChainId, API_ENDPOINT } from '../helpers/constants';
import { PoolApiData, SFSupportedChain } from '../helpers/types';

export const getAllPools = async (axios: Context['axios'], chain: SFSupportedChain) => {
  const allPools: PoolApiData = (
    await axios.get(`${API_ENDPOINT}/vaults?chainid=${mapToChainId[chain]}`)
  ).data.data;
  return allPools.filter((pool) => {
    const symbol = pool.token.symbol;
    return AVAILABLE_POOLS[chain as SFSupportedChain].includes(symbol);
  });
};
