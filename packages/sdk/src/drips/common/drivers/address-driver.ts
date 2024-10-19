import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "abitype";
import { Contract } from "ethers";
import { UnwrappedEthersResult } from "&/drips/common/types.js";
import network from "&/drips/common/wallet/network.js";
import {
  AddressDriverAbi,
  addressDriverAbi,
} from "&/drips/common/drivers/address-driver-abi.js";
import { get } from "&/drips/common/store/mock.js";
import unwrapEthersResult from "&/drips/common/utils/unwrap-ether-result.js";

export async function executeAddressDriverReadMethod<
  functionName extends ExtractAbiFunctionNames<
    AddressDriverAbi,
    "pure" | "view"
  >,
  abiFunction extends AbiFunction = ExtractAbiFunction<
    AddressDriverAbi,
    functionName
  >,
>(config: {
  functionName:
    | functionName
    | ExtractAbiFunctionNames<AddressDriverAbi, "pure" | "view">;
  args: AbiParametersToPrimitiveTypes<abiFunction["inputs"], "inputs">;
}): Promise<
  UnwrappedEthersResult<
    AbiParametersToPrimitiveTypes<abiFunction["outputs"], "outputs">
  >
> {
  const { provider } = await get();
  const { functionName: func, args } = config;

  const addressDriver = new Contract(
    network.contracts.ADDRESS_DRIVER,
    addressDriverAbi,
    provider,
  );

  return unwrapEthersResult(await addressDriver[func](...args));
}
