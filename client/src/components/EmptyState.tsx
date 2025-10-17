import { CheckCircle } from "lucide-react";

interface EmptyStateProps {
  type: "pending" | "all";
}

export function EmptyState({ type }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4" data-testid="empty-state">
      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-medium text-card-foreground mb-2">
        {type === "pending" ? "No Pending Requests" : "No Requests Yet"}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {type === "pending" 
          ? "Great job! All customer questions have been answered." 
          : "When the AI agent escalates questions, they will appear here."}
      </p>
    </div>
  );
}
