import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Headphones } from "lucide-react";

interface DashboardHeaderProps {
  pendingCount: number;
}

export function DashboardHeader({ pendingCount }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">AI Supervisor Dashboard</h1>
            <p className="text-xs text-muted-foreground">Frontdesk Human-in-the-Loop System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Supervisor</p>
            <p className="text-sm font-medium text-foreground">Admin</p>
          </div>
          <Avatar className="w-9 h-9" data-testid="avatar-supervisor">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              SV
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
