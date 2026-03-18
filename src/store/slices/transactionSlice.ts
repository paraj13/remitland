// ============================================================
// Transaction Redux Slice
// Manages transaction list and real-time updates via Socket.IO.
// ============================================================

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Transaction } from "@/types";
import { MOCK_TRANSACTIONS } from "@/data/mockData";

interface TransactionState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  items: MOCK_TRANSACTIONS,
  loading: false,
  error: null,
};

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    /**
     * setTransactions — replaces the full list (e.g. after API fetch)
     */
    setTransactions(state, action: PayloadAction<Transaction[]>) {
      state.items = action.payload;
    },

    /**
     * upsertTransaction — used by Socket.IO to update a single transaction
     * in real-time. Inserts if new, updates if exists.
     */
    upsertTransaction(state, action: PayloadAction<Transaction>) {
      const index = state.items.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      } else {
        state.items.unshift(action.payload);
      }
    },

    /**
     * updateTransactionStatus — lightweight status-only update
     */
    updateTransactionStatus(
      state,
      action: PayloadAction<{ id: number; status: Transaction["status"] }>
    ) {
      const tx = state.items.find((t) => t.id === action.payload.id);
      if (tx) {
        tx.status = action.payload.status;
      }
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setTransactions,
  upsertTransaction,
  updateTransactionStatus,
  setLoading,
  setError,
} = transactionSlice.actions;

export default transactionSlice.reducer;
