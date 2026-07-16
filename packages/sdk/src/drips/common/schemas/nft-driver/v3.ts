import { z } from "zod";
import { nftDriverAccountMetadataSchemaV2 } from "&/drips/common/schemas/nft-driver/v2.js";

export const nftDriverAccountMetadataSchemaV3 =
  nftDriverAccountMetadataSchemaV2.extend({
    description: z.string().optional(),
  });
