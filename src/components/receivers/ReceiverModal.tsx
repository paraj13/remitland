// ============================================================
// ReceiverModal Component (Appendix 1 popup)
// Displays receiver details with:
//   - Currency account tabs derived from transaction history
//   - Receiver info (country, bank, branch, SWIFT/BIC)
//   - "Transactions With [Name]" section with full TransactionTable
//   - Search and live filtering
// ============================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Globe,
  Building2,
  GitBranch,
  Code2,
  ChevronUp,
  Search,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeReceiverModal } from "@/store/slices/uiSlice";
import { setSelectedCurrency } from "@/store/slices/currencySlice";
import { fetchModalTransactions, fetchTransactions } from "@/store/slices/transactionSlice";
import { CurrencyCode } from "@/types";
import { getSocket } from "@/lib/socket";

export function ReceiverModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isReceiverModalOpen);
  const receiver = useAppSelector((state) => state.ui.activeReceiver);
  const selectedCurrency = useAppSelector((state) => state.currency.selected);
  const { modalItems, modalLoading } = useAppSelector((state) => state.transactions);
  const [showMore, setShowMore] = useState(false);

  // Search and toggle state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [onlyActionNeeded, setOnlyActionNeeded] = useState(false);

  // 1. On mount/open, fetch ALL transactions for this receiver to find available currencies
  useEffect(() => {
    if (isOpen && receiver) {
      // Clear search when opening a new receiver
      setSearchQuery("");
      setIsSearchOpen(true);
      // Fetch all for this receiver
      dispatch(fetchModalTransactions()); 
    }

    // WebSocket listener for real-time updates when modal is open
    const s = getSocket();
    if (s) {
      s.emit("join", "transactions");
      s.on("transactions", (data: any) => {
        if (isOpen && receiver) {
          console.log("Modal real-time update received:", data);
          // Re-fetch both dashboard and modal data to be safe
          dispatch(fetchTransactions());
          dispatch(fetchModalTransactions(selectedCurrency || undefined));
        }
      });
    }

    return () => {
      const s = getSocket();
      if (s) {
        s.off("transactions");
        s.emit("leave", "transactions");
      }
    };
  }, [isOpen, receiver, dispatch, selectedCurrency]);

  // 2. Derive unique currencies and keep them stable
  const [stableCurrencies, setStableCurrencies] = useState<any[]>([]);
  const [lastReceiverId, setLastReceiverId] = useState<number | null>(null);

  useEffect(() => {
    if (receiver && modalItems.length > 0 && receiver.id !== lastReceiverId) {
      // Get unique currency codes from all transactions (no name matching as requested)
      const uniqueCodes = Array.from(new Set(modalItems.map((t) => t.currency)));
      
      const mapped = uniqueCodes.map(code => {
        const firstMatch = modalItems.find(t => t.currency === code);
        const countryMap: Record<string, string> = { 
          USD: "us", AED: "ae", CAD: "ca", EUR: "eu", GBP: "gb", INR: "in", USDT: "us" 
        };
        
        // Priority: Transaction account > Receiver account > N/A
        const accountNumber = firstMatch?.accountNumber || 
                              receiver.accounts?.find(a => a.currency === code)?.accountNumber || 
                              "N/A";

        return {
          code,
          accountNumber,
          countryCode: countryMap[code as string] || "us"
        };
      });
      
      setStableCurrencies(mapped);
      setLastReceiverId(receiver.id);
    }
  }, [modalItems, receiver, lastReceiverId]);

  if (!isOpen || !receiver) return null;

  function handleCurrencySelect(code: CurrencyCode | null) {
    // Cast to any to bypass strict type check if the action payload is slightly different
    dispatch(setSelectedCurrency(code as any));
    // Fetch filtered transactions from API
    // Passing undefined fetches all transactions for the modal context
    dispatch(fetchModalTransactions((code as string) || undefined));
  }

  function handleClose() {
    dispatch(closeReceiverModal());
  }

  function downloadSampleFile() {
    const link = document.createElement("a");
    link.href = "/sample.docx";
    link.download = "remitland-transaction-report.docx";
    link.click();
  }

  // Final display items
  const baseItems = (modalItems.length > 0) ? modalItems : (receiver.transactions || []);
  
  const filteredModalTransactions = baseItems.filter(t => {
    if (!receiver) return false;
    
    // Match either SENDER or RECEIVER exactly against the clicked profile
    const rName = receiver.name.toLowerCase().trim();
    const isUserMatch = 
      t.from?.toLowerCase().trim() === rName || 
      t.to.toLowerCase().trim() === rName;

    const isCurrencyMatch = selectedCurrency ? t.currency === selectedCurrency : true;
    return isUserMatch && isCurrencyMatch;
  });

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
        className="modal-content scrollbar-thin relative bg-white max-h-[90vh] overflow-y-auto rounded-[2rem] w-[95%] max-w-[1000px]"
      >
        <button
          onClick={handleClose}
          className="sticky top-8 float-right mr-8 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-[60] bg-white shadow-sm"
          aria-label="Close receiver details"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-12">
          {/* ---- Header Section ---- */}
          <div className="mb-10 text-left">
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
            {/* "All" Tab */}
            <button
              onClick={() => handleCurrencySelect(null)}
              className={`flex items-center gap-2.5 p-1 rounded-xl border-2 transition-all ${
                selectedCurrency === null
                  ? "border-yellow-400 bg-yellow-50/20 shadow-sm"
                  : "border-gray-50 grayscale-0 hover:opacity-100"
              }`}
            >
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-full">
                <Globe size={14} className="text-gray-500" />
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">
                  All
                </span>
              </div>
            </button>

            {stableCurrencies.length > 0 ? (
              stableCurrencies.map((acc: any) => {
                const isSelected = selectedCurrency === acc.code;
                return (
                  <button
                    key={acc.code as string}
                    onClick={() => handleCurrencySelect(acc.code as any)}
                    className={`btn-sm flex items-center gap-2.5 px-2 py-1 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-yellow-400 bg-yellow-50/20 shadow-sm"
                        : "border-gray-50 grayscale-0 hover:opacity-100"
                    }`}
                  >
                    <span className="text-gray-900 font-bold text-sm tracking-tight">
                      {acc.accountNumber}
                    </span>
                    <div className="flex items-center gap-2 bg-gray-100 px-2.5 py-2 rounded-full">
                      <img
                        src={`https://flagcdn.com/w40/${acc.countryCode}.png`}
                        alt={acc.code as string}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span className="text-[10px] font-semibold text-gray-500 uppercase">
                        {acc.code as string}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : modalLoading ? (
              <div className="flex items-center gap-2 px-6 py-4">
                <div className="w-4 h-4 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                <span className="text-sm text-gray-400 italic">Loading...</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No associated currencies found in history</p>
            )}
          </div>

          {/* ---- Info Grid ---- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-20 mb-8 border-t border-gray-50 pt-10 text-left">
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
          <div className="flex flex-col gap-8 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-[22px] font-medium text-gray-900 tracking-tight">
                Transactions With <span className="font-bold">{receiver.name.split(" ")[0]}</span>
              </h3>

              <div className="flex items-center gap-4">
                {/* Search Integration */}
                <div className="flex items-center gap-2">
                  {isSearchOpen && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-xs font-medium focus:outline-none focus:border-blue-200 transition-all w-48"
                        autoFocus
                      />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-xs font-medium focus:outline-none focus:border-blue-200 transition-all cursor-pointer"
                      >
                        <option value="All">All Statuses</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  )}
                  <div 
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className={`w-10 h-10 border flex items-center justify-center rounded-full transition-colors cursor-pointer ${
                      isSearchOpen ? "bg-blue-50 border-blue-200 text-blue-500" : "border-gray-100 text-gray-300 hover:text-gray-500"
                    }`}
                  >
                    <Search size={18} />
                  </div>
                </div>

                {/* Download Icon */}
                <div 
                  onClick={downloadSampleFile}
                  className="w-10 h-10 border border-gray-100 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
                >
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

            <div className="relative min-h-[300px] flex flex-col">
              {modalLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-20 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                </div>
              )}
              <TransactionTable
                transactions={filteredModalTransactions}
                variant="modal"
                pageSize={5}
                externalSearchQuery={searchQuery}
                externalStatusFilter={statusFilter}
                externalOnlyActionNeeded={onlyActionNeeded}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
