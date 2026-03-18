// ============================================================
// Dashboard Page (Appendix 2)
// Displays:
//   - Account Balance card (with currency breakdown)
//   - Quick Conversion widget
//   - Transactions table (clicking any row opens ReceiverModal)
// Non-functional UI — only the transaction click is wired up.
// ============================================================

"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openReceiverModal } from "@/store/slices/uiSlice";
import { MOCK_RECEIVER, MOCK_RECEIVERS, ACCOUNT_BALANCE } from "@/data/mockData";
import { Transaction } from "@/types";
import {
  ArrowUpRight,
  SlidersHorizontal,
  Maximize2,
  ArrowLeftRight,
  ChevronDown,
} from "lucide-react";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector((state) => state.transactions.items);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  /**
   * Opens the ReceiverModal when a transaction row is clicked.
   * Finds the receiver for the transaction's "to" field.
   */
  function handleTransactionClick(tx: Transaction) {
    const receiver =
      MOCK_RECEIVERS.find((r) => r.name === tx.to) ?? MOCK_RECEIVER;
    dispatch(openReceiverModal(receiver));
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-white p-4 sm:p-8">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-10">
          {/* ---- Top Row: Balance + Quick Conversion ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Account Balance Card */}
            <div className="bg-white rounded-[1.5rem] p-10 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-2">
              <div className="flex items-start justify-between mb-8">
                <h2 className="text-[39px] font-bold text-gray-900 leading-[1.1] tracking-tight">
                  Account
                  <br />
                  Balance
                </h2>
                <button className="flex items-center gap-1.5 text-base font-bold text-blue-600 hover:opacity-80 transition-opacity">
                  Add Money
                  <ArrowUpRight size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-bold text-gray-300 leading-none">
                  Overall (in USD)
                </p>
                <p className="text-3xl font-bold text-gray-900 leading-none">
                  {ACCOUNT_BALANCE.totalUsd}
                </p>
              </div>

              <div className="w-full h-[1px] bg-gray-100 mb-8" />

              {/* Currency breakdown */}
              <div className="flex flex-col gap-5 mb-8">
                {ACCOUNT_BALANCE.currencies.map((c: any) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between text-base"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={`https://flagcdn.com/w40/${c.countryCode}.png`}
                        alt={c.name}
                        className="flag-circle"
                      />
                      <span className="font-bold text-gray-400 w-10">{c.code}</span>
                    </div>
                    <span className="font-bold text-gray-400">{c.balance}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <button className="flex items-center gap-2 text-base font-medium text-gray-900 hover:opacity-70 transition-opacity">
                  Show More
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </div>

            {/* Quick Conversion Widget */}
            <div className="bg-white rounded-[1.5rem] p-8 border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-6">
              <h2 className="text-xl font-bold text-gray-900">Quick Conversion</h2>

              <div className="flex flex-col gap-3">
                {/* From */}
                <div className="flex items-center justify-between px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-[10px] font-bold text-gray-600 uppercase">
                        {paymentMethod} 
                      </span>
                      <ChevronDown size={10} className="text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400">To Pay</span>
                  </div>
                  <div className="dropdown-select border-0">
                    <img
                      src="https://flagcdn.com/w40/us.png"
                      alt="USD"
                      className="flag-circle-sm"
                    />
                    <span className="text-[11px] font-bold">USD</span>
                    <span className="text-[10px] text-gray-300">▾</span>
                  </div>
                </div>

                {/* Swap icon */}
                <div className="flex justify-center -my-1 relative z-10">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center">
                    <ArrowLeftRight size={16} className="text-gray-400" />
                  </div>
                </div>

                {/* To */}
                <div className="flex items-center justify-between px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100  rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-[10px] font-bold text-gray-600 uppercase">
                        Cash 
                      </span>
                      <ChevronDown size={10} className="text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400">To Receive</span>
                  </div>
                  <div className="dropdown-select border-0">
                    <img
                      src="https://flagcdn.com/w40/eu.png"
                      alt="EUR"
                      className="flag-circle-sm"
                    />
                    <span className="text-[11px] font-bold">EUR</span>
                    <span className="text-[10px] text-gray-300">▾</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-[1.5px] bg-gray-50" />

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs font-semibold text-gray-400">
                  <span>Rate</span>
                  <span className="text-gray-900">1 USD = 0.98 EUR</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-gray-400">
                  <span>Fee</span>
                  <span className="text-gray-900">$0</span>
                </div>
              </div>

              <button className="w-full py-2 bg-white border border-gray-200 shadow-sm rounded-full text-base font-bold text-gray-900 hover:bg-gray-50 transition-colors mt-4">
                Proceed
              </button>
            </div>
          </div>

          {/* ---- Transactions Table Section ---- */}
          <div className="flex flex-col gap-6">
            {/* Table Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Transactions</h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100/50 rounded-full text-[13px] font-bold text-gray-500">
                  Export as
                  <span className="text-[10px] opacity-30">▾</span>
                </button>
                <div className="w-10 h-10 bg-gray-100/50 flex items-center justify-center rounded-full text-gray-400">
                  <SlidersHorizontal size={18} />
                </div>
                <div className="w-10 h-10 bg-gray-100/50 flex items-center justify-center rounded-full text-gray-400">
                  <Maximize2 size={18} />
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <TransactionTable 
                transactions={transactions} 
                variant="dashboard" 
                onRowClick={handleTransactionClick}
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
