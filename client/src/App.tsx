import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Chat from "@/pages/chat";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import { ReplitCredits } from "./components/replit-credits";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Chat} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <ReplitCredits />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;