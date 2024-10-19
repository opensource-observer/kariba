export class AddItemError extends Error {
  constructor(
    message: string,
    public severity: "warning" | "error",
    public submessage?: string,
    public suberrors?: Array<AddItemSuberror>,
  ) {
    super(message);
  }
}

export class AddItemSuberror extends Error {
  constructor(
    message: string,
    public lineNumber: number,
  ) {
    super(message);
  }
}

type BaseItem = {
  rightComponent?: {
    component: never;
    props: Record<string, unknown>;
  };
};

type ProjectItem = BaseItem & {
  type: "project";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: any;
};

type DripListItem = BaseItem & {
  type: "drip-list";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dripList: any;
};

type EthAddressItem = BaseItem & {
  type: "address";
  address: string;
};

export type ListEditorItem = ProjectItem | DripListItem | EthAddressItem;

export type AccountId = string;

export type Weights = Record<AccountId, number>;
export type Items = Record<AccountId, ListEditorItem>;

export interface DripListConfig {
  items: Items;
  weights: Weights;
  title: string;
  description: string | undefined;
}

export interface State {
  dripList: DripListConfig;
  recipientErrors: Array<AddItemError>;
  /** 1 is immediate DL creation, 2 is creating a draft / voting round */
  selectedCreationMode: 1 | 2 | undefined;
  /** 1 is Continuous Support, 2 is one-time donation */
  selectedSupportOption: 1 | 2 | undefined;
  continuousSupportConfig: {
    listSelected: string[];
    streamRateValueParsed?: bigint | undefined;
    topUpAmountValueParsed?: bigint | undefined;
  };
  oneTimeDonationConfig: {
    selectedTokenAddress: string[] | undefined;
    amountInputValue: string;
    topUpMax: boolean;
    amount: bigint | undefined;
  };
  votingRoundConfig: {
    collaborators: Items;
    votingEnds: Date | undefined;
    areVotesPrivate: boolean;
    areRecipientsRestricted: boolean;
    allowedRecipients: Items;
  };
  newVotingRoundId: string | undefined;
  dripListId: string | undefined;
}

export type Address = string;
export type IpfsHash = string;

export type OxString = `0x${string}`;

export type MetadataKeyValue = {
  key: OxString;
  value: OxString;
};

export type UnwrappedEthersResult<T> = T extends [infer U]
  ? U
  : T extends readonly [infer U]
    ? U
    : T;

export type SplitsReceiver = {
  accountId: string;
  weight: number;
};

export type CallerCall = {
  target: OxString;
  data: OxString;
  value: bigint;
};

export type StreamConfig = {
  /** An arbitrary number used to identify a drip. When setting a config, it must be greater than or equal to `0`. It's a part of the configuration but the protocol doesn't use it. */
  dripId: bigint;

  /** The UNIX timestamp (in seconds) when dripping should start. When setting a config, it must be greater than or equal to `0`. If set to `0`, the contract will use the timestamp when drips are configured. */
  start: bigint;

  /** The duration (in seconds) of dripping. When setting a config, it must be greater than or equal to `0`. If set to `0`, the contract will drip until the balance runs out. */
  duration: bigint;

  /** The amount per second being dripped. When setting a config, it must be in the smallest unit (e.g., Wei), greater than `0` **and be multiplied by `10 ^ 9`** (`constants.AMT_PER_SEC_MULTIPLIER`). */
  amountPerSec: bigint;
};

export type StreamReceiver = {
  accountId: bigint;
  config: bigint;
};
