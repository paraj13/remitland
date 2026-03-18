# RemitLand — Frontend Dashboard

A production-ready remittance dashboard built with **Next.js 14**, **TypeScript**, **TailwindCSS**, and **Redux Toolkit**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Features](#features)
- [Environment Variables](#environment-variables)
- [API Integration Guide](#api-integration-guide)
- [Real-time (Socket.IO)](#real-time-socketio)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 (no inline styles) |
| State Management | Redux Toolkit + redux-persist |
| Real-time | Socket.IO Client |
| HTTP Client | Axios |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with Redux provider
│   ├── page.tsx            # Redirects to /receivers
│   ├── receivers/          # Receivers page (main CTA)
│   └── dashboard/          # Dashboard page (Appendix 2)
├── components/
│   ├── ui/                 # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── Modal.tsx
│   │   ├── SearchInput.tsx
│   │   ├── Pagination.tsx
│   │   └── CurrencyTab.tsx
│   ├── transactions/
│   │   └── TransactionTable.tsx  # Table with search + pagination
│   ├── receivers/
│   │   └── ReceiverModal.tsx     # Appendix 1 popup
│   └── layout/
│       ├── Sidebar.tsx     # Left nav
│       └── AppShell.tsx    # Page shell with socket hook
├── store/
│   ├── index.ts            # Redux store + persist config
│   ├── hooks.ts            # Typed useAppSelector/useAppDispatch
│   └── slices/
│       ├── currencySlice.ts   # Persisted selected currency
│       ├── transactionSlice.ts
│       └── uiSlice.ts         # Modal open/close state
├── hooks/
│   └── useSocketUpdates.ts # Socket.IO real-time listener
├── lib/
│   └── socket.ts           # Socket.IO singleton client
├── data/
│   └── mockData.ts         # JSON mock data (replace with API)
└── types/
    └── index.ts            # TypeScript type definitions
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Clone and install

```bash
cd remitland
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Receivers page**: [http://localhost:3000/receivers](http://localhost:3000/receivers)
- **Dashboard page**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## Features

| Feature | Status |
|---------|--------|
| Receivers page with "View receiver" CTA | ✅ |
| ReceiverModal (Appendix 1 popup) | ✅ |
| 3 currency tabs (AED/USD/CAD) — USD default | ✅ |
| Last selected currency persisted via Redux | ✅ |
| Client-side search (To field + Status) | ✅ |
| Only Action Needed toggle | ✅ |
| Pagination (5 rows per page) | ✅ |
| Download CTA (sample .docx) | ✅ |
| Status badge variants | ✅ |
| Dashboard page (Appendix 2) | ✅ |
| Clicking transaction row opens modal | ✅ |
| Socket.IO real-time client hook | ✅ (ready for backend) |
| Mobile responsive modal | ✅ |
| No inline CSS | ✅ |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | `http://localhost:3001` |
| `NEXT_PUBLIC_API_URL` | Laravel API base URL | `http://localhost:8000/api` |

---

## API Integration Guide

All mock data lives in `src/data/mockData.ts`. When the backend is ready:

### 1. Fetch currencies

Replace the `CURRENCIES` constant with:
```typescript
// In your component or Redux thunk:
const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/currencies`);
```

### 2. Fetch transactions

```typescript
const response = await axios.get(
  `${process.env.NEXT_PUBLIC_API_URL}/transactions?currency=USD`
);
dispatch(setTransactions(response.data));
```

### 3. Update transaction status (triggers Socket.IO broadcast)

```typescript
await axios.patch(
  `${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}/status`,
  { status: "Approved" }
);
// Socket.IO will automatically update all connected clients
```

---

## Real-time (Socket.IO)

The `useSocketUpdates` hook in `src/hooks/useSocketUpdates.ts` is mounted in `AppShell`. It listens for `transaction:updated` events from the Socket.IO server.

When the backend is ready, the Node.js Socket.IO server should emit:
```json
{
  "event": "transaction:updated",
  "payload": {
    "id": 1,
    "status": "Approved",
    ...
  }
}
```

The Redux `upsertTransaction` action handles both **new** and **updated** transactions automatically.
