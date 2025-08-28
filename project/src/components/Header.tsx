import React from 'react';
import { BookOpen, User, LogOut } from 'lucide-react';
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
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Library Book Finder</h1>
              <p className="text-sm text-gray-600">
                {auth.role === 'admin' ? 'Administrator Dashboard' : 'Student Portal'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onRoleSwitch('student')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  auth.role === 'student'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => onRoleSwitch('admin')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  auth.role === 'admin'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Admin
              </button>
            </div>
            
            {auth.isAuthenticated && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{auth.user?.name}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
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