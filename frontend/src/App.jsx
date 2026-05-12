import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './contexts/authStore.js';
import { useThemeStore } from './contexts/themeStore.js';
import LoginPage from './components/auth/LoginPage.jsx';
import SignupPage from './components/auth/SignupPage.jsx';
import DashboardLayout from './components/dashboard/DashboardLayout.jsx';
import WorkspacesPage from './components/workspace/WorkspacesPage.jsx';
import WorkspaceDetail from './components/workspace/WorkspaceDetail.jsx';
import ContentGenerator from './components/content/ContentGenerator.jsx';
import ContentHistory from './components/content/ContentHistory.jsx';
import SchedulePage from './components/scheduling/SchedulePage.jsx';
import AnalyticsPage from './components/dashboard/AnalyticsPage.jsx';
import LandingPage from './components/shared/LandingPage.jsx';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  const initTheme = useThemeStore(s => s.initTheme);
  
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<WorkspacesPage />} />
          <Route path="workspaces" element={<WorkspacesPage />} />
          <Route path="workspaces/:workspaceId" element={<WorkspaceDetail />} />
          <Route path="workspaces/:workspaceId/generate" element={<ContentGenerator />} />
          <Route path="workspaces/:workspaceId/history" element={<ContentHistory />} />
          <Route path="workspaces/:workspaceId/schedule" element={<SchedulePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
