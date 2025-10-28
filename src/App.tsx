import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import CreateTicketPage from './pages/CreateTicketPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import FeaturesPage from './pages/FeaturesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminSeverityPage from './pages/admin/AdminSeverityPage';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage';
import AdminSystemSettingsPage from './pages/admin/AdminSystemSettingsPage';
import ProtectedRoute from './components/ProtectedRoute';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/tickets" element={<TicketsPage />} />
                        <Route path="/tickets/new" element={<CreateTicketPage />} />
                        <Route path="/tickets/:id" element={<TicketDetailPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/admin/products" element={<AdminProductsPage />} />
                        <Route path="/admin/features" element={<FeaturesPage />} />
                        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                        <Route path="/admin/severity" element={<AdminSeverityPage />} />
                        <Route path="/admin/departments" element={<AdminDepartmentsPage />} />
                        <Route path="/admin/system-settings" element={<AdminSystemSettingsPage />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;