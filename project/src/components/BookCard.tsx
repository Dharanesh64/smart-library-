import React from 'react';
import { Book as BookIcon, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  isAdmin?: boolean;
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: string) => void;
  onUpdateAvailability?: (bookId: string, isAvailable: boolean, availableCopies: number) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  isAdmin = false, 
  onEdit, 
  onDelete,
  onUpdateAvailability 
}) => {
  const handleIssueReturn = () => {
    if (onUpdateAvailability) {
      if (book.isAvailable && book.availableCopies > 0) {
        // Issue book
        const newAvailableCopies = book.availableCopies - 1;
        onUpdateAvailability(book.id, newAvailableCopies > 0, newAvailableCopies);
      } else if (!book.isAvailable || book.availableCopies < book.totalCopies) {
        // Return book
        const newAvailableCopies = Math.min(book.availableCopies + 1, book.totalCopies);
        onUpdateAvailability(book.id, true, newAvailableCopies);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <BookIcon className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{book.title}</h3>
              <p className="text-gray-600 mb-2">by {book.author}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{book.publishedYear}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>Rack {book.rackNumber}</span>
                </div>
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                  {book.subject}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{book.description}</p>
              <p className="text-xs text-gray-500 mb-3">ISBN: {book.isbn}</p>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                book.isAvailable 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {book.isAvailable ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                <span>{book.isAvailable ? 'Available' : 'Not Available'}</span>
              </div>
              
              <div className="text-xs text-gray-500">
                {book.availableCopies} of {book.totalCopies} copies available
              </div>
              
              {isAdmin && (
                <div className="flex flex-col space-y-1 mt-2">
                  <button
                    onClick={() => onEdit?.(book)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleIssueReturn}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      book.isAvailable && book.availableCopies > 0
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {book.isAvailable && book.availableCopies > 0 ? 'Issue' : 'Return'}
                  </button>
                  <button
                    onClick={() => onDelete?.(book.id)}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};