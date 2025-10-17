import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RequestSkeleton() {
  return (
    <Card className="p-6 border-card-border">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      <div className="mb-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </Card>
  );
}
