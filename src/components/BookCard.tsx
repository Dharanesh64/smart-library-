import React, { useState } from 'react';
import { Book as BookIcon, MapPin, Calendar, CheckCircle, XCircle, Edit, Trash2, UserPlus, Clock, AlertTriangle } from 'lucide-react';
import { Book } from '../types';
import { BorrowBookModal } from './BorrowBookModal';
import { format, addDays } from 'date-fns';

interface BookCardProps {
  book: Book;
  isAdmin?: boolean;
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: string) => void;
  onBorrow?: (bookId: string, borrowerInfo: any) => Promise<{ success: boolean; error?: string }>;
}

export const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  isAdmin = false, 
  onEdit, 
  onDelete,
  onBorrow
}) => {
  const [showBorrowModal, setShowBorrowModal] = useState(false);

  const getEstimatedReturnDate = () => {
    if (book.isAvailable) return null;
    
    // Estimate return date as 14 days from now (typical loan period)
    return format(addDays(new Date(), 14), 'MMM dd, yyyy');
  };

  const handleBorrowBook = async (borrowerInfo: any) => {
    if (onBorrow) {
      const result = await onBorrow(book.id, borrowerInfo);
      if (result.success) {
        setShowBorrowModal(false);
        return true;
      }
      return false;
    }
    return false;
  };

  const estimatedReturn = getEstimatedReturnDate();

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 hover:border-gray-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {book.coverImageUrl ? (
              <img 
                src={book.coverImageUrl} 
                alt={book.title}
                className="w-16 h-20 object-cover rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-16 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center shadow-sm">
                <BookIcon className="h-8 w-8 text-blue-600" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">{book.title}</h3>
                <p className="text-gray-600 mb-2 font-medium">by {book.author}</p>
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{book.publishedYear}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Rack {book.rackNumber}</span>
                  </div>
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                    {book.subject}
                  </span>
                </div>
                
                {book.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{book.description}</p>
                )}
                
                <p className="text-xs text-gray-500 mb-3">ISBN: {book.isbn}</p>
              </div>
              
              <div className="flex flex-col items-end space-y-3 ml-4">
                <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium ${
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
                
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {book.availableCopies} of {book.totalCopies}
                  </div>
                  <div className="text-xs text-gray-500">copies available</div>
                </div>

                {!book.isAvailable && estimatedReturn && (
                  <div className="text-center">
                    <div className="flex items-center space-x-1 text-xs text-orange-600">
                      <Clock className="h-3 w-3" />
                      <span>Est. return:</span>
                    </div>
                    <div className="text-xs text-gray-600">{estimatedReturn}</div>
                  </div>
                )}
                
                <div className="flex flex-col space-y-2">
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => onEdit?.(book)}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      
                      {book.isAvailable && book.availableCopies > 0 && (
                        <button
                          onClick={() => setShowBorrowModal(true)}
                          className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                        >
                          <UserPlus className="h-3 w-3" />
                          <span>Issue</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => onDelete?.(book.id)}
                        className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Delete</span>
                      </button>
                    </>
                  ) : (
                    book.isAvailable && book.availableCopies > 0 && (
                      <button
                        onClick={() => setShowBorrowModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Reserve</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBorrowModal && (
        <BorrowBookModal
          book={book}
          isAdmin={isAdmin}
          onBorrow={handleBorrowBook}
          onCancel={() => setShowBorrowModal(false)}
        />
      )}
    </>
  );
};