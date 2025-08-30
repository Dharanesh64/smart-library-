export const validateISBN = (isbn: string): boolean => {
  // Remove hyphens and spaces
  const cleanISBN = isbn.replace(/[-\s]/g, '');
  
  // Check if it's ISBN-10 or ISBN-13
  if (cleanISBN.length === 10) {
    return validateISBN10(cleanISBN);
  } else if (cleanISBN.length === 13) {
    return validateISBN13(cleanISBN);
  }
  
  return false;
};

const validateISBN10 = (isbn: string): boolean => {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(isbn[i]);
    if (isNaN(digit)) return false;
    sum += digit * (10 - i);
  }
  
  const checkDigit = isbn[9];
  const calculatedCheck = (11 - (sum % 11)) % 11;
  
  return checkDigit === (calculatedCheck === 10 ? 'X' : calculatedCheck.toString());
};

const validateISBN13 = (isbn: string): boolean => {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn[i]);
    if (isNaN(digit)) return false;
    sum += digit * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = parseInt(isbn[12]);
  const calculatedCheck = (10 - (sum % 10)) % 10;
  
  return checkDigit === calculatedCheck;
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone; // Return original if can't format
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};