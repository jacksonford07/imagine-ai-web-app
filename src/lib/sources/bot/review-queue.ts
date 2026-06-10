import "server-only";
import { z } from "zod";
import type { SourceResult } from "../contract";
import { fetchSource } from "./client";

// Bot contract (US-015): GET /internal/admin/ceo/review-queue returns
// { count, items } and GET .../review-queue/count returns { count } for the
// sidebar badge. Soft metadata fields are nullish-tolerant and normalised to
// null so one drifting field never blanks the whole queue.

const rawCandidateSchema = z.object({
  customerId: z.string(),
  source: z.string().nullish(),
  sourceCustomerId: z.string().nullish(),
  primaryEmail: z.string().nullish(),
  name: z.string().nullish(),
  matchMethod: z.string().nullish(),
});

const rawItemSchema = z.object({
  id: z.string(),
  source: z.string().nullish(),
  sourceCustomerId: z.string().nullish(),
  email: z.string().nullish(),
  candidates: z.array(rawCandidateSchema).nullish(),
  createdAt: z.string().nullish(),
});

const rawPageSchema = z.object({
  count: z.number(),
  items: z.array(rawItemSchema),
});

export interface ReviewCandidate {
  customerId: string;
  source: string;
  sourceCustomerId: string | null;
  primaryEmail: string | null;
  name: string | null;
  matchMethod: string | null;
}

export interface ReviewQueueItem {
  id: string;
  source: string;
  sourceCustomerId: string | null;
  email: string | null;
  candidates: ReviewCandidate[];
  createdAt: string | null;
}

export interface ReviewQueuePage {
  count: number;
  items: ReviewQueueItem[];
}

function toItem(raw: z.infer<typeof rawItemSchema>): ReviewQueueItem {
  return {
    id: raw.id,
    source: raw.source ?? "unknown",
    sourceCustomerId: raw.sourceCustomerId ?? null,
    email: raw.email ?? null,
    candidates: (raw.candidates ?? []).map((c) => ({
      customerId: c.customerId,
      source: c.source ?? "unknown",
      sourceCustomerId: c.sourceCustomerId ?? null,
      primaryEmail: c.primaryEmail ?? null,
      name: c.name ?? null,
      matchMethod: c.matchMethod ?? null,
    })),
    createdAt: raw.createdAt ?? null,
  };
}

const countSchema = z.object({ count: z.number() }).passthrough();

export interface ReviewQueueCount {
  count: number;
}

/** Sidebar badge for /ceo/review-queue. Reads count off the list response so
 * it works against the shipped bot (the dedicated /count route is additive). */
export async function getReviewQueueCount(): Promise<
  SourceResult<ReviewQueueCount>
> {
  const result = await fetchSource(
    "/internal/admin/ceo/review-queue",
    countSchema,
  );
  return {
    ...result,
    data: result.data !== null ? { count: result.data.count } : null,
  };
}

export async function getReviewQueue(): Promise<SourceResult<ReviewQueuePage>> {
  const result = await fetchSource(
    "/internal/admin/ceo/review-queue",
    rawPageSchema,
  );
  return {
    ...result,
    data:
      result.data !== null
        ? { count: result.data.count, items: result.data.items.map(toItem) }
        : null,
  };
}
