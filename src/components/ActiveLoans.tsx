import React, { useState, useEffect } from 'react';
import { Users, Calendar, AlertTriangle, CheckCircle, Phone, Mail, DollarSign } from 'lucide-react';
import { BorrowingRecord, Book } from '../types';
import { bookService } from '../services/bookService';
import { format, isAfter, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

export const ActiveLoans: React.FC = () => {
  const [activeLoans, setActiveLoans] = useState<(BorrowingRecord & { book: Book })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadActiveLoans();
  }, []);

  const loadActiveLoans = async () => {
    setIsLoading(true);
    try {
      const loans = await bookService.getActiveLoans();
      setActiveLoans(loans);
    } catch (error) {
      toast.error('Failed to load active loans');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnBook = async (recordId: string) => {
    if (window.confirm('Mark this book as returned?')) {
      try {
        const result = await bookService.returnBook(recordId);
        if (result.success) {
          toast.success('Book returned successfully');
          loadActiveLoans();
        } else {
          toast.error(result.error || 'Failed to return book');
        }
      } catch (error) {
        toast.error('An error occurred while returning the book');
      }
    }
  };

  const getStatusInfo = (record: BorrowingRecord) => {
    const dueDate = new Date(record.dueDate);
    const today = new Date();
    const daysUntilDue = differenceInDays(dueDate, today);

    if (record.isOverdue) {
      return {
        status: 'overdue',
        color: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
        text: `Overdue by ${record.overdueDays} days`
      };
    } else if (daysUntilDue <= 1) {
      return {
        status: 'due-soon',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
        text: daysUntilDue === 0 ? 'Due today' : 'Due tomorrow'
      };
    } else {
      return {
        status: 'active',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        text: `Due in ${daysUntilDue} days`
      };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading active loans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">Active Loans</h2>
        </div>
        <div className="text-sm text-gray-600">
          {activeLoans.length} active loans
        </div>
      </div>

      {activeLoans.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active loans</h3>
          <p className="text-gray-600">All books are currently available in the library.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {activeLoans.map((loan) => {
            const statusInfo = getStatusInfo(loan);
            const StatusIcon = statusInfo.icon;

            return (
              <div key={loan.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {loan.book.title}
                            </h3>
                            <p className="text-gray-600 mb-2">by {loan.book.author}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>ISBN: {loan.book.isbn}</span>
                              <span>Rack: {loan.book.rackNumber}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.text}
                            </span>
                            
                            {loan.fineAmount > 0 && (
                              <div className="flex items-center text-sm text-red-600">
                                <DollarSign className="h-4 w-4 mr-1" />
                                ${loan.fineAmount.toFixed(2)} fine
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-900">Borrower Information</h4>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-2" />
                                {loan.borrowerName}
                              </div>
                              {loan.borrowerEmail && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="h-4 w-4 mr-2" />
                                  {loan.borrowerEmail}
                                </div>
                              )}
                              {loan.borrowerPhone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {loan.borrowerPhone}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-900">Loan Details</h4>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                Borrowed: {format(new Date(loan.borrowedAt), 'MMM dd, yyyy')}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                Due: {format(new Date(loan.dueDate), 'MMM dd, yyyy')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {loan.notes && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{loan.notes}</p>
                          </div>
                        )}

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleReturnBook(loan.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Mark as Returned</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};