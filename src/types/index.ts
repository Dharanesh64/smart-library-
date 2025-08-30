export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  subject: string;
  rackNumber: string;
  isAvailable: boolean;
  totalCopies: number;
  availableCopies: number;
  publishedYear: number;
  description?: string;
  coverImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  phone_number: string;
}

export interface User {
  id: string;
  username: string;
  role: 'student' | 'admin';
  name: string;
}

export interface SearchFilters {
  query: string;
  filterType: 'all' | 'title' | 'author' | 'isbn' | 'subject';
  availableOnly: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | User | null;
  role: 'student' | 'admin';
  token?: string | null;
}

export interface BorrowingRecord {
  id: string;
  bookId: string;
  borrowerName: string;
  borrowerEmail?: string;
  borrowerPhone?: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  isOverdue: boolean;
  overdueDays: number;
  fineAmount: number;
  notes?: string;
  issuedBy?: string;
}

export interface Reservation {
  id: string;
  bookId: string;
  reserverName: string;
  reserverEmail?: string;
  reserverPhone?: string;
  reservedAt: string;
  expiresAt: string;
  isFulfilled: boolean;
  isCancelled: boolean;
  notifiedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  overdueBooks: number;
  totalReservations: number;
  activeReservations: number;
}