import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import { usePageTracking } from "./hooks/useAnalytics";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import FocusTimer from "./pages/FocusTimer";
import QuickIdeas from "./pages/QuickIdeas";
import Pricing from "./pages/Pricing";
import Profile from "./pages/Profile";
import Templates from "./pages/Templates";
import Onboarding from "./pages/Onboarding";
import ExportProject from "./pages/ExportProject";
import Analytics from "./pages/Analytics";
import EffortMatrix from "./pages/EffortMatrix";
import NotificationSettings from "./pages/NotificationSettings";
import CalendarSettings from "./pages/CalendarSettings";
import Rewards from "./pages/Rewards";
import Settings from "./pages/Settings";
import DashboardUnified from "./pages/DashboardUnified";
import DashboardBarkley from "./pages/DashboardBarkley";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";

// Protected Route Component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  // Track page views on route changes
  usePageTracking();
  
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      
      {/* Protected Routes - Dashboard */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/dashboard/projects">
        <ProtectedRoute component={Projects} />
      </Route>
      <Route path="/dashboard/projects/new">
        <ProtectedRoute component={NewProject} />
      </Route>
      <Route path="/dashboard/projects/:id">
        <ProtectedRoute component={ProjectDetail} />
      </Route>
      <Route path="/dashboard/focus">
        <ProtectedRoute component={FocusTimer} />
      </Route>
      <Route path="/dashboard/ideas">
        <ProtectedRoute component={QuickIdeas} />
      </Route>
      <Route path="/dashboard/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/dashboard/templates">
        <ProtectedRoute component={Templates} />
      </Route>
      <Route path="/dashboard/projects/:id/export">
        <ProtectedRoute component={ExportProject} />
      </Route>
      <Route path="/onboarding">
        <ProtectedRoute component={Onboarding} />
      </Route>
      <Route path="/dashboard/analytics">
        <ProtectedRoute component={Analytics} />
      </Route>
      <Route path="/dashboard/projects/:id/matrix">
        <ProtectedRoute component={EffortMatrix} />
      </Route>
      <Route path="/dashboard/notifications">
        <ProtectedRoute component={NotificationSettings} />
      </Route>
      <Route path="/dashboard/calendar">
        <ProtectedRoute component={CalendarSettings} />
      </Route>
      <Route path="/dashboard/rewards">
        {() => <ProtectedRoute component={Rewards} />}
      </Route>
      <Route path="/dashboard/settings">
        {() => <ProtectedRoute component={Settings} />}
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} />
      </Route>
      <Route path="/admin/products">
        <ProtectedRoute component={AdminProducts} />
      </Route>
      <Route path="/admin/orders">
        <ProtectedRoute component={AdminOrders} />
      </Route>
      <Route path="/dashboard/unified">
        <ProtectedRoute component={DashboardUnified} />
      </Route>
      <Route path="/dashboard/barkley">
        <ProtectedRoute component={DashboardBarkley} />
      </Route>
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
