import { AnyVersion, LatestVersion } from "@efstajas/versioned-parser";
import { gql } from "graphql-request";
import { executeNftDriverWriteMethod } from "&/drips/common/drivers/nft-driver.js";
import network from "&/drips/common/wallet/network.js";
import MetadataManagerBase from "&/drips/common/managers/MetadataManager.js";
import { nftDriverAccountMetadataParser } from "&/drips/common/schemas/index.js";
import query from "&/drips/common/graphql/dripQL.js";

export default class NftDriverMetadataManager extends MetadataManagerBase<
  typeof nftDriverAccountMetadataParser
> {
  constructor(nftDriver?: typeof executeNftDriverWriteMethod) {
    super(nftDriverAccountMetadataParser, nftDriver);
  }

  public async fetchMetadataHashByAccountId(
    accountId: string,
  ): Promise<string | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await query<any, any>(
      gql`
        query LatestDripListMetadataHash(
          $accountId: ID!
          $chain: SupportedChain!
        ) {
          dripList(id: $accountId, chain: $chain) {
            latestMetadataIpfsHash
          }
        }
      `,
      { accountId, chain: network.gqlName },
    );

    return res.dripList?.latestMetadataIpfsHash ?? null;
  }

  public buildAccountMetadata(context: {
    forAccountId: string;
    projects: LatestVersion<typeof nftDriverAccountMetadataParser>["projects"];
    name?: string;
    description?: string;
    latestVotingRoundId?: string;
  }): LatestVersion<typeof nftDriverAccountMetadataParser> {
    const { forAccountId, projects, name, description, latestVotingRoundId } =
      context;

    return {
      driver: "nft",
      describes: {
        driver: "nft",
        accountId: forAccountId,
      },
      isDripList: true,
      projects,
      name,
      description,
      latestVotingRoundId,
    };
  }

  public upgradeAccountMetadata(
    currentMetadata: AnyVersion<typeof nftDriverAccountMetadataParser>,
  ): LatestVersion<typeof nftDriverAccountMetadataParser> {
    const result = currentMetadata;

    type Projects = AnyVersion<
      typeof nftDriverAccountMetadataParser
    >["projects"][number];

    const upgradeSplit = (split: Projects) => {
      if ("type" in split) return split;

      if ("source" in split) {
        return {
          type: "repoDriver" as const,
          ...split,
        };
      } else {
        return {
          type: "address" as const,
          ...split,
        };
      }
    };

    result.projects = result.projects.map(upgradeSplit);

    const parsed = nftDriverAccountMetadataParser.parseLatest(result);

    return parsed;
  }
}
