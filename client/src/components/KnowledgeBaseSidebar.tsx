import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { type KnowledgeBaseEntry } from "@shared/schema";
import { Search, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface KnowledgeBaseSidebarProps {
  entries: KnowledgeBaseEntry[];
}

export function KnowledgeBaseSidebar({ entries }: KnowledgeBaseSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredEntries = entries.filter(entry => 
    entry.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const recentEntries = filteredEntries.slice(0, 5);
  
  return (
    <Card className="p-6 border-card-border lg:sticky lg:top-20 h-fit max-h-[calc(100vh-6rem)]" data-testid="sidebar-knowledge-base">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-medium text-card-foreground">Knowledge Base</h2>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search learned answers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-background"
          data-testid="input-search-knowledge"
        />
      </div>
      
      {filteredEntries.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "No matching entries found" : "No knowledge base entries yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {searchQuery ? "Try a different search term" : "Answer requests to build knowledge"}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Recently Learned ({recentEntries.length})
            </h3>
          </div>
          
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <Accordion type="single" collapsible className="space-y-2">
              {filteredEntries.map((entry) => {
                const timeAgo = formatDistanceToNow(new Date(entry.learnedAt), { addSuffix: true });
                
                return (
                  <AccordionItem 
                    key={entry.id} 
                    value={`item-${entry.id}`} 
                    className="border border-border rounded-md px-3"
                    data-testid={`accordion-kb-${entry.id}`}
                  >
                    <AccordionTrigger className="text-sm font-medium text-card-foreground hover:no-underline py-3">
                      <span className="text-left line-clamp-2">{entry.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-3">
                      <p className="mb-2">{entry.answer}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <p className="text-xs font-mono text-muted-foreground/70">
                          {timeAgo}
                        </p>
                        {entry.usageCount > 0 && (
                          <p className="text-xs text-muted-foreground/70">
                            Used {entry.usageCount}x
                          </p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        </>
      )}
    </Card>
  );
}
