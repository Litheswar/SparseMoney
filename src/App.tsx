import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserEntryPage from "./pages/UserEntryPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardLayout from "./components/DashboardLayout";
import UserHome from "./pages/user/UserHome";
import UserTransactions from "./pages/user/UserTransactions";
import UserWallet from "./pages/user/UserWallet";
import UserInsights from "./pages/user/UserInsights";
import UserRules from "./pages/user/UserRules";
import UserHorizon from "./pages/user/UserHorizon";
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

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center animate-pulse">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        </div>
        <p className="text-sm text-muted-foreground font-medium">Loading SpareSmart...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user-entry" element={<UserEntryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // User needs onboarding
  if (user?.role === 'user' && !user.bankConnected) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user-entry" element={<UserEntryPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        {/* Redirect any dashboard access to onboarding */}
        <Route path="/dashboard/*" element={<Navigate to="/onboarding" replace />} />
        {/* Fallback to onboarding for other unknown paths while in this state */}
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }


  // Admin routes
  if (user?.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin" element={<DashboardLayout><AdminOverview /></DashboardLayout>} />
        <Route path="/admin/transactions" element={<DashboardLayout><AdminTransactions /></DashboardLayout>} />
        <Route path="/admin/engine" element={<DashboardLayout><AdminEngine /></DashboardLayout>} />
        <Route path="/admin/anomaly" element={<DashboardLayout><AdminAnomaly /></DashboardLayout>} />
        <Route path="/admin/behavior" element={<DashboardLayout><AdminBehavior /></DashboardLayout>} />
        <Route path="/admin/rules" element={<DashboardLayout><AdminRules /></DashboardLayout>} />
        <Route path="/admin/audit" element={<DashboardLayout><AdminAudit /></DashboardLayout>} />
        <Route path="/admin/health" element={<DashboardLayout><AdminHealth /></DashboardLayout>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    );
  }

  // User routes — wrapped in AppProvider for dashboard data
  return (
    <AppProvider>
      <Routes>
        <Route path="/dashboard" element={<DashboardLayout><UserHome /></DashboardLayout>} />
        <Route path="/dashboard/transactions" element={<DashboardLayout><UserTransactions /></DashboardLayout>} />
        <Route path="/dashboard/wallet" element={<DashboardLayout><UserWallet /></DashboardLayout>} />
        <Route path="/dashboard/insights" element={<DashboardLayout><UserInsights /></DashboardLayout>} />
        <Route path="/dashboard/rules" element={<DashboardLayout><UserRules /></DashboardLayout>} />
        <Route path="/dashboard/horizon" element={<DashboardLayout><UserHorizon /></DashboardLayout>} />
        <Route path="/dashboard/groups" element={<DashboardLayout><UserGroups /></DashboardLayout>} />
        <Route path="/dashboard/groups/:id" element={<DashboardLayout><GroupDetails /></DashboardLayout>} />
        <Route path="/dashboard/profile" element={<DashboardLayout><UserProfile /></DashboardLayout>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
