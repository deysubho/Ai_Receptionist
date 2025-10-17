import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

type Status = "pending" | "resolved" | "timeout" | "processing";

interface StatusBadgeProps {
  status: Status;
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-status-pending/20 text-status-pending border-status-pending/30",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle,
    className: "bg-status-resolved/20 text-status-resolved border-status-resolved/30",
  },
  timeout: {
    label: "Timeout",
    icon: XCircle,
    className: "bg-status-timeout/20 text-status-timeout border-status-timeout/30",
  },
  processing: {
    label: "Processing",
    icon: Loader2,
    className: "bg-status-processing/20 text-status-processing border-status-processing/30",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="outline" 
      className={`rounded-full px-3 py-1 text-xs font-medium border ${config.className}`}
      data-testid={`badge-status-${status}`}
    >
      <Icon className={`w-3 h-3 mr-1.5 ${status === 'processing' ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  );
}
