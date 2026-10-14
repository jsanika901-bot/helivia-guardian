import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { AppShell } from '@/components/app-shell';
import { AppStateProvider } from '@/context/app-state';
import Dashboard from '@/pages/dashboard';
import ContactsPage from '@/pages/contacts';
import MedicalPage from '@/pages/medical';
import EmergencyPage from '@/pages/emergency';
import CheckInPage from '@/pages/check-in';
import ActivityPage from '@/pages/activity';
import PrivacyPage from '@/pages/privacy';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <AppShell>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/contacts" component={ContactsPage} />
          <Route path="/medical" component={MedicalPage} />
          <Route path="/emergency/:type" component={EmergencyPage} />
          <Route path="/check-in" component={CheckInPage} />
          <Route path="/activity" component={ActivityPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppStateProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
        </AppStateProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
