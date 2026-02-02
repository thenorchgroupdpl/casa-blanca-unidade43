import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import GlobalToast from "./components/GlobalToast";

// Landing Page
import Home from "./pages/Home";
import StoreLanding from "./pages/StoreLanding";

// Auth Pages
import Login from "./pages/Login";
import AdminRedirect from "./pages/AdminRedirect";

// Super Admin Pages
import SuperAdminDashboard from "./pages/admin/super/Dashboard";
import TenantsPage from "./pages/admin/super/Tenants";

// Client Admin Pages
import ClientDashboard from "./pages/admin/dashboard/Dashboard";
import CatalogPage from "./pages/admin/dashboard/Catalog";
import VitrinePage from "./pages/admin/dashboard/Vitrine";
import StoreDataPage from "./pages/admin/dashboard/StoreData";

function Router() {
  return (
    <Switch>
      {/* Home - Landing Page principal ou redirect */}
      <Route path="/" component={Home} />
      
      {/* Login Page */}
      <Route path="/login" component={Login} />
      
      {/* Admin Redirect (redirects to appropriate dashboard) */}
      <Route path="/admin" component={AdminRedirect} />
      
      {/* Super Admin Routes */}
      <Route path="/admin/super" component={SuperAdminDashboard} />
      <Route path="/admin/super/tenants" component={TenantsPage} />
      <Route path="/admin/super/users" component={SuperAdminDashboard} />
      <Route path="/admin/super/design" component={SuperAdminDashboard} />
      <Route path="/admin/super/integrations" component={SuperAdminDashboard} />
      <Route path="/admin/super/settings" component={SuperAdminDashboard} />
      
      {/* Client Admin Routes */}
      <Route path="/admin/dashboard" component={ClientDashboard} />
      <Route path="/admin/dashboard/catalog" component={CatalogPage} />
      <Route path="/admin/dashboard/vitrine" component={VitrinePage} />
      <Route path="/admin/dashboard/store" component={StoreDataPage} />
      
      {/* Store Landing Page (by slug) */}
      <Route path="/:slug" component={StoreLanding} />
      
      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast: 'w-full',
              },
            }}
          />
          <GlobalToast />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
