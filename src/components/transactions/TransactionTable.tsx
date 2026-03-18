// ============================================================
// TransactionTable Component
// Renders a list of transactions with status badges and action
// buttons. Used inside the ReceiverModal and Dashboard.
// ============================================================

"use client";

import { useState } from "react";
import { Transaction, TransactionStatus } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { useAppDispatch } from "@/store/hooks";
import { updateTransactionStatus } from "@/store/slices/transactionSlice";
import {
  Download,
  Eye,
  AlertCircle,
  ArrowDown,
  ArrowUpRight,
  Maximize2,
  ArrowLeftRight,
  Wallet
} from "lucide-react";

interface TransactionTableProps {
  transactions: Transaction[];
  /** Number of rows per page */
  pageSize?: number;
  /** 'dashboard' for main page, 'modal' for receiver details popup */
  variant?: "dashboard" | "modal";
  /** External control for search query (optional) */
  externalSearchQuery?: string;
  /** External control for action toggle (optional) */
  externalOnlyActionNeeded?: boolean;
}

const ROWS_PER_PAGE = 5;

/** Trigger a download of a sample file */
function downloadSampleFile() {
  const link = document.createElement("a");
  link.href = "/sample.docx";
  link.download = "remitland-transaction-report.docx";
  link.click();
}

