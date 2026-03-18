// ============================================================
// ReceiverModal Component (Appendix 1 popup)
// Displays receiver details with:
//   - Currency account tabs (AED / USD / CAD) — last selected persists in Redux
//   - Receiver info (country, bank, branch, SWIFT/BIC)
//   - "Transactions With [Name]" section with full TransactionTable
//   - Download CTA, Search, Only Action Needed toggle, Pagination
// ============================================================

"use client";

import { useState } from "react";
import {
  X,
  Globe,
  Building2,
  GitBranch,
  Code2,
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeReceiverModal } from "@/store/slices/uiSlice";
import { setSelectedCurrency } from "@/store/slices/currencySlice";
import { CurrencyCode } from "@/types";

export function ReceiverModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isReceiverModalOpen);
  const receiver = useAppSelector((state) => state.ui.activeReceiver);
  const selectedCurrency = useAppSelector((state) => state.currency.selected);
  const [showMore, setShowMore] = useState(false);

  // Lifting state for search and toggle to the header
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyActionNeeded, setOnlyActionNeeded] = useState(false);

  if (!isOpen || !receiver) return null;

  function handleCurrencySelect(code: CurrencyCode) {
    dispatch(setSelectedCurrency(code));
  }

  function handleClose() {
    dispatch(closeReceiverModal());
  }

  const currencyBgClass =
    selectedCurrency === "USD"
      ? "currency-selected-usd"
      : selectedCurrency === "AED"
        ? "currency-selected-aed"
        : "currency-selected-cad";

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receiver-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`modal-content scrollbar-thin relative ${currencyBgClass}`}
      >
        <button
          onClick={handleClose}
          className="absolute top-8 right-8 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close receiver details"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-12">
          {/* ---- Header Section ---- */}
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <h2
                id="receiver-modal-title"
                className="text-[40px] font-bold text-gray-900 leading-tight tracking-tight"
              >
                {receiver.name}
              </h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-500 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-widest">
                {receiver.type}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-400 mt-1">
              {receiver.email}
            </p>
          </div>

          {/* ---- Account Selector Tabs ---- */}
          <div className="flex flex-wrap gap-4 mb-12">
            {receiver.accounts.map((acc) => {
              const isSelected = selectedCurrency === acc.currency;
              return (
                <button
                  key={acc.currency}
                  onClick={() => handleCurrencySelect(acc.currency)}
                  className={`flex items-center gap-2.5 px-6 py-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-yellow-400 bg-yellow-50/20"
                      : "border-gray-50 bg-gray-50/50 grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
                  }`}
                >
                  <span className="text-gray-900 font-bold text-sm tracking-tight">
                    {acc.accountNumber}
                  </span>
                  <img
                    src={`https://flagcdn.com/w40/${acc.countryCode}.png`}
                    alt={acc.currency}
                    className="flag-circle-sm"
                  />
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {acc.currency}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ---- Info Grid ---- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-20 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2 opacity-30 text-gray-900">
                <Globe size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Country/Countries
                </p>
              </div>
              <p className="text-base font-bold text-gray-900 leading-tight">
                {receiver.country}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 opacity-30 text-gray-900">
                <Building2 size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Bank name
                </p>
              </div>
              <p className="text-base font-bold text-gray-900 leading-tight">
                {receiver.bankName}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 opacity-30 text-gray-900">
                <GitBranch size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Branch name
                </p>
              </div>
              <p className="text-base font-bold text-gray-900 leading-tight">
                {receiver.branchName}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 opacity-30 text-gray-900">
                <Code2 size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                  Swift/BIC code
                </p>
              </div>
              <p className="text-base font-bold text-gray-900 leading-tight">
                {receiver.swiftBic}
              </p>
            </div>
          </div>

          <div className="flex justify-center mb-12">
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-gray-500 transition-colors"
            >
              Show More
              {showMore ? <ChevronUp size={14} /> : <ArrowUpRight size={14} />}
            </button>
          </div>

          {/* ---- Transactions Section ---- */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[22px] font-bold text-gray-900 tracking-tight">
                Transactions With {receiver.name.split(" ")[0]}
              </h3>

              <div className="flex items-center gap-4">
                {/* Search Icon */}
                <div className="w-10 h-10 border border-gray-100 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                  <Search size={18} />
                </div>
                {/* Download Icon */}
                <div className="w-10 h-10 border border-gray-100 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                  <Download size={18} />
                </div>
                {/* Only Action Needed Toggle */}
                <div
                  className="flex items-center gap-3 cursor-pointer select-none"
                  onClick={() => setOnlyActionNeeded(!onlyActionNeeded)}
                >
                  <span className="text-xs font-bold text-gray-400 tracking-tight">
                    Only Action Needed
                  </span>
                  <label
                    className="toggle-switch"
                    aria-label="Show only action needed transactions"
                  >
                    <input
                      type="checkbox"
                      checked={onlyActionNeeded}
                      onChange={() => {}} // Controlled by parent div click
                    />
                    <span className="toggle-track" />
                  </label>
                </div>
              </div>
            </div>

            <TransactionTable
              transactions={receiver.transactions}
              variant="modal"
              externalSearchQuery={searchQuery}
              externalOnlyActionNeeded={onlyActionNeeded}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
