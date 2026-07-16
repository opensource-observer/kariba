import { ContractTransaction } from "ethers";
import { populateAddressDriverWriteTx } from "../sdk/address-driver.js";
import { MetadataKeyValue, OxString, StreamConfig } from "../types.js";
import { streamConfigToUint256 } from "../utils/stream-config.js";
import contractConstants from "../utils/contract-constants.js";
import { formatStreamReceivers } from "../utils/format-stream-receivers.js";

type NewStreamFlowPayload = {
  tokenAddress: OxString;
  currentReceivers: { accountId: bigint; config: StreamConfig }[];
  newReceivers: { accountId: bigint; config: StreamConfig }[];
  balanceDelta: bigint;
  transferToAddress: OxString;
  accountMetadata: MetadataKeyValue[];
};

export default async function populateNewStreamFlowTxs(
  payload: NewStreamFlowPayload,
): Promise<ContractTransaction[]> {
  const {
    accountMetadata,
    tokenAddress,
    newReceivers,
    balanceDelta,
    currentReceivers,
    transferToAddress,
  } = payload;
  if (
    currentReceivers.length > contractConstants.MAX_DRIPS_RECEIVERS ||
    newReceivers.length > contractConstants.MAX_DRIPS_RECEIVERS
  ) {
    throw new Error(
      `Too many receivers. Max allowed is ${contractConstants.MAX_DRIPS_RECEIVERS}.`,
    );
  }

  const setStreamsTx = await populateAddressDriverWriteTx({
    functionName: "setStreams",
    args: [
      tokenAddress,
      formatStreamReceivers(
        currentReceivers.map((receiver) => ({
          accountId: receiver.accountId,
          config: streamConfigToUint256(receiver.config),
        })),
      ),
      balanceDelta,
      formatStreamReceivers(
        newReceivers.map((receiver) => ({
          accountId: receiver.accountId,
          config: streamConfigToUint256(receiver.config),
        })),
      ),
      0,
      0,
      transferToAddress,
    ],
  });

  const emitAccountMetadataTx = await populateAddressDriverWriteTx({
    functionName: "emitAccountMetadata",
    args: [accountMetadata],
  });
  return [setStreamsTx, emitAccountMetadataTx];
}
