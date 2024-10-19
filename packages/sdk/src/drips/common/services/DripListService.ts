import {
  ContractTransaction,
  ethers,
  MaxUint256,
  type Signer,
  toBigInt,
} from "ethers";
import type {
  AccountId,
  Address,
  IpfsHash,
  Items,
  OxString,
  SplitsReceiver,
  Weights,
} from "&/drips/common/types.js";
import NftDriverMetadataManager from "&/drips/common/managers/NftDriverMetadataManager.js";
import { get } from "&/drips/common/store/mock.js";
import assert from "node:assert";
import {
  executeNftDriverReadMethod,
  executeNftDriverWriteMethod,
  populateNftDriverWriteTx,
} from "&/drips/common/drivers/nft-driver.js";
import { LatestVersion } from "@efstajas/versioned-parser";
import { gql } from "graphql-request";
import query from "&/drips/common/graphql/dripQL.js";
import MetadataManagerBase from "&/drips/common/managers/MetadataManager.js";
import { nftDriverAccountMetadataParser } from "&/drips/common/schemas/index.js";
import keyValueToMetatada from "&/drips/common/utils/key-value-to-metadata.js";
import network from "&/drips/common/wallet/network.js";
import { formatSplitReceivers } from "&/drips/common/utils/format-split-receivers.js";
import {
  getAddressDriverAllowance,
  populateAddressDriverWriteTx,
} from "&/drips/common/sdk/address-driver.js";
import { populateCallerWriteTx } from "../sdk/caller.js";
import { populateErc20WriteTx } from "../sdk/erc20.js";
import txToCallerCall from "../utils/tx-to-caller-call.js";
import { buildStreamCreateBatchTx } from "../utils/streams.js";

export class KDripListService {
  private readonly SEED_CONSTANT = "Drips App";
  private _owner!: Signer | undefined;
  private _ownerAddress!: Address | undefined;
  private _nftDriverMetadataManager!: NftDriverMetadataManager;

  private constructor() {}

  public static async new(): Promise<KDripListService> {
    const dripListService = new KDripListService();

    const { connected, signer } = await get();

    if (connected) {
      assert(signer, "Signer address is undefined.");
      dripListService._owner = signer;
      dripListService._ownerAddress = await signer.getAddress();

      dripListService._nftDriverMetadataManager = new NftDriverMetadataManager(
        executeNftDriverWriteMethod,
      );
    } else {
      dripListService._nftDriverMetadataManager =
        new NftDriverMetadataManager();
    }

    return dripListService;
  }

  public async buildTransactContext(config: {
    listTitle: string;
    listDescription?: string;
    weights: Weights;
    items: Items;
    support?:
      | {
          type: "continuous";
          tokenAddress: string;
          amountPerSec: bigint;
          topUpAmount: bigint;
        }
      | {
          type: "one-time";
          tokenAddress: string;
          donationAmount: bigint;
        };
    latestVotingRoundId?: string;
  }) {
    assert(
      this._ownerAddress,
      `This function requires an active wallet connection.`,
    );

    const {
      listTitle,
      listDescription,
      weights,
      items,
      support,
      latestVotingRoundId,
    } = config;

    const { projectsSplitMetadata, receivers } =
      await this.getProjectsSplitMetadataAndReceivers(weights, items);

    const mintedNftAccountsCountQuery = gql`
      query MintedNftAccountsCount(
        $ownerAddress: String!
        $chain: SupportedChain!
      ) {
        mintedTokensCountByOwnerAddress(
          ownerAddress: $ownerAddress
          chain: $chain
        ) {
          total
        }
      }
    `;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mintedNftAccountsCountRes = await query<any, any>(
      mintedNftAccountsCountQuery,
      {
        ownerAddress: this._ownerAddress,
        chain: network.gqlName,
      },
    );

    const salt = this._calcSaltFromAddress(
      this._ownerAddress,
      mintedNftAccountsCountRes.mintedTokensCountByOwnerAddress.total ?? 0,
    );

    const listId = (
      await executeNftDriverReadMethod({
        functionName: "calcTokenIdWithSalt",
        args: [this._ownerAddress as OxString, salt],
      })
    ).toString();

    const ipfsHash = await this._publishMetadataToIpfs(
      listId,
      projectsSplitMetadata,
      listTitle,
      listDescription,
      latestVotingRoundId,
    );

    const createDripListTx = await this._buildCreateDripListTx(salt, ipfsHash);

    const setDripListSplitsTx = await populateNftDriverWriteTx({
      functionName: "setSplits",
      args: [toBigInt(listId), formatSplitReceivers(receivers)],
    });

    let needsApprovalForToken: string | undefined;
    let txs: ContractTransaction[];

    if (support?.type !== "continuous") {
      throw new Error("Only continuous support is supported.");
    }

    const { tokenAddress, amountPerSec, topUpAmount } = support;

    const allowance = await getAddressDriverAllowance(tokenAddress as OxString);
    const needsApproval = allowance < topUpAmount;

    if (needsApproval) {
      needsApprovalForToken = tokenAddress;
    }

    const setStreamTx = await this._buildSetDripListStreamTxs(
      tokenAddress,
      listId,
      topUpAmount,
      amountPerSec,
    );

    txs = [createDripListTx, setDripListSplitsTx, ...setStreamTx.batch];

    const batch = await populateCallerWriteTx({
      functionName: "callBatched",
      args: [txs.map(txToCallerCall)],
    });

    return {
      txs: [
        ...(needsApprovalForToken
          ? [
              {
                title: `Approve Drips to withdraw ${needsApprovalForToken}`,
                transaction: await this._buildTokenApprovalTx(
                  needsApprovalForToken,
                ),
                waitingSignatureMessage: {
                  message: `Waiting for you to approve Drips access to the ERC-20 token in your wallet...`,
                  subtitle: "You only have to do this once per token.",
                },
                applyGasBuffer: false,
              },
            ]
          : []),
        {
          title: "Creating the Drip List",
          transaction: batch,
          applyGasBuffer: true,
        },
      ],
      dripListId: listId,
    };
  }

