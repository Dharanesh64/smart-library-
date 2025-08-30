import React, { useState, useEffect } from 'react';
import { Book, SearchFilters, PaginatedResponse } from '../types';
import { bookService } from '../services/bookService';
import { SearchBar } from './SearchBar';
import { BookList } from './BookList';
import { Pagination } from './Pagination';
import { BookOpen, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentPortal: React.FC = () => {
  const [books, setBooks] = useState<PaginatedResponse<Book>>({
    data: [],
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadBooks();
  }, [currentPage]);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await bookService.getAllBooks(currentPage, 12);
      setBooks(data);
    } catch (error) {
      toast.error('Failed to load books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (filters: SearchFilters) => {
    setIsLoading(true);
    try {
      const results = await bookService.searchBooks(
        filters.query, 
        filters.filterType, 
        filters.availableOnly,
        1,
        12
      );
      setBooks(results);
      setCurrentPage(1);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const availableBooks = books.data.filter(book => book.isAvailable).length;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to the Library
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover your next favorite book from our extensive collection
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-medium">{books.total}</span>
              <span>Total Books</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium">{availableBooks}</span>
              <span>Available Now</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="font-medium">24/7</span>
              <span>Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-4xl mx-auto">
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      </div>
      
      {/* Books Grid */}
      <BookList 
        books={books.data}
        isAdmin={false}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {books.totalPages > 1 && (
        <Pagination
          currentPage={books.page}
          totalPages={books.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};