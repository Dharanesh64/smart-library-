import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { BorrowingRecord, Book, PaginatedResponse } from '../types';
import { bookService } from '../services/bookService';
import { Pagination } from './Pagination';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const BorrowingHistory: React.FC = () => {
  const [history, setHistory] = useState<PaginatedResponse<BorrowingRecord & { book: Book }>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadHistory();
  }, [currentPage]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await bookService.getBorrowingHistory(currentPage, 10);
      setHistory(data);
    } catch (error) {
      toast.error('Failed to load borrowing history');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading borrowing history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-6 w-6 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900">Borrowing History</h2>
        </div>
        <div className="text-sm text-gray-600">
          {history.total} total records
        </div>
      </div>

      {history.data.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No borrowing history</h3>
          <p className="text-gray-600">Borrowing records will appear here once books are issued.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Borrower
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fine
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.data.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.book.title}</div>
                          <div className="text-sm text-gray-500">by {record.book.author}</div>
                          <div className="text-xs text-gray-400">ISBN: {record.book.isbn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.borrowerName}</div>
                          {record.borrowerEmail && (
                            <div className="text-sm text-gray-500">{record.borrowerEmail}</div>
                          )}
                          {record.borrowerPhone && (
                            <div className="text-xs text-gray-400">{record.borrowerPhone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          Borrowed: {format(new Date(record.borrowedAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          Due: {format(new Date(record.dueDate), 'MMM dd, yyyy')}
                        </div>
                        {record.returnedAt && (
                          <div className="flex items-center text-sm text-green-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                            Returned: {format(new Date(record.returnedAt), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        {record.returnedAt ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Returned
                          </span>
                        ) : record.isOverdue ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Overdue ({record.overdueDays} days)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {record.fineAmount > 0 ? (
                        <div className="flex items-center text-sm text-red-600">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${record.fineAmount.toFixed(2)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No fine</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {history.totalPages > 1 && (
        <Pagination
          currentPage={history.page}
          totalPages={history.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};