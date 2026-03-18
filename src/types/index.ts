// ============================================================
// Global TypeScript Type Definitions
// ============================================================

export type CurrencyCode = "AED" | "USD" | "CAD" | "INR" | "EUR" | "USDT";

export type TransactionStatus =
  | "success"
  | "approved"
  | "Pending"
  | "Cancelled"
  | "Rejected"
  | "failed"
  | "Success"
  | "needs_action";

export type TransactionType =
  | "Send money"
  | "Add money"
  | "Conversion"
  | "Send Money International"
  | "Send Money Domestic";

export interface Currency {
  code: CurrencyCode;
  name: string;
  flag: string;
  countryCode: string;
  balance: string;
}

export interface AccountBalance {
  totalUsd: string;
  currencies: Currency[];
}

export interface Transaction {
  id: number;
  dateTime: string;
  requestId: string;
  type: TransactionType;
  to: string;
  currency: CurrencyCode;
  amount: string;
  status: TransactionStatus;
}

export interface ReceiverAccount {
  currency: CurrencyCode;
  accountNumber: string;
  flag: string;
  countryCode: string;
}

export interface Receiver {
  id: number;
  name: string;
  email: string;
  type: "Individual" | "Business";
  accounts: ReceiverAccount[];
  country: string;
  bankName: string;
  branchName: string;
  swiftBic: string;
  transactions: Transaction[];
}

export interface QuickConversion {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: string;
  fee: string;
}
