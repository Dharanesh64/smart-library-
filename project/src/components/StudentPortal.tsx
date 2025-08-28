import React, { useState, useEffect } from 'react';
import { Book, SearchFilters } from '../types';
import { bookService } from '../services/bookService';
import { SearchBar } from './SearchBar';
import { BookList } from './BookList';

export const StudentPortal: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to the Library</h1>
        <p className="text-lg text-gray-600">Find your next favorite book from our collection</p>
      </div>

      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      
      <BookList 
        books={filteredBooks}
        isAdmin={false}
        isLoading={isLoading}
      />
    </div>
  );
};