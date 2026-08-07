import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
// Page imports
import Layout from '@/components/admin/Layout';
import Home from '@/pages/Home';
import Orders from '@/pages/Orders';
import Customers from '@/pages/Customers';
import Desserts from '@/pages/Desserts';
import SpecialOfMonth from '@/pages/SpecialOfMonth';
import Inventory from '@/pages/Inventory';
import Reports from '@/pages/Reports';
import Analytics from '@/pages/Analytics';
import ContactRequests from '@/pages/ContactRequests';
import Gallery from '@/pages/Gallery';
import Production from '@/pages/Production';
import Recipes from '@/pages/Recipes';
import Employees from '@/pages/Employees';
import Team from '@/pages/Team';
import Tasks from '@/pages/Tasks';
import Marketing from '@/pages/Marketing';
import CMS from '@/pages/CMS';
import Notifications from '@/pages/Notifications';
import AuditLogs from '@/pages/AuditLogs';
import Settings from '@/pages/Settings';

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        <div className="text-[13px] text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/desserts" element={<Desserts />} />
          <Route path="/special-of-month" element={<SpecialOfMonth />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/contact" element={<ContactRequests />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/production" element={<Production />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/team" element={<Team />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/cms" element={<CMS />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
