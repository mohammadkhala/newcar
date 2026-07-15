export default function ShopSearchLoading() {
  return (
    <div className="store-shell space-y-6 py-8" aria-busy="true" aria-live="polite">
      <div className="h-8 w-48 animate-pulse rounded-md bg-surface-muted" />
      <div className="h-24 animate-pulse rounded-xl bg-surface-muted" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] animate-pulse rounded-xl bg-surface-muted"
          />
        ))}
      </div>
    </div>
  );
}
