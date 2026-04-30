import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AppointmentsPage from './pages/AppointmentsPage';
import InventoryPage from './pages/InventoryPage';
import OPDPage from './pages/OPDPage';
import IPDPage from './pages/IPDPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import DoctorsPage from './pages/DoctorsPage';
import UsersPage from './pages/UsersPage';
import NotFoundPage from './pages/NotFoundPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/appointments" element={<AppointmentsPage />} />
      <Route path="/inventory" element={
        <ProtectedRoute roles={['admin','doctor','nurse','pharmacist','receptionist','worker']}>
          <InventoryPage />
        </ProtectedRoute>
      } />
      <Route path="/opd" element={
        <ProtectedRoute roles={['admin','doctor','nurse','pharmacist','receptionist','worker']}>
          <OPDPage />
        </ProtectedRoute>
      } />
      <Route path="/ipd" element={
        <ProtectedRoute roles={['admin','doctor','nurse','pharmacist','receptionist','worker']}>
          <IPDPage />
        </ProtectedRoute>
      } />
      <Route path="/prescriptions" element={<PrescriptionsPage />} />
      <Route path="/doctors" element={<DoctorsPage />} />
      <Route path="/users" element={
        <ProtectedRoute roles={['admin']}>
          <UsersPage />
        </ProtectedRoute>
      } />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.875rem', fontWeight: '500' },
            success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
            error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
