import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Snow from './components/Snow';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ProfileSettings from './components/profile/ProfileSettings';
import LandingPage from './components/landing/LandingPage';
import FortuneTelling from './components/fortune/FortuneTelling';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import { AuthProvider } from './contexts/AuthContext';
import { PaymentProvider } from './contexts/PaymentContext';
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <PaymentProvider>
          <div className="app-container">
            <div className="light-effect"></div>
            <Snow />
            <div className="content-container">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <ProfileSettings />
                  </PrivateRoute>
                } />
                <Route path="/fortune" element={
                  <PrivateRoute>
                    <FortuneTelling />
                  </PrivateRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } />

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        </PaymentProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
