import assert from "assert";
import { executeAddressDriverReadMethod } from "&/drips/common/drivers/address-driver.js";
import { get } from "&/drips/common/store/mock.js";
import { OxString } from "&/drips/common/types.js";

export default async function getOwnAccountId() {
  const { signer } = await get();
  assert(signer, `'getOwnAccountId' requires a signer but it's missing.`);

  return (
    await executeAddressDriverReadMethod({
      functionName: "calcAccountId",
      args: [signer.address as OxString],
    })
  ).toString();
}