export function TransactionTable({
  transactions,
  pageSize = ROWS_PER_PAGE,
  variant = "modal",
  externalSearchQuery,
  externalOnlyActionNeeded,
}: TransactionTableProps) {
  const dispatch = useAppDispatch();
  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const [internalOnlyActionNeeded, setInternalOnlyActionNeeded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("All");

  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const onlyActionNeeded = externalOnlyActionNeeded !== undefined ? externalOnlyActionNeeded : internalOnlyActionNeeded;

  // ---- Client-side filter ----
  const filtered = transactions.filter((tx) => {
    // 1. Tab filter (for dashboard)
    if (variant === "dashboard" && activeTab !== "All") {
      if (activeTab === "Add money" && tx.type !== "Add money") return false;
      if (activeTab === "Send money" && tx.type !== "Send money") return false;
      if (activeTab === "Conversion" && tx.type !== "Conversion") return false;
    }

    // 2. Search / Action filter
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      tx.to.toLowerCase().includes(query) ||
      tx.status.toLowerCase().includes(query);

    const matchesAction = !onlyActionNeeded || tx.status === "needs_action";

    return matchesSearch && matchesAction;
  });

  // ---- Handle Row Styling ----
  const getRowClass = (status: TransactionStatus) => {
    if (["cancelled", "rejected", "failed"].includes(status.toLowerCase())) {
      return "row-red";
    }
    return "";
  };

  // ---- Pagination ----
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 whenever filters change
  function handleSearchChange(value: string) {
    setInternalSearchQuery(value);
    setCurrentPage(1);
  }

  function handleActionToggle() {
    setInternalOnlyActionNeeded((prev) => !prev);
    setCurrentPage(1);
  }

  /** Inline status change — dispatches to Redux & would call API in production */
  function handleStatusChange(id: number, status: TransactionStatus) {
    dispatch(updateTransactionStatus({ id, status }));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ---- Variant Header: Tabs (Dashboard) or Toolbar (Modal internal) ---- */}
      {variant === "dashboard" ? (
        <div className="flex gap-2 ">
          {["All", "Add money", "Send money", "Conversion"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                activeTab === tab
                  ? "bg-yellow-400/20 text-yellow-700 border-yellow-200/50"
                  : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {tab === "Add money" && (
                  <Wallet size={14} className="rotate-45" />
                )}
                {tab === "Send money" && (
                  <Maximize2 size={14} className="rotate-[-135deg]" />
                )}
                {tab === "Conversion" && <ArrowLeftRight size={14} />}
                {tab}
              </div>
            </button>
          ))}
        </div>
      ) : externalSearchQuery === undefined ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name or status..."
          />

          <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
            <span>Only Action Needed</span>
            <label
              className="toggle-switch"
              aria-label="Show only action needed transactions"
            >
              <input
                type="checkbox"
                checked={onlyActionNeeded}
                onChange={handleActionToggle}
              />
              <span className="toggle-track" />
            </label>
          </div>
        </div>
      ) : null}

      {/* ---- Table ---- */}
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {variant === "modal" && <th>#</th>}
              <th>Date &amp; Time</th>
              <th>Request ID</th>
              <th>Type</th>
              <th>To</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={variant === "modal" ? 8 : 7}
                  className="text-center py-8 text-gray-400"
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              paginated.map((tx) => (
                <tr key={tx.id} className={getRowClass(tx.status)}>
                  {variant === "modal" && (
                    <td className="text-gray-400 text-[11px] font-medium">
                      {tx.id}
                    </td>
                  )}
                  <td
                    className={`${
                      variant === "dashboard"
                        ? "text-gray-400 text-[13px]"
                        : "text-[11px] text-gray-400"
                    } font-normal whitespace-nowrap`}
                  >
                    {tx.dateTime}
                  </td>
                  <td>
                    <span
                      className={`${
                        variant === "dashboard" ? "text-[13px]" : "text-[11px]"
                      } font-normal text-gray-800 border-b border-gray-800 border-dotted cursor-pointer`}
                    >
                      {tx.requestId}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span
                        className={`${
                          variant === "dashboard"
                            ? "text-[13px]"
                            : "text-[12px]"
                        } font-medium text-gray-800`}
                      >
                        {tx.type}
                      </span>
                      {variant === "dashboard" && (
                        <span className="text-[11px] text-gray-400">
                          (International)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="font-medium text-[13px] text-gray-800">
                    <div className="flex items-center gap-2">
                      {tx.type === "Add money" && (
                        <ArrowDown size={14} className="text-gray-400" />
                      )}
                      {tx.to}
                    </div>
                  </td>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://flagcdn.com/w40/${getCountryCode(tx.currency)}.png`}
                        alt={tx.currency}
                        className="flag-circle-sm"
                      />
                      <span className="font-medium text-[13px] text-gray-800">
                        {variant === "modal"
                          ? `${tx.currency} ${tx.amount}`
                          : `${tx.amount} ${tx.currency}`}
                      </span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={tx.status} />
                  </td>
                  <td>
                    {variant === "dashboard" ? (
                    <div className="flex items-center gap-4 text-[13px] font-normal">
                      <button className="text-blue-600 hover:opacity-70 transition-opacity">
                        View
                      </button>
                      <span className="text-gray-300 text-sm">|</span>
                      <button className="text-blue-600 hover:opacity-70 transition-opacity">
                        Download File
                      </button>
                    </div>
                    ) : (
                      <TransactionActions
                        transaction={tx}
                        onStatusChange={handleStatusChange}
                        onDownload={downloadSampleFile}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---- Pagination ---- */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

function getCountryCode(code: string): string {
  const codes: Record<string, string> = {
    USD: "us",
    AED: "ae",
    CAD: "ca",
    INR: "in",
    EUR: "eu",
  };
  return codes[code] ?? "us";
}

interface TransactionActionsProps {
  transaction: Transaction;
  onStatusChange: (id: number, status: TransactionStatus) => void;
  onDownload: () => void;
}

function TransactionActions({
  transaction,
  onStatusChange,
  onDownload,
}: TransactionActionsProps) {
  const { id, status } = transaction;

  switch (status) {
    case "Pending":
      return (
        <div className="flex flex-wrap gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(id, "approved")}
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            Track Payment
          </Button>
          <button
            className="btn btn-primary text-[11px] font-bold py-1.5 px-3 rounded-md"
            onClick={() => onStatusChange(id, "approved")}
          >
            Approve
          </button>
        </div>
      );
    case "Rejected":
      return (
        <Button
          variant="outline"
          size="sm"
          className="text-xs bg-red-50 text-red-700 border-red-200"
        >
          View Rejection
        </Button>
      );
    case "Cancelled":
      return (
        <Button variant="outline" size="sm" className="text-xs">
          View Reason
        </Button>
      );
    case "Success":
    case "approved":
    case "success":
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDownload}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
        >
          <Download size={12} />
          Download
        </Button>
      );
    case "needs_action":
      return (
        <Button
          variant="outline"
          size="sm"
          className="text-xs flex items-center gap-1 border-orange-200 text-orange-700 bg-orange-50"
        >
          <AlertCircle size={12} />
          Upload Receipt
        </Button>
      );
    default:
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs flex items-center gap-1"
        >
          <Eye size={12} />
          View
        </Button>
      );
  }
}
