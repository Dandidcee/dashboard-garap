import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <header className="mb-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-2 h-4 w-64" />
      </header>

      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </>
  );
}
