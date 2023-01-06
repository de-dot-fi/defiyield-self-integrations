import { Address, BaseAddress, RewardAddress } from '@emurgo/cardano-serialization-lib-nodejs';

export function getStakeAddress(address: string): string | null {
  try {
    const addr = Address.from_bech32(address);
    const baseAddress = BaseAddress.from_address(addr);
    if (!baseAddress) {
      return null;
    }

    const stakeCredentials = baseAddress.stake_cred();

    const rewardAddressBytes = new Uint8Array(29);
    rewardAddressBytes.set([0xe1], 0);
    rewardAddressBytes.set(stakeCredentials.to_bytes().slice(4, 32), 1);
    const stakeAddress = RewardAddress.from_address(Address.from_bytes(rewardAddressBytes));

    if (!stakeAddress) {
      return null;
    }

    return stakeAddress.to_address().to_bech32();
  } catch {
    return null;
  }
}
