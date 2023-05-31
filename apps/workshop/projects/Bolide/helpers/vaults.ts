import { SupportedChain } from '../../../../sandbox/src/types/module';

const CHAINS: Partial<Record<SupportedChain, any>> = {
  binance: {
    id: 56,
    BLID_ADDRESS: '0x766afcf83fd5eaf884b3d529b432ca27a6d84617',
    MASTER_CHEF_ADDRESS: '0x3782C47E62b13d579fe748946AEf7142B45B2cf7',
    LP_BLID_USDT_ADDRESS: '0x12C35ed2405bc70721584594723351bf5Db6235C',
  },

  polygon: {
    id: 137,
    BLID_ADDRESS: '0x4b27Cd6E6a5E83d236eAD376D256Fe2F9e9f0d2E',
  },
};

export const getChainInfo = (chainName: SupportedChain) => {
  return CHAINS[chainName];
};
