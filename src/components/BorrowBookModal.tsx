import React, { useState } from 'react';
import { X, UserPlus, Calendar, Phone, Mail, User } from 'lucide-react';
import { Book } from '../types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { addDays, format } from 'date-fns';
import toast from 'react-hot-toast';

interface BorrowBookModalProps {
  book: Book;
  isAdmin: boolean;
  onBorrow: (borrowerInfo: {
    name: string;
    email?: string;
    phone?: string;
    dueDate: string;
    notes?: string;
  }) => Promise<boolean>;
  onCancel: () => void;
}

const borrowSchema = yup.object({
  name: yup.string()
    .required('Borrower name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup.string()
    .email('Please enter a valid email address')
    .optional(),
  phone: yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number')
    .optional(),
  dueDate: yup.string()
    .required('Due date is required'),
  notes: yup.string().optional()
});

export const BorrowBookModal: React.FC<BorrowBookModalProps> = ({
  book,
  isAdmin,
  onBorrow,
  onCancel
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: yupResolver(borrowSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      dueDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'), // Default 14 days
      notes: ''
    }
  });

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const success = await onBorrow(data);
      if (success) {
        toast.success(isAdmin ? 'Book issued successfully' : 'Book reserved successfully');
      } else {
        toast.error(isAdmin ? 'Failed to issue book' : 'Failed to reserve book');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isAdmin ? 'Issue Book' : 'Reserve Book'}
              </h2>
              <p className="text-sm text-gray-600">{book.title}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isAdmin ? 'Borrower Name' : 'Your Name'} *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...form.register('name')}
                type="text"
                className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter full name"
              />
            </div>
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...form.register('email')}
                type="email"
                className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter email address"
              />
            </div>
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...form.register('phone')}
                type="tel"
                className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            {form.formState.errors.phone && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.phone.message}</p>
            )}
          </div>

          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  {...form.register('dueDate')}
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              {form.formState.errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.dueDate.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              {...form.register('notes')}
              rows={2}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isLoading ? 'Processing...' : (isAdmin ? 'Issue Book' : 'Reserve Book')}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};