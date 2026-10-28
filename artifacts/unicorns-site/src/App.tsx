import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import UnicornMagic from "@/pages/UnicornMagic";
import UnicornValley from "@/pages/UnicornValley";
import AlicornAdventure from "@/pages/AlicornAdventure";
import AlicornPrivacy from "@/pages/AlicornPrivacy";
import UnicornMagicPrivacy from "@/pages/UnicornMagicPrivacy";
import UnicornValleyPrivacy from "@/pages/UnicornValleyPrivacy";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/unicorn-magic" component={UnicornMagic} />
      <Route path="/unicorn-magic/privacy" component={UnicornMagicPrivacy} />
      <Route path="/unicorn-valley" component={UnicornValley} />
      <Route path="/unicorn-valley/privacy" component={UnicornValleyPrivacy} />
      <Route path="/alicorn-adventure" component={AlicornAdventure} />
      <Route path="/alicorn-adventure/privacy" component={AlicornPrivacy} />
      {/* The slug was misspelled "alacorn" at first; keep those links working. */}
      <Route path="/alacorn-adventure">
        <Redirect to="/alicorn-adventure" />
      </Route>
      <Route path="/alacorn-adventure/privacy">
        <Redirect to="/alicorn-adventure/privacy" />
      </Route>
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
