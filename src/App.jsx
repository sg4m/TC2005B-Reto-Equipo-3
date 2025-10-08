
import React, { Suspense } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { NotificationsProvider } from './hooks/useGlobalNotifications.jsx';

// Lazy load components for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Reglas = React.lazy(() => import('./pages/Reglas'));
const Simulador = React.lazy(() => import('./pages/Simulador'));
const Historial = React.lazy(() => import('./pages/Historial'));

// Loading component
const LoadingSpinner = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    backgroundColor: '#f8f9fa'
  }}>
    <CircularProgress sx={{ color: '#EB0029' }} size={40} />
  </Box>
);

function App() {
  return (
    <NotificationsProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reglas" element={<Reglas />} />
            <Route path="/simulador" element={<Simulador />} />
            <Route path="/reportes" element={<Reports />} />
            <Route path="/historial" element={<Historial />} />
            {/* Legacy route - redirect to new route */}
            <Route path="/reports" element={<Navigate to="/reportes" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </NotificationsProvider>
  );
}

export default App;
