/**
 * Neo-Brutalist Dark Academia Design
 * Deep charcoal backgrounds with purple/pink gradient accents
 * Playfair Display for headings, Inter for body
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import NovelKit from "./pages/NovelKit";
import Sanctuary from "./pages/Sanctuary";
import Achievements from "./pages/Achievements";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Welcome} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/novel-kit"} component={NovelKit} />
      <Route path={"/sanctuary"} component={Sanctuary} />
      <Route path={"/achievements"} component={Achievements} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </DataProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
