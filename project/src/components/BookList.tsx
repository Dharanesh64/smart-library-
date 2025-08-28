import React from 'react';
import { Book as BookIcon, Search } from 'lucide-react';
import { Book } from '../types';
import { BookCard } from './BookCard';

interface BookListProps {
  books: Book[];
  isAdmin?: boolean;
  isLoading?: boolean;
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: string) => void;
  onUpdateAvailability?: (bookId: string, isAvailable: boolean, availableCopies: number) => void;
}

export const BookList: React.FC<BookListProps> = ({ 
  books, 
  isAdmin = false,
  isLoading = false,
  onEdit,
  onDelete,
  onUpdateAvailability 
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Searching books...</span>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
        <p className="text-gray-600">Try adjusting your search criteria or browse all available books.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookIcon className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900">
            {books.length} book{books.length !== 1 ? 's' : ''} found
          </h2>
        </div>
        
        {books.length > 0 && (
          <div className="text-sm text-gray-600">
            {books.filter(book => book.isAvailable).length} available
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {books.map((book) => (
          <BookCard 
            key={book.id} 
            book={book}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
            onUpdateAvailability={onUpdateAvailability}
          />
        ))}
      </div>
    </div>
  );
};