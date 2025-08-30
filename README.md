# Library Management System

A comprehensive library management system built with React, TypeScript, and Supabase. This system provides both student and admin interfaces for managing books, borrowing, reservations, and notifications.

## Features

### Authentication & Security
- **Phone-based Admin Authentication**: Secure two-step authentication process
- **Account Setup Flow**: Initial phone verification followed by username/password creation
- **Password Security**: Bcrypt hashing with strong password requirements
- **Session Management**: JWT-based authentication with secure token handling
- **OTP Recovery System**: SMS-based password recovery (ready for Twilio integration)

### Book Management
- **Comprehensive Catalog**: Full book metadata including ISBN, subject, rack location
- **Advanced Search**: Multi-criteria search with filters (title, author, ISBN, subject)
- **Pagination**: Efficient browsing of large book collections
- **Availability Tracking**: Real-time copy availability and estimated return dates
- **Cover Image Support**: Optional book cover images

### Borrowing System
- **Issue/Return Tracking**: Complete borrowing lifecycle management
- **Due Date Management**: Automated overdue detection and fine calculation
- **Borrower Information**: Contact details for notifications
- **Borrowing History**: Complete audit trail of all transactions
- **Active Loans Dashboard**: Real-time view of current borrowings

### Reservation System
- **Book Reservations**: Students can reserve unavailable books
- **Automated Notifications**: Alerts when reserved books become available
- **Expiration Management**: Automatic cleanup of expired reservations

### Admin Dashboard
- **Key Metrics**: Total books, available, borrowed, overdue counts
- **Visual Analytics**: Clean, modern dashboard with status indicators
- **Bulk Operations**: Efficient management of multiple records
- **Audit Logging**: Complete system activity tracking

### Notification System
- **Due Date Reminders**: Automated 24-48 hour advance notifications
- **Overdue Notices**: Escalating reminders for late returns
- **Availability Alerts**: Notifications when reserved books are available
- **SMS/Email Integration**: Ready for Twilio and SMTP services

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form** with Yup validation
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **Date-fns** for date manipulation

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security
- **Edge Functions** for serverless API endpoints
- **bcryptjs** for password hashing
- **JWT** for session management

### Database Schema
- **admins**: Secure admin user management
- **books**: Comprehensive book catalog
- **borrowing_records**: Complete borrowing history
- **reservations**: Book reservation system
- **notifications**: Notification queue and history
- **otp_codes**: OTP verification system
- **audit_logs**: System activity logging

## Setup Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env` and configure:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Application Configuration
APP_URL=http://localhost:5173
ADMIN_PHONE_NUMBERS=+1234567890,+0987654321
```

### 2. Database Setup
The database schema will be automatically created when you connect to Supabase. The migration includes:
- All necessary tables with proper relationships
- Row Level Security policies
- Performance indexes
- Automated functions for overdue checking

### 3. Admin Account Setup
1. Add authorized phone numbers to `ADMIN_PHONE_NUMBERS` in your environment
2. Insert initial admin record:
```sql
INSERT INTO admins (phone_number, name, is_active) 
VALUES ('+1234567890', 'Library Administrator', true);
```

### 4. SMS/Email Integration
- **Twilio**: Configure for SMS notifications
- **SMTP**: Configure for email notifications
- Both services are optional but recommended for production

## Usage

### Student Portal
- Browse and search the book catalog
- View book availability and estimated return dates
- Reserve books that are currently unavailable
- Modern, responsive interface optimized for mobile

### Admin Dashboard
- Comprehensive dashboard with key metrics
- Manage book catalog (add, edit, delete)
- Issue and return books
- View active loans and borrowing history
- Send automated notifications
- Monitor overdue books and fines

### Authentication Flow
1. **Phone Verification**: Enter registered phone number
2. **Account Setup** (first time): Create username, password, and profile
3. **Login**: Use username/password for subsequent access
4. **Password Recovery**: OTP-based reset via SMS

## Security Features

- **Row Level Security**: Database-level access control
- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure session management
- **Input Validation**: Comprehensive client and server-side validation
- **Audit Logging**: Complete activity tracking
- **Phone Verification**: Multi-factor authentication approach

## Performance Optimizations

- **Database Indexes**: Optimized queries for search and filtering
- **Pagination**: Efficient handling of large datasets
- **Debounced Search**: Reduced API calls during typing
- **Lazy Loading**: Components loaded on demand
- **Caching**: Strategic use of local state management

## Production Considerations

- **Error Handling**: Comprehensive error boundaries and user feedback
- **Logging**: Structured logging for debugging and monitoring
- **Scalability**: Database design supports growth
- **Security**: Production-ready authentication and authorization
- **Monitoring**: Built-in audit trails and notification tracking

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Endpoints

### Authentication
- `POST /functions/v1/auth-admin` - Admin authentication flow

### Notifications
- `POST /functions/v1/notifications` - Send notifications
- `GET /functions/v1/notifications` - Get notification history

## Contributing

1. Follow TypeScript best practices
2. Maintain comprehensive error handling
3. Add appropriate tests for new features
4. Update documentation for API changes
5. Ensure security considerations for all changes

## License

This project is licensed under the MIT License.