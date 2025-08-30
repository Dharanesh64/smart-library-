import { supabase } from '../lib/supabase';
import { DashboardStats } from '../types';

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get total books
      const { count: totalBooks } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true });

      // Get available books
      const { count: availableBooks } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .gt('available_copies', 0);

      // Get active loans (borrowed books)
      const { count: borrowedBooks } = await supabase
        .from('borrowing_records')
        .select('*', { count: 'exact', head: true })
        .is('returned_at', null);

      // Get overdue books
      const { count: overdueBooks } = await supabase
        .from('borrowing_records')
        .select('*', { count: 'exact', head: true })
        .is('returned_at', null)
        .eq('is_overdue', true);

      // Get total reservations
      const { count: totalReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true });

      // Get active reservations
      const { count: activeReservations } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('is_fulfilled', false)
        .eq('is_cancelled', false)
        .gt('expires_at', new Date().toISOString());

      return {
        totalBooks: totalBooks || 0,
        availableBooks: availableBooks || 0,
        borrowedBooks: borrowedBooks || 0,
        overdueBooks: overdueBooks || 0,
        totalReservations: totalReservations || 0,
        activeReservations: activeReservations || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalBooks: 0,
        availableBooks: 0,
        borrowedBooks: 0,
        overdueBooks: 0,
        totalReservations: 0,
        activeReservations: 0
      };
    }
  }

  async sendDueReminders(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'send_due_reminders'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      return { success: true, count: data.reminders_sent };
    } catch (error) {
      console.error('Error sending due reminders:', error);
      return { success: false, count: 0 };
    }
  }

  async sendOverdueNotices(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          action: 'send_overdue_notices'
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      return { success: true, count: data.notices_sent };
    } catch (error) {
      console.error('Error sending overdue notices:', error);
      return { success: false, count: 0 };
    }
  }
}

export const dashboardService = new DashboardService();