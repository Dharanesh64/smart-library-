import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, TrendingUp, Users, Clock } from 'lucide-react';
import { Book, SearchFilters } from '../types';
import { bookService } from '../services/bookService';
import { SearchBar } from './SearchBar';
import { BookList } from './BookList';
import { BookForm } from './BookForm';

export const AdminDashboard: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = () => {
    const allBooks = bookService.getAllBooks();
    setBooks(allBooks);
    setFilteredBooks(allBooks);
  };

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let results = bookService.searchBooks(filters.query, filters.filterType);
    
    if (filters.availableOnly) {
      results = results.filter(book => book.isAvailable);
    }
    
    setFilteredBooks(results);
    setIsLoading(false);
  };

  const handleAddBook = () => {
    setEditingBook(undefined);
    setShowForm(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowForm(true);
  };

  const handleSaveBook = (bookData: Omit<Book, 'id'> | Book) => {
    if ('id' in bookData) {
      bookService.updateBook(bookData.id, bookData);
    } else {
      bookService.addBook(bookData);
    }
    
    loadBooks();
    setShowForm(false);
    setEditingBook(undefined);
  };

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      bookService.deleteBook(bookId);
      loadBooks();
    }
  };

  const handleUpdateAvailability = (bookId: string, isAvailable: boolean, availableCopies: number) => {
    bookService.updateAvailability(bookId, isAvailable, availableCopies);
    loadBooks();
  };

  const stats = {
    totalBooks: books.length,
    availableBooks: books.filter(b => b.isAvailable).length,
    totalCopies: books.reduce((sum, book) => sum + book.totalCopies, 0),
    issuedBooks: books.reduce((sum, book) => sum + (book.totalCopies - book.availableCopies), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
              <p className="text-sm text-gray-600">Total Books</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.availableBooks}</p>
              <p className="text-sm text-gray-600">Available Books</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.totalCopies}</p>
              <p className="text-sm text-gray-600">Total Copies</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.issuedBooks}</p>
              <p className="text-sm text-gray-600">Issued Books</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1 max-w-2xl">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
        <button
          onClick={handleAddBook}
          className="sm:ml-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Book</span>
        </button>
      </div>

      {/* Book List */}
      <BookList 
        books={filteredBooks}
        isAdmin={true}
        isLoading={isLoading}
        onEdit={handleEditBook}
        onDelete={handleDeleteBook}
        onUpdateAvailability={handleUpdateAvailability}
      />

      {/* Book Form Modal */}
      {showForm && (
        <BookForm
          book={editingBook}
          onSave={handleSaveBook}
          onCancel={() => {
            setShowForm(false);
            setEditingBook(undefined);
          }}
        />
      )}
    </div>
  );
};