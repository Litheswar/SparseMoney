import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardLayout from "./components/DashboardLayout";
import UserHome from "./pages/user/UserHome";
import UserTransactions from "./pages/user/UserTransactions";
import UserWallet from "./pages/user/UserWalletAutomation";
import UserInsights from "./pages/user/UserInsightsAutomation";
import UserRules from "./pages/user/UserRulesEngine";
import UserHorizon from "./pages/user/UserHorizonAutomation";
import UserGroups from "./pages/user/UserGroups";
import GroupDetails from "./pages/user/GroupDetails";
import UserProfile from "./pages/user/UserProfile";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminEngine from "./pages/admin/AdminEngine";
import AdminAnomaly from "./pages/admin/AdminAnomaly";
import AdminBehavior from "./pages/admin/AdminBehavior";
import AdminRules from "./pages/admin/AdminRules";
import AdminAudit from "./pages/admin/AdminAudit";
import AdminHealth from "./pages/admin/AdminHealth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role === 'user' && !user.bankConnected) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />} />
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />} />

      {/* Onboarding Flow */}
      <Route 
        path="/onboarding" 
        element={
          <AuthGuard>
            {user?.role === 'user' && !user.bankConnected ? <OnboardingPage /> : <Navigate to="/dashboard" replace />}
          </AuthGuard>
        } 
      />

      {/* Admin Protected Routes */}
      <Route path="/admin/*" element={
        <AuthGuard>
          <Routes>
            <Route path="/" element={<DashboardLayout><AdminOverview /></DashboardLayout>} />
            <Route path="/transactions" element={<DashboardLayout><AdminTransactions /></DashboardLayout>} />
            <Route path="/engine" element={<DashboardLayout><AdminEngine /></DashboardLayout>} />
            <Route path="/anomaly" element={<DashboardLayout><AdminAnomaly /></DashboardLayout>} />
            <Route path="/behavior" element={<DashboardLayout><AdminBehavior /></DashboardLayout>} />
            <Route path="/rules" element={<DashboardLayout><AdminRules /></DashboardLayout>} />
            <Route path="/audit" element={<DashboardLayout><AdminAudit /></DashboardLayout>} />
            <Route path="/health" element={<DashboardLayout><AdminHealth /></DashboardLayout>} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </AuthGuard>
      } />

      {/* User Protected Routes */}
      <Route path="/dashboard/*" element={
        <AuthGuard>
          <OnboardingGuard>
            <Routes>
              <Route path="/" element={<DashboardLayout><UserHome /></DashboardLayout>} />
              <Route path="/transactions" element={<DashboardLayout><UserTransactions /></DashboardLayout>} />
              <Route path="/wallet" element={<DashboardLayout><UserWallet /></DashboardLayout>} />
              <Route path="/insights" element={<DashboardLayout><UserInsights /></DashboardLayout>} />
              <Route path="/rules" element={<DashboardLayout><UserRules /></DashboardLayout>} />
              <Route path="/horizon" element={<DashboardLayout><UserHorizon /></DashboardLayout>} />
              <Route path="/groups" element={<DashboardLayout><UserGroups /></DashboardLayout>} />
              <Route path="/groups/:id" element={<DashboardLayout><GroupDetails /></DashboardLayout>} />
              <Route path="/profile" element={<DashboardLayout><UserProfile /></DashboardLayout>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </OnboardingGuard>
        </AuthGuard>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
