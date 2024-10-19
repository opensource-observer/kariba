import { Signer, toBigInt } from "ethers";
import { OxString } from "../types.js";
import getOwnAccountId from "./get-own-account-id.js";
import keyValueToMetatada from "./key-value-to-metadata.js";
import { gql } from "graphql-request";
import query from "../graphql/dripQL.js";
import { addressDriverAccountMetadataParser } from "../schemas/index.js";
import network from "../wallet/network.js";
import filterCurrentChainData from "./filter-current-chain-data.js";
import randomBigintUntilUnique from "./random-big-until.js";
import {
  streamConfigFromUint256,
  streamConfigToUint256,
} from "./stream-config.js";
import { pin } from "./ipfs.js";
import populateNewStreamFlowTxs from "../drivers/populate-create-new-stream-flow-txs.js";
import extractAddressFromAccountId from "./extract-address-from-account.js";
import { extractDriverNameFromAccountId } from "./extract-driver-id.js";
import makeStreamId from "./make-stream.js";

type NewStreamOptions = {
  tokenAddress: string;
  amountPerSecond: bigint;
  recipientAccountId: string;
  name: string | undefined;
  startAt?: Date;
  durationSeconds?: number;
};

const METADATA_PARSER = addressDriverAccountMetadataParser;
const USER_METADATA_KEY = "ipfs";

