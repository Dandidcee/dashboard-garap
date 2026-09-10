import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <header className="mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </header>

      <Skeleton className="mb-8 h-28 w-full rounded-lg" />

      <div className="space-y-6">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    </>
  );
}
