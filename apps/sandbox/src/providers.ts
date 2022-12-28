import { ethers } from 'ethers';
import * as ethcall from 'ethcall';
import { SupportedChain } from './types/module';
import { createMap } from './utils/createMap';
import { ChainProvider, ProviderMap } from './types/provider';
import config from '../config';
import logger from './utils/logger';

async function createProviders(rpc: string): Promise<ChainProvider | void> {
  try {
    const ethersProvider = new ethers.providers.JsonRpcProvider(rpc);

    const ethcallProvider = new ethcall.Provider();
    await ethcallProvider.init(ethersProvider);

    return {
      ethers: ethers,
      ethcall: ethcall,
      provider: ethersProvider,
      ethcallProvider: ethcallProvider,
    };
  } catch {
    logger.warn(
      `RPC - Failed to connect to ${rpc} If this impacts your work, please update the RPC in your .env file`,
    );
  }
}

export async function initializeProviders(): Promise<ProviderMap> {
  const [
    arbitrum,
    aurora,
    avalanche,
    binance,
    boba,
    celo,
    cronos,
    ethereum,
    fantom,
    fuse,
    gnosis,
    harmony,
    heco,
    iotex,
    kava,
    klaytn,
    kucoin,
    metis,
    milkomedia,
    moonbeam,
    moonriver,
    okx,
    optimism,
    polygon,
  ] = await Promise.all([
    createProviders(config.rpcs.arbitrum),
    createProviders(config.rpcs.aurora),
    createProviders(config.rpcs.avalanche),
    createProviders(config.rpcs.binance),
    createProviders(config.rpcs.boba),
    createProviders(config.rpcs.celo),
    createProviders(config.rpcs.cronos),
    createProviders(config.rpcs.ethereum),
    createProviders(config.rpcs.fantom),
    createProviders(config.rpcs.fuse),
    createProviders(config.rpcs.gnosis),
    createProviders(config.rpcs.harmony),
    createProviders(config.rpcs.heco),
    createProviders(config.rpcs.iotex),
    createProviders(config.rpcs.kava),
    createProviders(config.rpcs.klaytn),
    createProviders(config.rpcs.kucoin),
    createProviders(config.rpcs.metis),
    createProviders(config.rpcs.milkomedia),
    createProviders(config.rpcs.moonbeam),
    createProviders(config.rpcs.moonriver),
    createProviders(config.rpcs.okx),
    createProviders(config.rpcs.optimism),
    createProviders(config.rpcs.polygon),
  ]);

  const providerOptions: Record<SupportedChain, ChainProvider | void> = {
    arbitrum,
    aurora,
    avalanche,
    binance,
    boba,
    celo,
    cronos,
    ethereum,
    fantom,
    fuse,
    gnosis,
    harmony,
    heco,
    iotex,
    kava,
    klaytn,
    kucoin,
    metis,
    milkomedia,
    moonbeam,
    moonriver,
    okx,
    optimism,
    polygon,
  };

  return createMap(providerOptions) as ProviderMap;
}
