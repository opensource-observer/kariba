import {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "abitype";
import { erc20Abi } from "abitype/abis";
import assert from "assert";
import { Contract, ContractTransaction } from "ethers";
import { get } from "&/drips/common/store/mock.js";
import { OxString, UnwrappedEthersResult } from "&/drips/common/types.js";
import txToSafeDripsTx from "&/drips/common/utils/tx-to-safe-drips.js";
import unwrapEthersResult from "&/drips/common/utils/unwrap-ether-result.js";
import network from "&/drips/common/wallet/network.js";

type Erc20Abi = typeof erc20Abi;

export async function executeErc20ReadMethod<
  functionName extends ExtractAbiFunctionNames<Erc20Abi, "pure" | "view">,
  abiFunction extends AbiFunction = ExtractAbiFunction<Erc20Abi, functionName>,
>(config: {
  token: OxString;
  functionName:
    | functionName
    | ExtractAbiFunctionNames<Erc20Abi, "pure" | "view">;
  args: AbiParametersToPrimitiveTypes<abiFunction["inputs"], "inputs">;
}): Promise<
  UnwrappedEthersResult<
    AbiParametersToPrimitiveTypes<abiFunction["outputs"], "outputs">
  >
> {
  const { provider } = await get();
  const { token, functionName: func, args } = config;

  const erc20 = new Contract(token, erc20Abi, provider);

  return unwrapEthersResult(await erc20[func](...args));
}

export async function getAddressDriverAllowance(token: OxString) {
  const signer = (await get()).signer?.address;
  assert(signer, "ERC20 contract call requires a signer but it is missing.");

  return executeErc20ReadMethod({
    token,
    functionName: "allowance",
    args: [signer as OxString, network.contracts.ADDRESS_DRIVER as OxString],
  });
}

export async function populateErc20WriteTx<
  functionName extends ExtractAbiFunctionNames<
    Erc20Abi,
    "nonpayable" | "payable"
  >,
  abiFunction extends AbiFunction = ExtractAbiFunction<Erc20Abi, functionName>,
>(config: {
  token: OxString;
  functionName:
    | functionName
    | ExtractAbiFunctionNames<Erc20Abi, "nonpayable" | "payable">;
  args: AbiParametersToPrimitiveTypes<abiFunction["inputs"], "inputs">;
}): Promise<ContractTransaction> {
  const { signer } = await get();
  assert(signer, "ERC20 contract call requires a signer but it is missing.");

  const { token, functionName: func, args } = config;

  const erc20 = new Contract(token, erc20Abi, signer);

  return txToSafeDripsTx(await erc20[func].populateTransaction(...args));
}
