import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { StudentPortal } from './components/StudentPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { authService } from './services/authService';
import { AuthState } from './types';

function App() {
  const [auth, setAuth] = useState<AuthState>(authService.getCurrentAuth());
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    // Initialize auth state from localStorage
    setAuth(authService.getCurrentAuth());
  }, []);

  const handleRoleSwitch = (role: 'student' | 'admin') => {
    if (role === 'admin' && !auth.isAuthenticated) {
      setShowAdminLogin(true);
    } else {
      authService.setRole(role);
      setAuth(authService.getCurrentAuth());
      setShowAdminLogin(false);
    }
  };

  const handlePhoneLogin = async (phoneNumber: string) => {
    return await authService.phoneLogin(phoneNumber);
  };

  const handleSetupAccount = async (phoneNumber: string, username: string, password: string, name: string): Promise<boolean> => {
    const result = await authService.setupAccount(phoneNumber, username, password, name);
    if (result.success) {
      setAuth(authService.getCurrentAuth());
      setShowAdminLogin(false);
      return true;
    }
    return false;
  };

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const result = await authService.login(username, password);
    if (result.success) {
      setAuth(authService.getCurrentAuth());
      setShowAdminLogin(false);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    authService.logout();
    setAuth(authService.getCurrentAuth());
    setShowAdminLogin(false);
  };

  const handleBackToStudent = () => {
    authService.setRole('student');
    setAuth(authService.getCurrentAuth());
    setShowAdminLogin(false);
  };

  if (showAdminLogin) {
    return (
      <>
        <AdminLogin 
          onLogin={handleLogin}
          onPhoneLogin={handlePhoneLogin}
          onSetupAccount={handleSetupAccount}
          onBack={handleBackToStudent}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        auth={auth}
        onRoleSwitch={handleRoleSwitch}
        onLogout={handleLogout}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {auth.role === 'admin' && auth.isAuthenticated ? (
          <AdminDashboard />
        ) : (
          <StudentPortal />
        )}
      </main>
      
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
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;