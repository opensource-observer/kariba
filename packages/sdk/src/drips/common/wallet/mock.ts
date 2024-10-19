import testnetMockProvider from "&/drips/common/wallet/provider.js";
import type { BrowserProvider, JsonRpcProvider, JsonRpcSigner } from "ethers";
import FailoverJsonRpcProvider from "&/drips/common/wallet/FailOverProvider.js";
import { getNetwork, type Network } from "&/drips/common/wallet/network.js";
import type { OxString } from "&/drips/common/types.js";
import { executeAddressDriverReadMethod } from "&/drips/common/drivers/address-driver.js";

export interface ConnectedWalletStoreState {
  connected: true;
  address: string;
  dripsAccountId: string;
  provider: BrowserProvider | JsonRpcProvider | FailoverJsonRpcProvider;
  signer: JsonRpcSigner;
  network: Network;
}

export interface DisconnectedWalletStoreState {
  connected: false;
  network: Network;
  provider: BrowserProvider | JsonRpcProvider | FailoverJsonRpcProvider;
  dripsAccountId?: undefined;
  address?: undefined;
  signer?: undefined;
  safe?: never;
}

export type WalletStoreState =
  | ConnectedWalletStoreState
  | DisconnectedWalletStoreState;

// TODO: Implement real wallet store
export const mockWalletStore = () => {
  // TODO: Change this to a real address
  const address = "0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc";
  const provider = testnetMockProvider(address);

  async function initialize() {
    const signer = await provider.getSigner();

    const ownAccountId = (
      await executeAddressDriverReadMethod({
        functionName: "calcAccountId",
        args: [signer.address as OxString],
      })
    ).toString();

    const network = await provider.getNetwork();
    if (network.chainId) {
      throw new Error("Network chainId is not defined");
    }

    const chainId = Number(network.chainId);

    return {
      connected: true,
      address,
      provider,
      signer,
      network: getNetwork(chainId),
      dripsAccountId: ownAccountId,
    };
  }

  return { initialize };
};
