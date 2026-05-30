import "server-only";
import type { z } from "zod";
import type { SourceResult } from "../contract";
import {
  overviewSchema,
  chatThreadPageSchema,
  chatThreadDetailSchema,
  escalationsSchema,
  healthSchema,
  type Overview,
  type ChatThreadPage,
  type ChatThreadDetail,
  type EscalationRow,
  type Health,
} from "./schema";

type QueryValue = string | number | undefined;

function buildQuery(params: Record<string, QueryValue>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs.length > 0 ? `?${qs}` : "";
}

// Single choke point: injects the internal secret, never throws, validates the
// response against the bot contract. The secret stays server-side.
async function fetchSource<T>(
  path: string,
  schema: z.ZodType<T>,
  params: Record<string, QueryValue> = {},
): Promise<SourceResult<T>> {
  const fetchedAt = new Date().toISOString();
  const baseUrl = process.env.BOT_API_URL;
  const secret = process.env.BOT_INTERNAL_SECRET;

  if (baseUrl === undefined || baseUrl === "") {
    return { data: null, error: "BOT_API_URL is not configured", fetchedAt };
  }

  try {
    const res = await fetch(`${baseUrl}${path}${buildQuery(params)}`, {
      headers: { "x-internal-secret": secret ?? "" },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        data: null,
        error: `bot responded ${String(res.status)}`,
        fetchedAt,
      };
    }

    const json: unknown = await res.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return {
        data: null,
        error: `unexpected response shape: ${parsed.error.message}`,
        fetchedAt,
      };
    }
    return { data: parsed.data, error: null, fetchedAt };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return { data: null, error: `request failed: ${message}`, fetchedAt };
  }
}

export interface DateWindow {
  from?: string;
  to?: string;
}

export interface ChatFilters extends DateWindow {
  student?: string;
  coach?: string;
  cohort?: string;
  status?: "open" | "acknowledged" | "resolved";
  limit?: number;
  cursor?: string;
}

export interface EscalationFilters extends DateWindow {
  student?: string;
  coach?: string;
  status?: "open" | "acknowledged" | "resolved";
}

export function getOverview(
  window: DateWindow = {},
): Promise<SourceResult<Overview>> {
  return fetchSource("/internal/admin/overview", overviewSchema, { ...window });
}

export function listChats(
  filters: ChatFilters = {},
): Promise<SourceResult<ChatThreadPage>> {
  return fetchSource("/internal/admin/chats", chatThreadPageSchema, {
    ...filters,
  });
}

export function getChat(
  externalId: string,
  window: DateWindow = {},
): Promise<SourceResult<ChatThreadDetail>> {
  return fetchSource(
    `/internal/admin/chats/${encodeURIComponent(externalId)}`,
    chatThreadDetailSchema,
    { ...window },
  );
}

export function listEscalations(
  filters: EscalationFilters = {},
): Promise<SourceResult<EscalationRow[]>> {
  return fetchSource("/internal/admin/escalations", escalationsSchema, {
    ...filters,
  });
}

export function getHealth(
  window: DateWindow = {},
): Promise<SourceResult<Health>> {
  return fetchSource("/internal/admin/health", healthSchema, { ...window });
}
