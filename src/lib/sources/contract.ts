// Every source fetch resolves to this shape and never throws — pages render an
// inline error card instead of crashing. `fetchedAt` is shown so the operator
// knows how fresh the on-demand snapshot is.
export interface SourceResult<T> {
  data: T | null;
  error: string | null;
  fetchedAt: string;
}
