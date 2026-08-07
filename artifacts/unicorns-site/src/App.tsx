import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import UnicornMagic from "@/pages/UnicornMagic";
import UnicornValley from "@/pages/UnicornValley";
import AlacornAdventure from "@/pages/AlacornAdventure";
import AlacornPrivacy from "@/pages/AlacornPrivacy";
import UnicornValleyPrivacy from "@/pages/UnicornValleyPrivacy";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/unicorn-magic" component={UnicornMagic} />
      <Route path="/unicorn-valley" component={UnicornValley} />
      <Route path="/unicorn-valley/privacy" component={UnicornValleyPrivacy} />
      <Route path="/alacorn-adventure" component={AlacornAdventure} />
      <Route path="/alacorn-adventure/privacy" component={AlacornPrivacy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
