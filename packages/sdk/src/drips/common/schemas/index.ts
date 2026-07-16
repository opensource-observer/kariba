import { createVersionedParser } from "@efstajas/versioned-parser";
import { addressDriverAccountMetadataSchemaV1 } from "&/drips/common/schemas/address-driver/v1.js";
import { nftDriverAccountMetadataSchemaV1 } from "&/drips/common/schemas/nft-driver/v1.js";
import { nftDriverAccountMetadataSchemaV2 } from "&/drips/common/schemas/nft-driver/v2.js";
import { nftDriverAccountMetadataSchemaV3 } from "&/drips/common/schemas/nft-driver/v3.js";
import { repoDriverAccountMetadataSchemaV1 } from "&/drips/common/schemas/repo-driver/v1.js";
import { repoDriverAccountMetadataSchemaV2 } from "&/drips/common/schemas/repo-driver/v2.js";
import { repoDriverAccountMetadataSchemaV3 } from "&/drips/common/schemas/repo-driver/v3.js";
import { repoDriverAccountMetadataSchemaV4 } from "&/drips/common/schemas/repo-driver/v4.js";
import { nftDriverAccountMetadataSchemaV4 } from "&/drips/common/schemas/nft-driver/v4.js";

export const nftDriverAccountMetadataParser = createVersionedParser([
  nftDriverAccountMetadataSchemaV4.parse,
  nftDriverAccountMetadataSchemaV3.parse,
  nftDriverAccountMetadataSchemaV2.parse,
  nftDriverAccountMetadataSchemaV1.parse,
]);

export const addressDriverAccountMetadataParser = createVersionedParser([
  addressDriverAccountMetadataSchemaV1.parse,
]);

export const repoDriverAccountMetadataParser = createVersionedParser([
  repoDriverAccountMetadataSchemaV4.parse,
  repoDriverAccountMetadataSchemaV3.parse,
  repoDriverAccountMetadataSchemaV2.parse,
  repoDriverAccountMetadataSchemaV1.parse,
]);
