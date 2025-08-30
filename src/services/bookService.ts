import { supabase } from '../lib/supabase';
import { Book, BorrowingRecord, Reservation, PaginatedResponse } from '../types';
import { authService } from './authService';

class BookService {
  async getAllBooks(page = 1, limit = 10): Promise<PaginatedResponse<Book>> {
    try {
      const offset = (page - 1) * limit;
      
      const { data: books, error, count } = await supabase
        .from('books')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: books || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching books:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  }

  async searchBooks(query: string, filterType: string, availableOnly = false, page = 1, limit = 10): Promise<PaginatedResponse<Book>> {
    try {
      const offset = (page - 1) * limit;
      let queryBuilder = supabase.from('books').select('*', { count: 'exact' });

      if (query.trim()) {
        switch (filterType) {
          case 'title':
            queryBuilder = queryBuilder.textSearch('title', query);
            break;
          case 'author':
            queryBuilder = queryBuilder.textSearch('author', query);
            break;
          case 'isbn':
            queryBuilder = queryBuilder.ilike('isbn', `%${query}%`);
            break;
          case 'subject':
            queryBuilder = queryBuilder.ilike('subject', `%${query}%`);
            break;
          default:
            queryBuilder = queryBuilder.or(`title.ilike.%${query}%,author.ilike.%${query}%,isbn.ilike.%${query}%,subject.ilike.%${query}%`);
        }
      }

      if (availableOnly) {
        queryBuilder = queryBuilder.gt('available_copies', 0);
      }

      const { data: books, error, count } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: books || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error searching books:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  }

  async addBook(book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<Book | null> {
    try {
      const { data, error } = await supabase
        .from('books')
        .insert({
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          subject: book.subject,
          rack_number: book.rackNumber,
          total_copies: book.totalCopies,
          available_copies: book.availableCopies,
          published_year: book.publishedYear,
          description: book.description,
          cover_image_url: book.coverImageUrl
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapDatabaseBook(data);
    } catch (error) {
      console.error('Error adding book:', error);
      return null;
    }
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
    try {
      const { data, error } = await supabase
        .from('books')
        .update({
          title: updates.title,
          author: updates.author,
          isbn: updates.isbn,
          subject: updates.subject,
          rack_number: updates.rackNumber,
          total_copies: updates.totalCopies,
          available_copies: updates.availableCopies,
          published_year: updates.publishedYear,
          description: updates.description,
          cover_image_url: updates.coverImageUrl
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.mapDatabaseBook(data);
    } catch (error) {
      console.error('Error updating book:', error);
      return null;
    }
  }

  async deleteBook(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      return false;
    }
  }

  async borrowBook(bookId: string, borrowerInfo: {
    name: string;
    email?: string;
    phone?: string;
    dueDate: string;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Start transaction
      const { data: book, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single();

      if (bookError || !book || book.available_copies <= 0) {
        return { success: false, error: 'Book not available for borrowing' };
      }

      // Create borrowing record
      const { error: borrowError } = await supabase
        .from('borrowing_records')
        .insert({
          book_id: bookId,
          borrower_name: borrowerInfo.name,
          borrower_email: borrowerInfo.email,
          borrower_phone: borrowerInfo.phone,
          due_date: borrowerInfo.dueDate,
          notes: borrowerInfo.notes,
          issued_by: authService.getCurrentAuth().user?.id
        });

      if (borrowError) throw borrowError;

      // Update book availability
      const { error: updateError } = await supabase
        .from('books')
        .update({ available_copies: book.available_copies - 1 })
        .eq('id', bookId);

      if (updateError) throw updateError;

      return { success: true };
    } catch (error) {
      console.error('Error borrowing book:', error);
      return { success: false, error: 'Failed to process book borrowing' };
    }
  }

  async returnBook(recordId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get borrowing record
      const { data: record, error: recordError } = await supabase
        .from('borrowing_records')
        .select('*, books(*)')
        .eq('id', recordId)
        .single();

      if (recordError || !record) {
        return { success: false, error: 'Borrowing record not found' };
      }

      // Update borrowing record
      const { error: updateRecordError } = await supabase
        .from('borrowing_records')
        .update({ returned_at: new Date().toISOString() })
        .eq('id', recordId);

      if (updateRecordError) throw updateRecordError;

      // Update book availability
      const { error: updateBookError } = await supabase
        .from('books')
        .update({ 
          available_copies: record.books.available_copies + 1 
        })
        .eq('id', record.book_id);

      if (updateBookError) throw updateBookError;

      return { success: true };
    } catch (error) {
      console.error('Error returning book:', error);
      return { success: false, error: 'Failed to process book return' };
    }
  }

  async getBorrowingHistory(page = 1, limit = 10): Promise<PaginatedResponse<BorrowingRecord & { book: Book }>> {
    try {
      const offset = (page - 1) * limit;
      
      const { data: records, error, count } = await supabase
        .from('borrowing_records')
        .select(`
          *,
          books (*)
        `, { count: 'exact' })
        .order('borrowed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        data: records?.map(record => ({
          ...this.mapDatabaseBorrowingRecord(record),
          book: this.mapDatabaseBook(record.books)
        })) || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error fetching borrowing history:', error);
      return { data: [], total: 0, page, limit, totalPages: 0 };
    }
  }

  async getActiveLoans(): Promise<(BorrowingRecord & { book: Book })[]> {
    try {
      const { data: records, error } = await supabase
        .from('borrowing_records')
        .select(`
          *,
          books (*)
        `)
        .is('returned_at', null)
        .order('due_date', { ascending: true });

      if (error) throw error;

      return records?.map(record => ({
        ...this.mapDatabaseBorrowingRecord(record),
        book: this.mapDatabaseBook(record.books)
      })) || [];
    } catch (error) {
      console.error('Error fetching active loans:', error);
      return [];
    }
  }

  async reserveBook(bookId: string, reserverInfo: {
    name: string;
    email?: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days reservation

      const { error } = await supabase
        .from('reservations')
        .insert({
          book_id: bookId,
          reserver_name: reserverInfo.name,
          reserver_email: reserverInfo.email,
          reserver_phone: reserverInfo.phone,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error reserving book:', error);
      return { success: false, error: 'Failed to reserve book' };
    }
  }

  private mapDatabaseBook(dbBook: any): Book {
    return {
      id: dbBook.id,
      title: dbBook.title,
      author: dbBook.author,
      isbn: dbBook.isbn,
      subject: dbBook.subject,
      rackNumber: dbBook.rack_number,
      isAvailable: dbBook.available_copies > 0,
      totalCopies: dbBook.total_copies,
      availableCopies: dbBook.available_copies,
      publishedYear: dbBook.published_year || new Date().getFullYear(),
      description: dbBook.description,
      coverImageUrl: dbBook.cover_image_url,
      createdAt: dbBook.created_at,
      updatedAt: dbBook.updated_at
    };
  }

  private mapDatabaseBorrowingRecord(dbRecord: any): BorrowingRecord {
    return {
      id: dbRecord.id,
      bookId: dbRecord.book_id,
      borrowerName: dbRecord.borrower_name,
      borrowerEmail: dbRecord.borrower_email,
      borrowerPhone: dbRecord.borrower_phone,
      borrowedAt: dbRecord.borrowed_at,
      dueDate: dbRecord.due_date,
      returnedAt: dbRecord.returned_at,
      isOverdue: dbRecord.is_overdue,
      overdueDays: dbRecord.overdue_days,
      fineAmount: dbRecord.fine_amount,
      notes: dbRecord.notes,
      issuedBy: dbRecord.issued_by
    };
  }

  getCurrentAuth(): AuthState {
    return this.currentAuth;
  }

  setRole(role: 'student' | 'admin'): void {
    this.currentAuth.role = role;
  }
}

export const bookService = new BookService();