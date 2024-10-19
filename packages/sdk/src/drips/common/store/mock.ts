import { mockWalletStore } from "&/drips/common/wallet/mock.js";

class WalletSingleton {
  private constructor(
    private result: Awaited<
      ReturnType<Awaited<ReturnType<typeof mockWalletStore>>["initialize"]>
    >,
  ) {}

  static async create() {
    const mock = mockWalletStore();
    return new WalletSingleton(await mock.initialize());
  }

  get() {
    return this.result;
  }
}

async function* getWallet() {
  const singleton = await WalletSingleton.create();

  while (true) {
    yield singleton.get();
  }
}

const generator = getWallet();

// TODO: Replicate different store elements
export const get = async () => {
  const { value } = await generator.next();
  if (!value) {
    throw new Error("No value");
  }

  return value;
};
