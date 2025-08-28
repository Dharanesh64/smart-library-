import { Book } from '../types';
import { mockBooks } from '../data/mockData';

class BookService {
  private books: Book[] = [...mockBooks];

  getAllBooks(): Book[] {
    return this.books;
  }

  searchBooks(query: string, filterType: string): Book[] {
    if (!query.trim()) return this.books;

    return this.books.filter(book => {
      const searchQuery = query.toLowerCase();
      
      switch (filterType) {
        case 'title':
          return book.title.toLowerCase().includes(searchQuery);
        case 'author':
          return book.author.toLowerCase().includes(searchQuery);
        case 'isbn':
          return book.isbn.toLowerCase().includes(searchQuery);
        case 'subject':
          return book.subject.toLowerCase().includes(searchQuery);
        default:
          return (
            book.title.toLowerCase().includes(searchQuery) ||
            book.author.toLowerCase().includes(searchQuery) ||
            book.isbn.toLowerCase().includes(searchQuery) ||
            book.subject.toLowerCase().includes(searchQuery)
          );
      }
    });
  }

  addBook(book: Omit<Book, 'id'>): Book {
    const newBook: Book = {
      ...book,
      id: Date.now().toString()
    };
    this.books.push(newBook);
    return newBook;
  }

  updateBook(id: string, updates: Partial<Book>): Book | null {
    const bookIndex = this.books.findIndex(book => book.id === id);
    if (bookIndex === -1) return null;

    this.books[bookIndex] = { ...this.books[bookIndex], ...updates };
    return this.books[bookIndex];
  }

  deleteBook(id: string): boolean {
    const bookIndex = this.books.findIndex(book => book.id === id);
    if (bookIndex === -1) return false;

    this.books.splice(bookIndex, 1);
    return true;
  }

  getBookById(id: string): Book | null {
    return this.books.find(book => book.id === id) || null;
  }

  updateAvailability(id: string, isAvailable: boolean, availableCopies: number): Book | null {
    return this.updateBook(id, { isAvailable, availableCopies });
  }
}

export const bookService = new BookService();