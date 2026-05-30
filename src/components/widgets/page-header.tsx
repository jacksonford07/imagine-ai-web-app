export function PageHeader({
  title,
  description,
  fetchedAt,
}: {
  title: string;
  description?: string;
  fetchedAt?: string;
}): React.ReactElement {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description !== undefined && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {fetchedAt !== undefined && (
        <span className="text-xs text-muted-foreground">
          Updated {new Date(fetchedAt).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
