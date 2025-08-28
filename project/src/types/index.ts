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
  user: User | null;
  role: 'student' | 'admin';
}