import { encodeBytes32String, hexlify, toUtf8Bytes } from "ethers";
import type { MetadataKeyValue, OxString } from "&/drips/common/types.js";

export default function keyValueToMetatada({
  key,
  value,
}: {
  key: string;
  value: string;
}): MetadataKeyValue {
  return {
    key: encodeBytes32String(key) as OxString,
    value: hexlify(toUtf8Bytes(value)) as OxString,
  };
}
