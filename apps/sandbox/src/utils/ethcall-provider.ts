import { Provider as EthcallProvider } from 'ethcall';
import { Multicall, getMulticall, getMulticall2, getMulticall3 } from 'ethcall/lib/multicall';
import { providers } from 'ethers';
import { NetworkId } from './network';

export class Provider extends EthcallProvider {
  async init(provider: providers.JsonRpcProvider): Promise<void> {
    this.provider = provider;
    const network = await provider.getNetwork();

    this.multicall = getMulticall(network.chainId);
    this.multicall2 = getMulticall2(network.chainId);
    this.multicall3 = this.getMulticall3(network.chainId);
  }

  private getMulticall3(networkId: number): Multicall {
    const MULTICALL_3_ADDRESS = '0xca11bde05977b3631167028862be2a173976ca11';
    const ZK_SYNC_ERA_MULTICALL_3_ADDRESS = '0xf6c80f1645c22e30abb02389515c5ac88586681e';

    const addressMap3: Record<number, Multicall> = {
      [NetworkId.kava_evm]: {
        address: MULTICALL_3_ADDRESS,
        block: 3661165,
      },
      [NetworkId.zksync_era]: {
        address: ZK_SYNC_ERA_MULTICALL_3_ADDRESS,
        block: 1951111,
      },
      [NetworkId.near]: {
        address: MULTICALL_3_ADDRESS,
        block: 62907816,
      },
      [NetworkId.boba]: {
        address: MULTICALL_3_ADDRESS,
        block: 446859,
      },
      [NetworkId.fuse]: {
        address: MULTICALL_3_ADDRESS,
        block: 16146628,
      },
      [NetworkId.heco]: {
        address: MULTICALL_3_ADDRESS,
        block: 14413501,
      },
      [NetworkId.iotex]: {
        address: MULTICALL_3_ADDRESS,
        block: 22163670,
      },
      [NetworkId.klay]: {
        address: MULTICALL_3_ADDRESS,
        block: 96002415,
      },
      [NetworkId.kcc]: {
        address: MULTICALL_3_ADDRESS,
        block: 11760430,
      },
      [NetworkId.milk_c]: {
        address: MULTICALL_3_ADDRESS,
        block: 4377424,
      },
      [NetworkId.metis]: {
        address: MULTICALL_3_ADDRESS,
        block: 2338552,
      },
      [NetworkId.okex]: {
        address: MULTICALL_3_ADDRESS,
        block: 10364792,
      },
      [NetworkId.cro]: {
        address: MULTICALL_3_ADDRESS,
        block: 1963112,
      },
    };
    const internalResult = getMulticall3(networkId);

    return addressMap3[networkId] || internalResult;
  }
}
