import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          phone_number: string;
          username: string | null;
          password_hash: string | null;
          name: string;
          is_active: boolean;
          is_setup_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          phone_number: string;
          username?: string;
          password_hash?: string;
          name: string;
          is_active?: boolean;
          is_setup_complete?: boolean;
        };
        Update: {
          username?: string;
          password_hash?: string;
          name?: string;
          is_active?: boolean;
          is_setup_complete?: boolean;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          isbn: string;
          subject: string;
          rack_number: string;
          total_copies: number;
          available_copies: number;
          published_year: number | null;
          description: string | null;
          cover_image_url: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          title: string;
          author: string;
          isbn: string;
          subject: string;
          rack_number: string;
          total_copies?: number;
          available_copies?: number;
          published_year?: number;
          description?: string;
          cover_image_url?: string;
          created_by?: string;
        };
        Update: {
          title?: string;
          author?: string;
          isbn?: string;
          subject?: string;
          rack_number?: string;
          total_copies?: number;
          available_copies?: number;
          published_year?: number;
          description?: string;
          cover_image_url?: string;
        };
      };
      borrowing_records: {
        Row: {
          id: string;
          book_id: string;
          borrower_name: string;
          borrower_email: string | null;
          borrower_phone: string | null;
          borrowed_at: string;
          due_date: string;
          returned_at: string | null;
          is_overdue: boolean;
          overdue_days: number;
          fine_amount: number;
          notes: string | null;
          issued_by: string | null;
        };
        Insert: {
          book_id: string;
          borrower_name: string;
          borrower_email?: string;
          borrower_phone?: string;
          due_date: string;
          notes?: string;
          issued_by?: string;
        };
        Update: {
          returned_at?: string;
          is_overdue?: boolean;
          overdue_days?: number;
          fine_amount?: number;
          notes?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          book_id: string;
          reserver_name: string;
          reserver_email: string | null;
          reserver_phone: string | null;
          reserved_at: string;
          expires_at: string;
          is_fulfilled: boolean;
          is_cancelled: boolean;
          notified_at: string | null;
        };
        Insert: {
          book_id: string;
          reserver_name: string;
          reserver_email?: string;
          reserver_phone?: string;
          expires_at: string;
        };
        Update: {
          is_fulfilled?: boolean;
          is_cancelled?: boolean;
          notified_at?: string;
        };
      };
    };
  };
}