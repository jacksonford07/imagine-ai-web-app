// Type-only re-exports so the 'use client' table/drawer never import the
// server-only adapter module directly (types are erased at compile time).
export type {
  TransactionRow,
  TransactionAdjustment,
  AppliedOverride,
} from "@/lib/sources/bot/transactions";
