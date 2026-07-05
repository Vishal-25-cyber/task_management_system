import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { TaskProvider } from '../context/TaskContext';
import ProtectedRoute from './ProtectedRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Lazy-load every page — each only downloads when first visited
const LoginPage         = lazy(() => import('../pages/LoginPage'));
const RegisterPage      = lazy(() => import('../pages/RegisterPage'));
const DashboardPage     = lazy(() => import('../pages/DashboardPage'));
const TasksPage         = lazy(() => import('../pages/TasksPage'));
const KanbanPage        = lazy(() => import('../pages/KanbanPage'));
const CalendarPage      = lazy(() => import('../pages/CalendarPage'));
const AnalyticsPage     = lazy(() => import('../pages/AnalyticsPage'));
const FavoritesPage     = lazy(() => import('../pages/FavoritesPage'));
const ArchivedPage      = lazy(() => import('../pages/ArchivedPage'));
const ProfilePage       = lazy(() => import('../pages/ProfilePage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const NotFoundPage      = lazy(() => import('../pages/NotFoundPage'));

// Minimal loading fallback shown while a lazy chunk downloads
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <p className="text-sm text-slate-400">Loading…</p>
    </div>
  </div>
);

const AppRouter = () => (
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--toast-bg, #1e293b)',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public / Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<TaskProvider><DashboardLayout /></TaskProvider>}>
                <Route path="/dashboard"     element={<DashboardPage />} />
                <Route path="/tasks"         element={<TasksPage />} />
                <Route path="/kanban"        element={<KanbanPage />} />
                <Route path="/calendar"      element={<CalendarPage />} />
                <Route path="/analytics"     element={<AnalyticsPage />} />
                <Route path="/favorites"     element={<FavoritesPage />} />
                <Route path="/archived"      element={<ArchivedPage />} />
                <Route path="/profile"       element={<ProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings"      element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Redirects */}
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRouter;
