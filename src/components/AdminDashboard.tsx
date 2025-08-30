import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, TrendingUp, Users, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Book, SearchFilters, DashboardStats, PaginatedResponse } from '../types';
import { bookService } from '../services/bookService';
import { dashboardService } from '../services/dashboardService';
import { SearchBar } from './SearchBar';
import { BookList } from './BookList';
import { BookForm } from './BookForm';
import { BorrowingHistory } from './BorrowingHistory';
import { ActiveLoans } from './ActiveLoans';
import { Pagination } from './Pagination';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [books, setBooks] = useState<PaginatedResponse<Book>>({
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
    totalReservations: 0,
    activeReservations: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>();
  const [activeTab, setActiveTab] = useState<'books' | 'loans' | 'history'>('books');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadDashboardData();
  }, [currentPage]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [booksData, statsData] = await Promise.all([
        bookService.getAllBooks(currentPage, 10),
        dashboardService.getDashboardStats()
      ]);
      
      setBooks(booksData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
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
        10
      );
      setBooks(results);
      setCurrentPage(1);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = () => {
    setEditingBook(undefined);
    setShowForm(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setShowForm(true);
  };

  const handleSaveBook = async (bookData: Omit<Book, 'id'> | Book) => {
    try {
      let success = false;
      
      if ('id' in bookData) {
        const result = await bookService.updateBook(bookData.id, bookData);
        success = !!result;
      } else {
        const result = await bookService.addBook(bookData);
        success = !!result;
      }
      
      if (success) {
        toast.success(`Book ${editingBook ? 'updated' : 'added'} successfully`);
        loadDashboardData();
        setShowForm(false);
        setEditingBook(undefined);
      } else {
        toast.error(`Failed to ${editingBook ? 'update' : 'add'} book`);
      }
    } catch (error) {
      toast.error('An error occurred while saving the book');
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
      try {
        const success = await bookService.deleteBook(bookId);
        if (success) {
          toast.success('Book deleted successfully');
          loadDashboardData();
        } else {
          toast.error('Failed to delete book');
        }
      } catch (error) {
        toast.error('An error occurred while deleting the book');
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: {
    icon: React.ElementType;
    title: string;
    value: number;
    subtitle: string;
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          <p className="text-sm text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          icon={BookOpen}
          title="Total Books"
          value={stats.totalBooks}
          subtitle="In catalog"
          color="bg-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Available"
          value={stats.availableBooks}
          subtitle="Ready to borrow"
          color="bg-green-500"
        />
        <StatCard
          icon={Users}
          title="Borrowed"
          value={stats.borrowedBooks}
          subtitle="Currently out"
          color="bg-purple-500"
        />
        <StatCard
          icon={AlertTriangle}
          title="Overdue"
          value={stats.overdueBooks}
          subtitle="Need attention"
          color="bg-red-500"
        />
        <StatCard
          icon={Calendar}
          title="Reservations"
          value={stats.activeReservations}
          subtitle="Active requests"
          color="bg-orange-500"
        />
        <StatCard
          icon={Clock}
          title="Total Loans"
          value={stats.totalReservations}
          subtitle="All time"
          color="bg-indigo-500"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'books', label: 'Book Catalog', icon: BookOpen },
            { id: 'loans', label: 'Active Loans', icon: Users },
            { id: 'history', label: 'Borrowing History', icon: Clock }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'books' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-2xl">
              <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            </div>
            <button
              onClick={handleAddBook}
              className="sm:ml-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Plus className="h-5 w-5" />
              <span>Add Book</span>
            </button>
          </div>

          <BookList 
            books={books.data}
            isAdmin={true}
            isLoading={isLoading}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
          />

          {books.totalPages > 1 && (
            <Pagination
              currentPage={books.page}
              totalPages={books.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      {activeTab === 'loans' && <ActiveLoans />}
      {activeTab === 'history' && <BorrowingHistory />}

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