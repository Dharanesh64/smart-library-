/*
  # Library Management System Database Schema

  1. New Tables
    - `admins` - Admin user accounts with phone-based authentication
    - `books` - Enhanced book catalog with detailed metadata
    - `borrowing_records` - Complete borrowing history and active loans
    - `reservations` - Book reservation system
    - `notifications` - Notification queue and history
    - `otp_codes` - OTP verification for password recovery
    - `audit_logs` - System activity logging

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure admin authentication flow

  3. Features
    - Phone number-based admin registration
    - Book reservation and borrowing tracking
    - Automated notification system
    - Comprehensive audit logging
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins table for secure authentication
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number text UNIQUE NOT NULL,
  username text UNIQUE,
  password_hash text,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  is_setup_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Books table with enhanced metadata
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text UNIQUE NOT NULL,
  subject text NOT NULL,
  rack_number text NOT NULL,
  total_copies integer NOT NULL DEFAULT 1,
  available_copies integer NOT NULL DEFAULT 1,
  published_year integer,
  description text,
  cover_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES admins(id)
);

-- Borrowing records for tracking loans
CREATE TABLE IF NOT EXISTS borrowing_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrower_name text NOT NULL,
  borrower_email text,
  borrower_phone text,
  borrowed_at timestamptz DEFAULT now(),
  due_date timestamptz NOT NULL,
  returned_at timestamptz,
  is_overdue boolean DEFAULT false,
  overdue_days integer DEFAULT 0,
  fine_amount decimal(10,2) DEFAULT 0,
  notes text,
  issued_by uuid REFERENCES admins(id)
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  reserver_name text NOT NULL,
  reserver_email text,
  reserver_phone text,
  reserved_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_fulfilled boolean DEFAULT false,
  is_cancelled boolean DEFAULT false,
  notified_at timestamptz
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL, -- 'due_reminder', 'overdue_notice', 'reservation_available', 'password_reset'
  recipient_phone text,
  recipient_email text,
  message text NOT NULL,
  sent_at timestamptz,
  is_sent boolean DEFAULT false,
  retry_count integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- OTP codes for password recovery
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Audit logs for system monitoring
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  performed_by uuid REFERENCES admins(id),
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admins
CREATE POLICY "Admins can read own data"
  ON admins
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can update own data"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- RLS Policies for books (public read, admin write)
CREATE POLICY "Anyone can read books"
  ON books
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage books"
  ON books
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() AND is_active = true
  ));

-- RLS Policies for borrowing records
CREATE POLICY "Anyone can read borrowing records"
  ON borrowing_records
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage borrowing records"
  ON borrowing_records
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() AND is_active = true
  ));

-- RLS Policies for reservations
CREATE POLICY "Anyone can read reservations"
  ON reservations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create reservations"
  ON reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage reservations"
  ON reservations
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() AND is_active = true
  ));

-- RLS Policies for notifications
CREATE POLICY "Admins can manage notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() AND is_active = true
  ));

-- RLS Policies for OTP codes
CREATE POLICY "Service role can manage OTP codes"
  ON otp_codes
  FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for audit logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins 
    WHERE id = auth.uid() AND is_active = true
  ));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_title ON books USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_books_author ON books USING gin(to_tsvector('english', author));
CREATE INDEX IF NOT EXISTS idx_books_subject ON books(subject);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_borrowing_records_book_id ON borrowing_records(book_id);
CREATE INDEX IF NOT EXISTS idx_borrowing_records_due_date ON borrowing_records(due_date);
CREATE INDEX IF NOT EXISTS idx_reservations_book_id ON reservations(book_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON notifications(is_sent, created_at);
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone_number, expires_at);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_admins_updated_at 
  BEFORE UPDATE ON admins 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at 
  BEFORE UPDATE ON books 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check for overdue books
CREATE OR REPLACE FUNCTION check_overdue_books()
RETURNS void AS $$
BEGIN
  UPDATE borrowing_records 
  SET 
    is_overdue = true,
    overdue_days = EXTRACT(days FROM (now() - due_date))::integer
  WHERE 
    returned_at IS NULL 
    AND due_date < now() 
    AND is_overdue = false;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired OTP codes
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes 
  WHERE expires_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql;