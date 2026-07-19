import { cn } from "@/lib/utils";

export function HeroSkeleton() {
  return (
    <div className="relative h-[480px] overflow-hidden rounded-3xl bg-white/[0.04] md:h-[560px] lg:h-[620px]">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.03] via-white/[0.06] to-transparent" />
      <div className="absolute inset-x-8 bottom-10 space-y-4">
        <div className="h-3 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="h-14 w-3/4 animate-pulse rounded-lg bg-white/10" />
        <div className="h-14 w-2/3 animate-pulse rounded-lg bg-white/10" />
        <div className="h-3 w-full max-w-md animate-pulse rounded-full bg-white/10" />
        <div className="h-10 w-48 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export function SideCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-[150px] overflow-hidden rounded-2xl bg-white/[0.04] lg:h-auto",
        className,
      )}
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.03] to-transparent" />
      <div className="absolute inset-x-4 bottom-4 space-y-2">
        <div className="h-2 w-16 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/10" />
        <div className="h-2 w-24 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}

export function GridCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/[0.04]">
      <div className="aspect-video w-full animate-pulse bg-white/[0.05]" />
      <div className="space-y-2 p-4">
        <div className="h-2 w-20 animate-pulse rounded-full bg-white/10" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}
