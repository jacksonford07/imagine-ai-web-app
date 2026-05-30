// Next.js page searchParams are string | string[] | undefined. These helpers
// narrow to the single-string filter values the source adapter expects.

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function single(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

const STATUSES = ["open", "acknowledged", "resolved"] as const;
export type Status = (typeof STATUSES)[number];

export function asStatus(
  value: string | string[] | undefined,
): Status | undefined {
  const v = single(value);
  return v !== undefined && (STATUSES as readonly string[]).includes(v)
    ? (v as Status)
    : undefined;
}
