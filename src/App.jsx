
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Reglas from './pages/Reglas';
import Simulador from './pages/Simulador';
import Historial from './pages/Historial';
import { NotificationsProvider } from './hooks/useGlobalNotifications.jsx';

function App() {
  return (
    <NotificationsProvider>
      <Router>
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
      </Router>
    </NotificationsProvider>
  );
}

export default App;
