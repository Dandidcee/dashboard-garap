import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <header className="mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
      </header>

      <section className="mb-8">
        <Skeleton className="mb-3 h-5 w-32" />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-20 rounded-lg last:col-span-2 md:last:col-span-1" />
        ))}
      </section>

      <Skeleton className="h-64 w-full rounded-lg" />
    </>
  );
}