  public async getProjectsSplitMetadataAndReceivers(
    weights: Weights,
    items: Items,
  ) {
    const projectsInput = Object.entries(weights);

    const receivers: SplitsReceiver[] = [];

    const projectsSplitMetadata: ReturnType<
      typeof nftDriverAccountMetadataParser.parseLatest
    >["projects"] = [];

    for (const [accountId, weight] of projectsInput) {
      const item = items[accountId];
      if (weight <= 0) continue;

      switch (item.type) {
        case "address": {
          const receiver = {
            type: "address" as const,
            weight,
            accountId,
          };

          projectsSplitMetadata.push(receiver);
          receivers.push(receiver);

          break;
        }
        case "project": {
          const { forge, ownerName, repoName } = item.project.source;

          const receiver = {
            type: "repoDriver" as const,
            weight,
            accountId,
          };

          // projectsSplitMetadata.push({
          //   ...receiver,
          //   // TODO: implement GitProjectService
          //   source: GitProjectService.populateSource(
          //     forge,
          //     repoName,
          //     ownerName,
          //   ),
          // });

          receivers.push(receiver);

          break;
        }
        case "drip-list": {
          const receiver = {
            type: "dripList" as const,
            weight,
            accountId,
          };

          projectsSplitMetadata.push(receiver);
          receivers.push(receiver);

          break;
        }
      }
    }

    return {
      projectsSplitMetadata,
      receivers: receivers,
    };
  }

  private async _buildCreateDripListTx(salt: bigint, ipfsHash: IpfsHash) {
    assert(
      this._ownerAddress,
      `This function requires an active wallet connection.`,
    );

    const createDripListTx = await populateNftDriverWriteTx({
      functionName: "safeMintWithSalt",
      args: [
        salt,
        this._ownerAddress as OxString,
        [
          {
            key: MetadataManagerBase.USER_METADATA_KEY,
            value: ipfsHash,
          },
        ].map(keyValueToMetatada),
      ],
    });

    return createDripListTx;
  }

  private async _buildSetDripListStreamTxs(
    token: Address,
    dripListId: AccountId,
    topUpAmount: bigint,
    amountPerSec: bigint,
  ) {
    assert(this._owner, `This function requires an active wallet connection.`);

    return await buildStreamCreateBatchTx(
      this._owner,
      {
        tokenAddress: token,
        amountPerSecond: amountPerSec,
        recipientAccountId: dripListId,
        name: undefined,
      },
      topUpAmount,
    );
  }

  private async _buildTokenApprovalTx(
    token: Address,
  ): Promise<ContractTransaction> {
    assert(this._owner, `This function requires an active wallet connection.`);

    const tokenApprovalTx = await populateErc20WriteTx({
      token: token as OxString,
      functionName: "approve",
      args: [network.contracts.ADDRESS_DRIVER as OxString, MaxUint256],
    });

    return tokenApprovalTx;
  }

  private async _publishMetadataToIpfs(
    dripListId: string,
    projects: LatestVersion<typeof nftDriverAccountMetadataParser>["projects"],
    name?: string,
    description?: string,
    latestVotingRoundId?: string,
  ): Promise<IpfsHash> {
    assert(
      this._ownerAddress,
      `This function requires an active wallet connection.`,
    );

    const dripListMetadata =
      this._nftDriverMetadataManager.buildAccountMetadata({
        forAccountId: dripListId,
        projects,
        name,
        description,
        latestVotingRoundId,
      });

    const ipfsHash =
      await this._nftDriverMetadataManager.pinAccountMetadata(dripListMetadata);

    return ipfsHash;
  }

  // We use the count of *all* NFT sub-accounts to generate the salt for the Drip List ID.
  // This is because we want to avoid making HTTP requests to the subgraph for each NFT sub-account to check if it's a Drip List.
  private _calcSaltFromAddress = (
    address: string,
    listCount: number,
  ): bigint /* 64bit */ => {
    const hash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["string"],
        [this.SEED_CONSTANT + address],
      ),
    );
    const randomBigInt = ethers.toBigInt("0x" + hash.slice(26));

    let random64BitBigInt =
      BigInt(randomBigInt.toString()) & BigInt("0xFFFFFFFFFFFFFFFF");

    const listCountBigInt = BigInt(listCount);
    random64BitBigInt = random64BitBigInt ^ listCountBigInt;

    return random64BitBigInt;
  };
}
