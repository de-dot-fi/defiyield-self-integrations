import { ethers } from 'ethers';
import * as ethcall from 'ethcall';
import { Provider } from './utils/ethcall-provider';
import { SupportedChain } from './types/module';
import { createMap } from './utils/createMap';
import { ChainProvider, ProviderMap } from './types/provider';
import config from '../config';
import logger from './utils/logger';
import * as cardano from './utils/cardano';
export { ethers } from 'ethers';
import * as BufferLayout from './utils/solana';
import * as solanaWeb3 from '@solana/web3.js';
import { TezosToolkit } from '@taquito/taquito';

async function createProviders(rpc: string, chain: SupportedChain): Promise<ChainProvider | void> {
  try {
    const ethersProvider = new ethers.providers.JsonRpcProvider(rpc);

    const ethcallProvider = new Provider();
    await ethcallProvider.init(ethersProvider);

    return {
      chain: chain,
      solana: null as any,
      cardano: null as any,
      endpoint: null as any,
      taquito: null as any,
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
    taquito: null as any,
    solana: null as any,
    endpoint: null as any,
    ethers: null as any,
    ethcall: null as any,
    provider: null as any,
    ethcallProvider: null as any,
  };
}

function createCosmosProviders(endpoint: string, chain: SupportedChain): ChainProvider {
  return {
    chain: chain,
    endpoint: endpoint,
    cardano: null as any,
    taquito: null as any,
    solana: null as any,
    ethers: null as any,
    ethcall: null as any,
    provider: null as any,
    ethcallProvider: null as any,
  };
}

function createSolanaProviders(endpoint: string, chain: SupportedChain): ChainProvider {
  return {
    chain: chain,
    endpoint: endpoint,
    solana: {
      BufferLayout: BufferLayout,
      web3: solanaWeb3,
    },
    taquito: null as any,
    cardano: null as any,
    ethers: null as any,
    ethcall: null as any,
    provider: null as any,
    ethcallProvider: null as any,
  };
}

function createTezosProviders(endpoint: string, chain: SupportedChain): ChainProvider {
  const taquito = new TezosToolkit(endpoint);
  return {
    chain: chain,
    taquito: taquito,
    cardano: null as any,
    solana: null as any,
    endpoint: null as any,
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
    kavaEvm,
    klaytn,
    kucoin,
    metis,
    milkomeda,
    moonbeam,
    moonriver,
    okx,
    optimism,
    polygon,
    zksyncEra,
    cardano,
    cosmos,
    juno,
    kava,
    osmosis,
    secret,
    thor,
    sifchain,
    stargaze,
    akash,
    kujira,
    evmos,
    crescent,
    agoric,
    terra2,
    solana,
    tezos,
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
    createProviders(config.rpcs['kava-evm'], 'kava-evm'),
    createProviders(config.rpcs.klaytn, 'klaytn'),
    createProviders(config.rpcs.kucoin, 'kucoin'),
    createProviders(config.rpcs.metis, 'metis'),
    createProviders(config.rpcs.milkomeda, 'milkomeda'),
    createProviders(config.rpcs.moonbeam, 'moonbeam'),
    createProviders(config.rpcs.moonriver, 'moonriver'),
    createProviders(config.rpcs.okx, 'okx'),
    createProviders(config.rpcs.optimism, 'optimism'),
    createProviders(config.rpcs.polygon, 'polygon'),
    createProviders(config.rpcs.zksync_era, 'zksync_era'),
    createCardanoProviders('cardano'),
    createCosmosProviders(config.rpcs.cosmos, 'cosmos'),
    createCosmosProviders(config.rpcs.juno, 'juno'),
    createCosmosProviders(config.rpcs.kava, 'kava'),
    createCosmosProviders(config.rpcs.osmosis, 'osmosis'),
    createCosmosProviders(config.rpcs.secret, 'secret'),
    createCosmosProviders(config.rpcs.thor, 'thor'),
    createCosmosProviders(config.rpcs.sifchain, 'sifchain'),
    createCosmosProviders(config.rpcs.stargaze, 'stargaze'),
    createCosmosProviders(config.rpcs.akash, 'akash'),
    createCosmosProviders(config.rpcs.kujira, 'kujira'),
    createCosmosProviders(config.rpcs.evmos, 'evmos'),
    createCosmosProviders(config.rpcs.crescent, 'crescent'),
    createCosmosProviders(config.rpcs.agoric, 'agoric'),
    createCosmosProviders(config.rpcs['terra-2'], 'terra-2'),
    createSolanaProviders(config.rpcs.solana, 'solana'),
    createTezosProviders(config.rpcs.tezos, 'tezos'),
  ]);

  const providerOptions: Record<SupportedChain, ChainProvider | void> = {
    'kava-evm': kavaEvm,
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
    klaytn,
    kucoin,
    metis,
    milkomeda,
    moonbeam,
    moonriver,
    okx,
    optimism,
    polygon,
    cardano,
    cosmos,
    juno,
    kava,
    osmosis,
    secret,
    thor,
    sifchain,
    stargaze,
    akash,
    kujira,
    evmos,
    crescent,
    agoric,
    'terra-2': terra2,
    solana,
    tezos,
    zksync_era: zksyncEra,
  };

  return createMap(providerOptions) as ProviderMap;
}
