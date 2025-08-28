import { User, AuthState } from '../types';
import { mockUsers } from '../data/mockData';

class AuthService {
  private currentAuth: AuthState = {
    isAuthenticated: false,
    user: null,
    role: 'student'
  };

  login(username: string, password: string): AuthState | null {
    // Simple mock authentication
    const user = mockUsers.find(u => u.username === username);
    
    if (user && password === 'password') {
      this.currentAuth = {
        isAuthenticated: true,
        user,
        role: user.role
      };
      return this.currentAuth;
    }
    
    return null;
  }

  logout(): void {
    this.currentAuth = {
      isAuthenticated: false,
      user: null,
      role: 'student'
    };
  }

  getCurrentAuth(): AuthState {
    return this.currentAuth;
  }

  setRole(role: 'student' | 'admin'): void {
    this.currentAuth.role = role;
  }
}

export const authService = new AuthService();