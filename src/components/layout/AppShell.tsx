// ============================================================
// App Shell Layout (used by all dashboard pages)
// Provides the Sidebar + main content area structure.
// On mobile: Sidebar is hidden; content fills full width.
// ============================================================

"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useSocketUpdates } from "@/hooks/useSocketUpdates";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  // Socket.IO listener for real-time transaction updates
  useSocketUpdates();

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar (hidden on mobile via hidden md:flex) */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
