import type {
  AbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
  ExtractAbiFunctionNames,
} from "abitype";
import {
  type NftDriverAbi,
  nftDriverAbi,
} from "&/drips/common/drivers/nft-driver-abi.js";
import type { UnwrappedEthersResult } from "&/drips/common/types.js";
import { get } from "&/drips/common/store/mock.js";
import { Contract, ContractTransaction, TransactionResponse } from "ethers";
import network from "&/drips/common/wallet/network.js";
import unwrapEthersResult from "&/drips/common/utils/unwrap-ether-result.js";
import assert from "node:assert";
import txToSafeDripsTx from "&/drips/common/utils/tx-to-safe-drips.js";

export async function executeNftDriverReadMethod<
  functionName extends ExtractAbiFunctionNames<NftDriverAbi, "pure" | "view">,
  abiFunction extends AbiFunction = ExtractAbiFunction<
    NftDriverAbi,
    functionName
  >,
>(config: {
  functionName:
    | functionName
    | ExtractAbiFunctionNames<NftDriverAbi, "pure" | "view">;
  args: AbiParametersToPrimitiveTypes<abiFunction["inputs"], "inputs">;
}): Promise<
  UnwrappedEthersResult<
    AbiParametersToPrimitiveTypes<abiFunction["outputs"], "outputs">
  >
> {
  const { provider } = await get();
  const { functionName: func, args } = config;

  const nftDriver = new Contract(
    network.contracts.NFT_DRIVER,
    nftDriverAbi,
    provider,
  );

  return unwrapEthersResult(await nftDriver[func](...args));
}

export async function executeNftDriverWriteMethod<
  functionName extends ExtractAbiFunctionNames<
    NftDriverAbi,
    "nonpayable" | "payable"
  >,
  abiFunction extends AbiFunction = ExtractAbiFunction<
    NftDriverAbi,
    functionName
  >,
>(config: {
  functionName:
    | functionName
    | ExtractAbiFunctionNames<NftDriverAbi, "nonpayable" | "payable">;
  args: AbiParametersToPrimitiveTypes<abiFunction["inputs"], "inputs">;
}): Promise<TransactionResponse> {
  const { signer } = await get();
  assert(
    signer,
    "NFT Driver contract call requires a signer but it is missing.",
  );

  const { functionName: func, args } = config;

  const nftDriver = new Contract(
    network.contracts.NFT_DRIVER,
    nftDriverAbi,
    signer,
  );

  return nftDriver[func](...args);
}

export async function populateNftDriverWriteTx<
  functionName extends ExtractAbiFunctionNames<
    NftDriverAbi,
    "nonpayable" | "payable"
  >,
  abiFunction extends AbiFunction = ExtractAbiFunction<
    NftDriverAbi,
    functionName
  >,
>(config: {
  functionName:
    | functionName
    | ExtractAbiFunctionNames<NftDriverAbi, "nonpayable" | "payable">;
  args: AbiParametersToPrimitiveTypes<abiFunction["inputs"], "inputs">;
}): Promise<ContractTransaction> {
  const { signer } = await get();
  assert(
    signer,
    "NFT Driver contract call requires a signer but it is missing.",
  );

  const { functionName: func, args } = config;

  const nftDriver = new Contract(
    network.contracts.NFT_DRIVER,
    nftDriverAbi,
    signer,
  );

  return txToSafeDripsTx(await nftDriver[func].populateTransaction(...args));
}
