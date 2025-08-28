import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudentPortal } from './components/StudentPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { authService } from './services/authService';
import { AuthState } from './types';

function App() {
  const [auth, setAuth] = useState<AuthState>(authService.getCurrentAuth());
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const handleRoleSwitch = (role: 'student' | 'admin') => {
    if (role === 'admin' && !auth.isAuthenticated) {
      setShowAdminLogin(true);
    } else {
      authService.setRole(role);
      setAuth(authService.getCurrentAuth());
      setShowAdminLogin(false);
    }
  };

  const handleLogin = (username: string, password: string): boolean => {
    const result = authService.login(username, password);
    if (result) {
      setAuth(result);
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
      <AdminLogin 
        onLogin={handleLogin}
        onBack={handleBackToStudent}
      />
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
        {auth.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <StudentPortal />
        )}
      </main>
    </div>
  );
}

export default App;