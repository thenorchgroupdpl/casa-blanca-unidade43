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
import UsersPage from "./pages/admin/super/Users";
import DesignPage from "./pages/admin/super/Design";
import IntegrationsPage from "./pages/admin/super/Integrations";
import SettingsPage from "./pages/admin/super/Settings";
import GlobalSettingsPage from "./pages/admin/super/GlobalSettings";
import BillingPage from "./pages/admin/super/Billing";
import BillingPopupsPage from "./pages/admin/super/BillingPopups";

// Client Admin Pages
import ClientDashboard from "./pages/admin/dashboard/Dashboard";
import CatalogPage from "./pages/admin/dashboard/Catalog";
import NotificationsPage from "./pages/admin/dashboard/Notifications";
import VitrinePage from "./pages/admin/dashboard/Vitrine";
import StoreDataPage from "./pages/admin/dashboard/StoreData";
import OrdersPage from "./pages/admin/dashboard/Orders";
import OrderHistoryPage from "./pages/admin/dashboard/OrderHistory";
import DeliveryPage from "./pages/admin/dashboard/Delivery";
import CouponsPage from "./pages/admin/dashboard/Coupons";
import ClientIntegrationsPage from "./pages/admin/dashboard/Integrations";

// Onboarding
import OnboardingPage from "./pages/Onboarding";

// Shared Admin Pages
import ProfilePage from "./pages/admin/Profile";

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
      <Route path="/admin/super/users" component={UsersPage} />
      <Route path="/admin/super/design" component={DesignPage} />
      <Route path="/admin/super/integrations" component={IntegrationsPage} />
      <Route path="/admin/super/settings" component={SettingsPage} />
      <Route path="/admin/super/billing" component={BillingPage} />
      <Route path="/admin/super/billing-popups" component={BillingPopupsPage} />
      <Route path="/admin/super/global-settings" component={GlobalSettingsPage} />
      
      {/* Client Admin Routes */}
      <Route path="/admin/dashboard" component={ClientDashboard} />
      <Route path="/admin/dashboard/catalog" component={CatalogPage} />
      <Route path="/admin/dashboard/notifications" component={NotificationsPage} />
      <Route path="/admin/dashboard/vitrine" component={VitrinePage} />
      <Route path="/admin/dashboard/store" component={StoreDataPage} />
      <Route path="/admin/dashboard/orders" component={OrdersPage} />
      <Route path="/admin/dashboard/history" component={OrderHistoryPage} />
      <Route path="/admin/dashboard/delivery" component={DeliveryPage} />
      <Route path="/admin/dashboard/coupons" component={CouponsPage} />
      <Route path="/admin/dashboard/integrations" component={ClientIntegrationsPage} />
      
      {/* Shared Admin Routes */}
      <Route path="/admin/profile" component={ProfilePage} />
      <Route path="/admin/super/profile" component={ProfilePage} />
      
      {/* Onboarding Briefing Form (public) */}
      <Route path="/onboarding/:token" component={OnboardingPage} />
      
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
          <GlobalToast />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
