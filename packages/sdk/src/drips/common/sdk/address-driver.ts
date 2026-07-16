import { executeErc20ReadMethod } from "&/drips/common/sdk/erc20.js";
import assert from "assert";
import { get } from "&/drips/common/store/mock.js";
import { OxString } from "&/drips/common/types.js";
import network from "&/drips/common/wallet/network.js";
import {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "abitype";
import { Contract, ContractTransaction } from "ethers";
import {
  AddressDriverAbi,
  addressDriverAbi,
} from "../drivers/address-driver-abi.js";
import txToSafeDripsTx from "../utils/tx-to-safe-drips.js";

export async function populateAddressDriverWriteTx<
  functionName extends ExtractAbiFunctionNames<
    AddressDriverAbi,
    "nonpayable" | "payable"
  >,
  abiFunction extends AbiFunction = ExtractAbiFunction<
    AddressDriverAbi,
    functionName
  >,
>(config: {
  functionName:
    | functionName
    | ExtractAbiFunctionNames<AddressDriverAbi, "nonpayable" | "payable">;
  args: AbiParametersToPrimitiveTypes<abiFunction["inputs"], "inputs">;
}): Promise<ContractTransaction> {
  const { signer } = await get();
  assert(
    signer,
    "Address driver contract call requires a signer but it is missing.",
  );

  const { functionName: func, args } = config;

  const addressDriver = new Contract(
    network.contracts.ADDRESS_DRIVER,
    addressDriverAbi,
    signer,
  );

  return txToSafeDripsTx(
    await addressDriver[func].populateTransaction(...args),
  );
}

export async function getAddressDriverAllowance(
  token: OxString,
): Promise<bigint> {
  const owner = (await get()).signer?.address as OxString;
  assert(owner, "ERC20 contract call requires a signer but it is missing.");

  const spender = network.contracts.ADDRESS_DRIVER as OxString;

  return executeErc20ReadMethod({
    token,
    functionName: "allowance",
    args: [owner, spender],
  });
}
