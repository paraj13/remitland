// ============================================================
// Currency Redux Slice
// Manages currently selected currency. Persisted via redux-persist.
// ============================================================

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CurrencyCode } from "@/types";

interface CurrencyState {
  selected: CurrencyCode;
}

const initialState: CurrencyState = {
  // USD is the default selected currency per requirements
  selected: "USD",
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setSelectedCurrency(state, action: PayloadAction<CurrencyCode>) {
      state.selected = action.payload;
    },
  },
});

export const { setSelectedCurrency } = currencySlice.actions;
export default currencySlice.reducer;
