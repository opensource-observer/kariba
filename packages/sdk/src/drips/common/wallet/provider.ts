import { JsonRpcProvider, JsonRpcSigner } from "ethers";

const NETWORK = {
  chainId: 11155111,
  name: "sepolia",
};

export function getOptionalEnvVar(name: string): string | undefined {
  const env = process.env;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return name in env ? (env as any)[name] : undefined;
}

class MockProvider extends JsonRpcProvider {
  address = "0x433220a86126eFe2b8C98a723E73eBAd2D0CbaDc";

  setAddress(to: string) {
    this.address = to;
  }

  async request(request: { method: string; params?: unknown[] }) {
    if (request.method === "eth_requestAccounts") {
      return [this.address];
    }
    // eslint-disable-next-line no-console
    console.log("UNIMPLEMENTED METHOD", request);
  }

  override async getSigner(): Promise<JsonRpcSigner> {
    const tempProvider = new JsonRpcProvider(
      `http://${
        getOptionalEnvVar("PUBLIC_TESTNET_MOCK_PROVIDER_HOST") ?? "127.0.0.1"
      }:8545`,
      NETWORK,
      {
        staticNetwork: true,
      },
    );

    return await tempProvider.getSigner(this.address);
  }

  isWeb3 = true;
}

export default (address: string) => {
  const provider = new MockProvider(
    `http://${
      getOptionalEnvVar("PUBLIC_TESTNET_MOCK_PROVIDER_HOST") ?? "127.0.0.1"
    }:8545`,
    NETWORK,
    {
      staticNetwork: true,
    },
  );
  provider.setAddress(address);

  return provider;
};
