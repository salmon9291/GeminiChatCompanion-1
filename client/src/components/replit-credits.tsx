
import { Badge } from "@/components/ui/badge";

export function ReplitCredits() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
        <span className="text-xs">
          Powered by{" "}
          <a 
            href="https://replit.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            Replit
          </a>
        </span>
      </Badge>
    </div>
  );
}
