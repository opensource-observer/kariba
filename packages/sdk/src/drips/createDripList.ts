import assert from "node:assert";
import type { State } from "&/drips/common/types.js";

export const createContinuousSupportDripList = async (state: State) => {
  assert(
    state.selectedSupportOption === 1,
    "Only `continuous` mode is supported",
  );
};
