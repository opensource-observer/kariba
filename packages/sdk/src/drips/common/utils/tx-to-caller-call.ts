import { type ContractTransaction, toBigInt } from "ethers";
import type { CallerCall, OxString } from "&/drips/common/types.js";

export default function txToCallerCall(tx: ContractTransaction): CallerCall {
  return {
    target: tx.to as OxString,
    data: tx.data as OxString,
    value: toBigInt(tx.value ?? 0),
  };
}
