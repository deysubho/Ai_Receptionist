import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "./StatusBadge";
import { type HelpRequestWithCustomer } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";

interface RequestCardProps {
  request: HelpRequestWithCustomer;
  onSubmitAnswer: (requestId: number, answer: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function RequestCard({ request, onSubmitAnswer, isSubmitting = false }: RequestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [answer, setAnswer] = useState("");
  const [charCount, setCharCount] = useState(0);
  
  const maxChars = 500;
  const isPending = request.status === "pending";
  const isProcessing = request.status === "processing";
  
  const handleAnswerChange = (value: string) => {
    if (value.length <= maxChars) {
      setAnswer(value);
      setCharCount(value.length);
    }
  };
  
  const handleSubmit = async () => {
    if (answer.trim() && !isSubmitting) {
      await onSubmitAnswer(request.id, answer.trim());
      setAnswer("");
      setCharCount(0);
      setIsExpanded(false);
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });
  
  return (
    <Card 
      className={`p-6 border-card-border hover-elevate transition-all duration-200 ${
        isExpanded ? 'ring-2 ring-primary/20' : ''
      }`}
      data-testid={`card-request-${request.id}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-medium text-card-foreground" data-testid={`text-customer-name-${request.id}`}>
              {request.customer.name}
            </h3>
          </div>
          <p className="text-xs font-mono text-muted-foreground" data-testid={`text-customer-phone-${request.id}`}>
            {request.customer.phone}
          </p>
        </div>
        <StatusBadge status={request.status as any} />
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-card-foreground leading-relaxed" data-testid={`text-question-${request.id}`}>
          {request.question}
        </p>
      </div>
      
      {request.answer && request.status === "resolved" && (
        <div className="mb-4 p-3 rounded-md bg-muted/30 border border-muted">
          <p className="text-xs font-medium text-muted-foreground mb-1">Your Answer:</p>
          <p className="text-sm text-card-foreground" data-testid={`text-answer-${request.id}`}>
            {request.answer}
          </p>
        </div>
      )}
      
      {isExpanded && isPending && (
        <div className="mt-4 space-y-3 animate-in fade-in-50 duration-200">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Your Answer
            </label>
            <Textarea
              value={answer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Provide a helpful answer to the customer's question..."
              className="min-h-32 resize-none bg-background border-input focus-visible:ring-2 focus-visible:ring-primary"
              data-testid={`textarea-answer-${request.id}`}
              autoFocus
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                Agent will say: "Sorry for the delay. {answer || '[Your answer will appear here]'}"
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {charCount}/{maxChars}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!answer.trim() || isSubmitting}
              className="flex-1"
              data-testid={`button-submit-answer-${request.id}`}
            >
              {isSubmitting ? (
                <>
                  <Send className="w-4 h-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Answer
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsExpanded(false)}
              disabled={isSubmitting}
              data-testid={`button-cancel-${request.id}`}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <p className="text-xs font-mono text-muted-foreground" data-testid={`text-timestamp-${request.id}`}>
          {timeAgo}
        </p>
        
        {isPending && !isExpanded && (
          <Button
            size="sm"
            onClick={() => setIsExpanded(true)}
            data-testid={`button-answer-${request.id}`}
          >
            Answer
          </Button>
        )}
        
        {isProcessing && (
          <p className="text-xs text-status-processing font-medium">
            Sending to customer...
          </p>
        )}
      </div>
    </Card>
  );
}
