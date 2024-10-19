import { z } from "zod";
import { nftDriverAccountMetadataSchemaV3 } from "&/drips/common/schemas/nft-driver/v3.js";

export const nftDriverAccountMetadataSchemaV4 =
  nftDriverAccountMetadataSchemaV3.extend({
    latestVotingRoundId: z.string().optional(),
  });
