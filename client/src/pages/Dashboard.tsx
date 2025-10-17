import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/DashboardHeader";
import { RequestCard } from "@/components/RequestCard";
import { KnowledgeBaseSidebar } from "@/components/KnowledgeBaseSidebar";
import { EmptyState } from "@/components/EmptyState";
import { RequestSkeleton } from "@/components/RequestSkeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type HelpRequestWithCustomer, type KnowledgeBaseEntry } from "@shared/schema";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "resolved">("pending");
  const { toast } = useToast();
  
  // Fetch help requests
  const { data: requests = [], isLoading: loadingRequests } = useQuery<HelpRequestWithCustomer[]>({
    queryKey: ["/api/requests"],
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
  });
  
  // Fetch knowledge base
  const { data: knowledgeBase = [] } = useQuery<KnowledgeBaseEntry[]>({
    queryKey: ["/api/knowledge"],
  });
  
  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ requestId, answer }: { requestId: number; answer: string }) => {
      return await apiRequest("PATCH", `/api/requests/${requestId}/answer`, { answer });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge"] });
      toast({
        title: "Answer sent!",
        description: "Customer has been notified and knowledge base updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send answer",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmitAnswer = async (requestId: number, answer: string) => {
    await submitAnswerMutation.mutateAsync({ requestId, answer });
  };
  
  // Filter requests by tab
  const filteredRequests = requests.filter(request => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return request.status === "pending" || request.status === "processing";
    if (activeTab === "resolved") return request.status === "resolved" || request.status === "timeout";
    return true;
  });
  
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const resolvedCount = requests.filter(r => r.status === "resolved").length;
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader pendingCount={pendingCount} />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2" data-testid="text-page-title">
            Help Requests
          </h2>
          <p className="text-sm text-muted-foreground" data-testid="text-pending-count">
            {pendingCount} pending • {resolvedCount} resolved
          </p>
        </div>
        
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div>
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
              <TabsList className="mb-4" data-testid="tabs-filter">
                <TabsTrigger value="all" data-testid="tab-all">
                  All
                </TabsTrigger>
                <TabsTrigger value="pending" data-testid="tab-pending">
                  Pending {pendingCount > 0 && `(${pendingCount})`}
                </TabsTrigger>
                <TabsTrigger value="resolved" data-testid="tab-resolved">
                  Resolved
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-0">
                {loadingRequests ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => <RequestSkeleton key={i} />)}
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <EmptyState type={activeTab === "pending" ? "pending" : "all"} />
                ) : (
                  <div className="space-y-4">
                    {filteredRequests.map(request => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        onSubmitAnswer={handleSubmitAnswer}
                        isSubmitting={submitAnswerMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <aside>
            <KnowledgeBaseSidebar entries={knowledgeBase} />
          </aside>
        </div>
      </main>
    </div>
  );
}