export async function _getCurrentStreamsAndReceivers(
  accountId: string,
  tokenAddress: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentStreamsQueryRes = await query<any, any>(
    gql`
      query CurrentStreams($userAccountId: ID!, $chains: [SupportedChain!]) {
        userById(accountId: $userAccountId, chains: $chains) {
          chainData {
            chain
            streams {
              outgoing {
                id
                name
                isPaused
                config {
                  raw
                  amountPerSecond {
                    tokenAddress
                  }
                  dripId
                  amountPerSecond {
                    amount
                  }
                  durationSeconds
                  startDate
                }
                receiver {
                  ... on User {
                    account {
                      accountId
                    }
                  }
                  ... on DripList {
                    account {
                      accountId
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      userAccountId: accountId,
      chains: [network.gqlName],
    },
  );

  const chainData = filterCurrentChainData(
    currentStreamsQueryRes.userById.chainData,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as any;

  const { outgoing: currentStreams } = chainData.streams;

  const currentReceivers = currentStreams
    .filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (stream: any) =>
        stream.config.amountPerSecond.tokenAddress.toLowerCase() ===
        tokenAddress.toLowerCase(),
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((stream: any) => !stream.isPaused)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((stream: any) => ({
      accountId: stream.receiver.account.accountId,
      config: stream.config.raw,
    }));

  return {
    currentStreams,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentReceivers: currentReceivers.map((r: any) => ({
      accountId: toBigInt(r.accountId),
      config: toBigInt(r.config),
    })),
  };
}

export async function buildStreamCreateBatchTx(
  signer: Signer,
  streamOptions: NewStreamOptions,
  topUpAmount?: bigint,
) {
  const ownAccountId = await getOwnAccountId();

  const { currentStreams, currentReceivers } =
    await _getCurrentStreamsAndReceivers(
      ownAccountId,
      streamOptions.tokenAddress,
    );

  const newStreamDripId = randomBigintUntilUnique(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentReceivers.map((r: any) => streamConfigFromUint256(r.config).dripId),
    4,
  );

  const {
    startAt: scheduleStartAt,
    durationSeconds: scheduleDurationSeconds,
    amountPerSecond: amountPerSec,
  } = streamOptions;

  const newStreamConfig = streamConfigToUint256({
    dripId: newStreamDripId,
    start: BigInt(scheduleStartAt?.getTime() ?? 0) / 1000n,
    duration: BigInt(scheduleDurationSeconds ?? 0),
    amountPerSec,
  });

  const newMetadata = _buildMetadata(currentStreams, ownAccountId, {
    ...streamOptions,
    dripId: newStreamDripId,
  });

  const newHash = await pin(newMetadata);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentRec = currentReceivers.map((r: any) => ({
    accountId: r.accountId,
    config: streamConfigFromUint256(r.config),
  }));

  return {
    newHash,
    batch: await populateNewStreamFlowTxs({
      tokenAddress: streamOptions.tokenAddress as OxString,
      currentReceivers: currentRec,
      newReceivers: [
        ...currentRec,
        {
          config: streamConfigFromUint256(newStreamConfig),
          accountId: toBigInt(streamOptions.recipientAccountId),
        },
      ],
      accountMetadata: [
        keyValueToMetatada({
          key: USER_METADATA_KEY,
          value: newHash,
        }),
      ],
      balanceDelta: topUpAmount ?? 0n,
      transferToAddress: extractAddressFromAccountId(ownAccountId),
    }),
  };
}

function _buildMetadata(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  streams: any[],
  accountId: string,
  newStream?: NewStreamOptions & { dripId: bigint },
) {
  const streamsByTokenAddress = streams.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (acc: any, stream: any) => ({
      ...acc,
      [stream.config.amountPerSecond.tokenAddress.toLowerCase()]: [
        ...(acc[stream.config.amountPerSecond.tokenAddress.toLowerCase()] ??
          []),
        stream,
      ],
    }),
    {},
  );

  const newStreamsByTokenAddress = newStream
    ? {
        ...streamsByTokenAddress,
        [newStream.tokenAddress.toLowerCase()]: [
          ...(streamsByTokenAddress[newStream.tokenAddress.toLowerCase()] ??
            []),
          {
            id: makeStreamId(
              accountId,
              newStream.tokenAddress,
              newStream.dripId.toString(),
            ),
            name: newStream.name,
            config: {
              raw: streamConfigToUint256({
                dripId: newStream.dripId,
                start: BigInt(newStream.startAt?.getTime() ?? 0) / 1000n,
                duration: BigInt(newStream.durationSeconds ?? 0),
                amountPerSec: newStream.amountPerSecond,
              }).toString(),
              dripId: newStream.dripId.toString(),
              amountPerSecond: {
                amount: newStream.amountPerSecond.toString(),
              },
              durationSeconds: newStream.durationSeconds,
              startDate:
                newStream.startAt?.toISOString() ?? new Date().toISOString(),
            },
            receiver: {
              account: {
                accountId: newStream.recipientAccountId,
              },
            },
          },
        ],
      }
    : streamsByTokenAddress;

  // Parsing with the latest parser version to ensure we never write any invalid metadata.
  return METADATA_PARSER.parseLatest({
    describes: {
      driver: "address",
      accountId,
    },
    assetConfigs: Object.entries(newStreamsByTokenAddress).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ([tokenAddress, streams]: [string, any]) => {
        return {
          tokenAddress,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          streams: streams.map((stream: any) => {
            const recipientDriver = extractDriverNameFromAccountId(
              stream.receiver.account.accountId,
            );

            let supportedDriver: "address" | "nft" | "repo";

            if (["address", "nft", "repo"].includes(recipientDriver)) {
              supportedDriver = recipientDriver as "address" | "nft" | "repo";
            } else {
              throw new Error(
                `Unsupported recipient driver: ${recipientDriver}`,
              );
            }

            return {
              id: stream.id,
              initialDripsConfig: {
                raw: stream.config.raw,
                dripId: stream.config.dripId,
                amountPerSecond: BigInt(stream.config.amountPerSecond.amount),
                durationSeconds: stream.config.durationSeconds || 0,
                startTimestamp:
                  new Date(stream.config.startDate).getTime() / 1000,
              },
              receiver: {
                driver: supportedDriver,
                accountId: stream.receiver.account.accountId,
              },
              archived: false,
              name: stream.name ?? undefined,
            };
          }),
        };
      },
    ),
    timestamp: Math.floor(new Date().getTime() / 1000),
    writtenByAddress: extractAddressFromAccountId(accountId),
  });
}
