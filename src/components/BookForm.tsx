import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, Upload } from 'lucide-react';
import { Book } from '../types';
import { subjects } from '../data/mockData';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface BookFormProps {
  book?: Book;
  onSave: (book: Omit<Book, 'id'> | Book) => void;
  onCancel: () => void;
}

const bookSchema = yup.object({
  title: yup.string()
    .required('Title is required')
    .min(2, 'Title must be at least 2 characters'),
  author: yup.string()
    .required('Author is required')
    .min(2, 'Author must be at least 2 characters'),
  isbn: yup.string()
    .required('ISBN is required')
    .matches(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'Please enter a valid ISBN'),
  subject: yup.string().required('Subject is required'),
  rackNumber: yup.string()
    .required('Rack number is required')
    .matches(/^[A-Z]\d+-\d+$/, 'Rack number format: A1-01'),
  totalCopies: yup.number()
    .required('Total copies is required')
    .min(1, 'Must have at least 1 copy')
    .integer('Must be a whole number'),
  availableCopies: yup.number()
    .required('Available copies is required')
    .min(0, 'Cannot be negative')
    .integer('Must be a whole number'),
  publishedYear: yup.number()
    .required('Published year is required')
    .min(1000, 'Invalid year')
    .max(new Date().getFullYear() + 1, 'Cannot be in the future'),
  description: yup.string().optional(),
  coverImageUrl: yup.string().url('Must be a valid URL').optional()
});

export const BookForm: React.FC<BookFormProps> = ({ book, onSave, onCancel }) => {
  const form = useForm({
    resolver: yupResolver(bookSchema),
    defaultValues: {
      title: book?.title || '',
      author: book?.author || '',
      isbn: book?.isbn || '',
      subject: book?.subject || '',
      rackNumber: book?.rackNumber || '',
      totalCopies: book?.totalCopies || 1,
      availableCopies: book?.availableCopies || 1,
      publishedYear: book?.publishedYear || new Date().getFullYear(),
      description: book?.description || '',
      coverImageUrl: book?.coverImageUrl || ''
    }
  });

  const handleSubmit = (data: any) => {
    const bookData = {
      ...data,
      isAvailable: data.availableCopies > 0,
    };

    if (book) {
      onSave({ ...bookData, id: book.id } as Book);
    } else {
      onSave(bookData);
    }
  };

  // Watch totalCopies to validate availableCopies
  const totalCopies = form.watch('totalCopies');
  
  useEffect(() => {
    const availableCopies = form.getValues('availableCopies');
    if (availableCopies > totalCopies) {
      form.setValue('availableCopies', totalCopies);
    }
  }, [totalCopies, form]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {book ? 'Edit Book' : 'Add New Book'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                {...form.register('title')}
                type="text"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter book title"
              />
              {form.formState.errors.title && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                {...form.register('author')}
                type="text"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter author name"
              />
              {form.formState.errors.author && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.author.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ISBN *
              </label>
              <input
                {...form.register('isbn')}
                type="text"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="978-0123456789"
              />
              {form.formState.errors.isbn && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.isbn.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                {...form.register('subject')}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              {form.formState.errors.subject && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rack Number *
              </label>
              <input
                {...form.register('rackNumber')}
                type="text"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="A1-01"
              />
              {form.formState.errors.rackNumber && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.rackNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Published Year *
              </label>
              <input
                {...form.register('publishedYear')}
                type="number"
                min="1000"
                max={new Date().getFullYear() + 1}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {form.formState.errors.publishedYear && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.publishedYear.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Copies *
              </label>
              <input
                {...form.register('totalCopies')}
                type="number"
                min="1"
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {form.formState.errors.totalCopies && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.totalCopies.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Copies *
              </label>
              <input
                {...form.register('availableCopies')}
                type="number"
                min="0"
                max={totalCopies}
                className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              {form.formState.errors.availableCopies && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.availableCopies.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image URL (Optional)
            </label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                {...form.register('coverImageUrl')}
                type="url"
                className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://example.com/book-cover.jpg"
              />
            </div>
            {form.formState.errors.coverImageUrl && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.coverImageUrl.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              {...form.register('description')}
              rows={3}
              className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter book description..."
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{book ? 'Update Book' : 'Add Book'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};