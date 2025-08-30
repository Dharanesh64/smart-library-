import React from 'react';
import { BookOpen, User, LogOut, Shield } from 'lucide-react';
import { AuthState } from '../types';

interface HeaderProps {
  auth: AuthState;
  onRoleSwitch: (role: 'student' | 'admin') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ auth, onRoleSwitch, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Library Management System</h1>
              <p className="text-sm text-gray-600">
                {auth.role === 'admin' && auth.isAuthenticated ? 'Administrator Dashboard' : 'Student Portal'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onRoleSwitch('student')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  auth.role === 'student'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Student</span>
              </button>
              <button
                onClick={() => onRoleSwitch('admin')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  auth.role === 'admin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </button>
            </div>
            
            {auth.isAuthenticated && auth.user && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{auth.user.name}</div>
                    <div className="text-gray-500">{'username' in auth.user ? auth.user.username : 'Student'}</div>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};