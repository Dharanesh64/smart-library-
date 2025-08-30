import { supabase } from '../lib/supabase';
import { AuthState, AdminUser } from '../types';

class AuthService {
  private currentAuth: AuthState = {
    isAuthenticated: false,
    user: null,
    role: 'student',
    token: null
  };

  async phoneLogin(phoneNumber: string): Promise<{ success: boolean; requiresSetup?: boolean; adminId?: string; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'phone_login',
          phone_number: phoneNumber
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return {
        success: true,
        requiresSetup: data.requires_setup,
        adminId: data.admin_id
      };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async setupAccount(phoneNumber: string, username: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'setup_account',
          phone_number: phoneNumber,
          username,
          password,
          name
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error };
      }

      this.currentAuth = {
        isAuthenticated: true,
        user: data.admin,
        role: 'admin',
        token: data.token
      };

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.admin));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'login',
          username,
          password
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error };
      }

      this.currentAuth = {
        isAuthenticated: true,
        user: data.admin,
        role: 'admin',
        token: data.token
      };

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.admin));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  }

  logout(): void {
    this.currentAuth = {
      isAuthenticated: false,
      user: null,
      role: 'student',
      token: null
    };
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  getCurrentAuth(): AuthState {
    // Try to restore from localStorage
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');
    
    if (token && user) {
      try {
        this.currentAuth = {
          isAuthenticated: true,
          user: JSON.parse(user),
          role: 'admin',
          token
        };
      } catch (error) {
        this.logout();
      }
    }
    
    return this.currentAuth;
  }

  setRole(role: 'student' | 'admin'): void {
    this.currentAuth.role = role;
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    };

    if (this.currentAuth.token) {
      headers['X-Admin-Token'] = this.currentAuth.token;
    }

    return headers;
  }
}

export const authService = new AuthService();