import { Book, User } from '../types';

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    author: 'John Smith',
    isbn: '978-0123456789',
    subject: 'Computer Science',
    rackNumber: 'A1-01',
    isAvailable: true,
    totalCopies: 3,
    availableCopies: 2,
    publishedYear: 2022,
    description: 'Comprehensive introduction to computer science fundamentals'
  },
  {
    id: '2',
    title: 'Advanced Mathematics',
    author: 'Sarah Johnson',
    isbn: '978-0987654321',
    subject: 'Mathematics',
    rackNumber: 'B2-15',
    isAvailable: false,
    totalCopies: 2,
    availableCopies: 0,
    publishedYear: 2021,
    description: 'Advanced mathematical concepts and applications'
  },
  {
    id: '3',
    title: 'Physics: Principles and Applications',
    author: 'Dr. Michael Brown',
    isbn: '978-0456789123',
    subject: 'Physics',
    rackNumber: 'C3-08',
    isAvailable: true,
    totalCopies: 4,
    availableCopies: 3,
    publishedYear: 2023,
    description: 'Fundamental physics principles with real-world applications'
  },
  {
    id: '4',
    title: 'Organic Chemistry',
    author: 'Dr. Lisa Wang',
    isbn: '978-0789123456',
    subject: 'Chemistry',
    rackNumber: 'D1-22',
    isAvailable: true,
    totalCopies: 2,
    availableCopies: 1,
    publishedYear: 2022,
    description: 'Comprehensive guide to organic chemistry reactions and mechanisms'
  },
  {
    id: '5',
    title: 'World History: A Global Perspective',
    author: 'Prof. James Wilson',
    isbn: '978-0321654987',
    subject: 'History',
    rackNumber: 'E2-05',
    isAvailable: true,
    totalCopies: 5,
    availableCopies: 4,
    publishedYear: 2021,
    description: 'Comprehensive overview of world history from ancient to modern times'
  },
  {
    id: '6',
    title: 'Data Structures and Algorithms',
    author: 'Robert Garcia',
    isbn: '978-0654321098',
    subject: 'Computer Science',
    rackNumber: 'A1-12',
    isAvailable: false,
    totalCopies: 3,
    availableCopies: 0,
    publishedYear: 2023,
    description: 'Essential data structures and algorithmic problem-solving techniques'
  },
  {
    id: '7',
    title: 'English Literature: Classic Works',
    author: 'Dr. Emily Thompson',
    isbn: '978-0147258369',
    subject: 'Literature',
    rackNumber: 'F3-18',
    isAvailable: true,
    totalCopies: 4,
    availableCopies: 3,
    publishedYear: 2020,
    description: 'Analysis of classic English literature and literary movements'
  },
  {
    id: '8',
    title: 'Principles of Economics',
    author: 'Prof. David Lee',
    isbn: '978-0258369147',
    subject: 'Economics',
    rackNumber: 'G1-09',
    isAvailable: true,
    totalCopies: 3,
    availableCopies: 2,
    publishedYear: 2022,
    description: 'Fundamental economic principles and market analysis'
  },
  {
    id: '9',
    title: 'Molecular Biology',
    author: 'Dr. Maria Rodriguez',
    isbn: '978-0369147258',
    subject: 'Biology',
    rackNumber: 'H2-14',
    isAvailable: true,
    totalCopies: 2,
    availableCopies: 1,
    publishedYear: 2023,
    description: 'Advanced concepts in molecular biology and genetics'
  },
  {
    id: '10',
    title: 'Calculus: Theory and Applications',
    author: 'Prof. Andrew Chen',
    isbn: '978-0741852963',
    subject: 'Mathematics',
    rackNumber: 'B2-07',
    isAvailable: true,
    totalCopies: 4,
    availableCopies: 3,
    publishedYear: 2021,
    description: 'Comprehensive calculus textbook with practical applications'
  }
];

export const mockUsers: User[] = [
  {
    id: 'admin1',
    username: 'admin',
    role: 'admin',
    name: 'Library Administrator'
  },
  {
    id: 'student1',
    username: 'student',
    role: 'student',
    name: 'John Doe'
  }
];

export const subjects = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'History',
  'Literature',
  'Economics',
  'Biology'
];