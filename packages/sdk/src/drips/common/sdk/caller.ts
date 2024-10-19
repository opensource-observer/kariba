import { type CallerAbi, callerAbi } from "&/drips/common/sdk/caller-abi.js";
import {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "abitype";
import assert from "assert";
import { Contract, ContractTransaction } from "ethers";
import { get } from "&/drips/common/store/mock.js";
import txToSafeDripsTx from "../utils/tx-to-safe-drips.js";
import network from "../wallet/network.js";

export async function populateCallerWriteTx<
  functionName extends ExtractAbiFunctionNames<
    CallerAbi,
    "nonpayable" | "payable"
  >,
  abiFunction extends AbiFunction = ExtractAbiFunction<CallerAbi, functionName>,
>(config: {
  functionName:
    | functionName
    | ExtractAbiFunctionNames<CallerAbi, "nonpayable" | "payable">;
  args: AbiParametersToPrimitiveTypes<abiFunction["inputs"], "inputs">;
}): Promise<ContractTransaction> {
  const { signer } = await get();
  assert(signer, "Caller contract call requires a signer but it is missing.");

  const { functionName: func, args } = config;

  const caller = new Contract(network.contracts.CALLER, callerAbi, signer);

  return txToSafeDripsTx(await caller[func].populateTransaction(...args));
}
