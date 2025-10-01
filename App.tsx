import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { TermsProvider } from './context/TermsContext';
import Layout from './components/layout/Layout';

// Import Page Components
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StartCallPage from './pages/StartCallPage';
import ScheduleCallPage from './pages/ScheduleCallPage';
import NotificationsPage from './pages/NotificationsPage';
import MedicalRecordPage from './pages/MedicalRecordPage';
import HistoryPage from './pages/HistoryPage';
import PaymentMethodsPage from './pages/PaymentMethodsPage';
import PaymentsPage from './pages/PaymentsPage';
import ProfilePage from './pages/ProfilePage';
import DeviceTestPage from './pages/DeviceTestPage';
import WaitingRoomPage from './pages/WaitingRoomPage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <TermsProvider>
                <HashRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route 
                            path="/waiting-room" 
                            element={
                                <ProtectedRoute>
                                    <WaitingRoomPage />
                                </ProtectedRoute>
                            } 
                        />
                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <Layout>
                                        <Routes>
                                            <Route index element={<DashboardPage />} />
                                            <Route path="/atendimento-imediato" element={<StartCallPage />} />
                                            <Route path="/agendar-consulta" element={<ScheduleCallPage />} />
                                            <Route path="/device-test" element={<DeviceTestPage />} />
                                            <Route path="/notificacoes" element={<NotificationsPage />} />
                                            <Route path="/prontuario-medico" element={<MedicalRecordPage />} />
                                            <Route path="/historico" element={<HistoryPage />} />
                                            <Route path="/financeiro/formas-de-pagamento" element={<PaymentMethodsPage />} />
                                            <Route path="/financeiro/pagamentos" element={<PaymentsPage />} />
                                            <Route path="/perfil" element={<ProfilePage />} />
                                            <Route path="*" element={<Navigate to="/" replace />} />
                                        </Routes>
                                    </Layout>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </HashRouter>
            </TermsProvider>
        </AuthProvider>
    );
};

export default App;