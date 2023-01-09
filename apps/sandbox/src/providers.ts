import { ethers } from 'ethers';
import * as ethcall from 'ethcall';
import { SupportedChain } from './types/module';
import { createMap } from './utils/createMap';
import { ChainProvider, ProviderMap } from './types/provider';
import config from '../config';
import logger from './utils/logger';
import * as cardano from './utils/cardano';

async function createProviders(rpc: string, chain: SupportedChain): Promise<ChainProvider | void> {
  try {
    const ethersProvider = new ethers.providers.JsonRpcProvider(rpc);

    const ethcallProvider = new ethcall.Provider();
    await ethcallProvider.init(ethersProvider);

    return {
      chain: chain,
      cardano: null as any,
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

function createCardanoProviders(chain: SupportedChain): ChainProvider {
  return {
    chain: chain,
    cardano: cardano,
    ethers: null as any,
    ethcall: null as any,
    provider: null as any,
    ethcallProvider: null as any,
  };
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
    milkomeda,
    moonbeam,
    moonriver,
    okx,
    optimism,
    polygon,
  ] = await Promise.all([
    createProviders(config.rpcs.arbitrum, 'arbitrum'),
    createProviders(config.rpcs.aurora, 'aurora'),
    createProviders(config.rpcs.avalanche, 'avalanche'),
    createProviders(config.rpcs.binance, 'binance'),
    createProviders(config.rpcs.boba, 'boba'),
    createProviders(config.rpcs.celo, 'celo'),
    createProviders(config.rpcs.cronos, 'cronos'),
    createProviders(config.rpcs.ethereum, 'ethereum'),
    createProviders(config.rpcs.fantom, 'fantom'),
    createProviders(config.rpcs.fuse, 'fuse'),
    createProviders(config.rpcs.gnosis, 'gnosis'),
    createProviders(config.rpcs.harmony, 'harmony'),
    createProviders(config.rpcs.heco, 'heco'),
    createProviders(config.rpcs.iotex, 'iotex'),
    createProviders(config.rpcs.kava, 'kava'),
    createProviders(config.rpcs.klaytn, 'klaytn'),
    createProviders(config.rpcs.kucoin, 'kucoin'),
    createProviders(config.rpcs.metis, 'metis'),
    createProviders(config.rpcs.milkomeda, 'milkomeda'),
    createProviders(config.rpcs.moonbeam, 'moonbeam'),
    createProviders(config.rpcs.moonriver, 'moonriver'),
    createProviders(config.rpcs.okx, 'okx'),
    createProviders(config.rpcs.optimism, 'optimism'),
    createProviders(config.rpcs.polygon, 'polygon'),
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
    milkomeda,
    moonbeam,
    moonriver,
    okx,
    optimism,
    polygon,
    cardano: createCardanoProviders('cardano'),
  };

  return createMap(providerOptions) as ProviderMap;
}
