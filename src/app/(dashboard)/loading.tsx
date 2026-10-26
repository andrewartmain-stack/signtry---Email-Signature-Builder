import { Skeleton } from '@/components/ui/skeleton'

// Shown instantly on sidebar navigation while the next page renders on the
// server, so switching tabs never feels frozen.
export default function DashboardLoading() {
    return (
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-6 md:px-8 md:py-10" aria-busy="true">
            <div className="flex flex-col gap-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-9 w-72" />
                <Skeleton className="h-4 w-96 max-w-full" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-48 rounded-2xl" />
                ))}
            </div>
        </div>
    )
}
