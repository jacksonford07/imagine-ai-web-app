// Per-page chrome pattern (US-024): display title on the left; the right
// slot composes <WindowFilter /> + <LastSynced /> + <RefreshNow /> per page.
export function PageHeader({
  title,
  description,
  fetchedAt,
  actions,
}: {
  title: string;
  description?: string;
  fetchedAt?: string;
  actions?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg-primary">
          {title}
        </h1>
        {description !== undefined && (
          <p className="mt-1 text-sm text-fg-muted">{description}</p>
        )}
      </div>
      {actions !== undefined ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : (
        fetchedAt !== undefined && (
          <span className="text-xs text-fg-muted">
            Updated {new Date(fetchedAt).toLocaleTimeString()}
          </span>
        )
      )}
    </div>
  );
}
