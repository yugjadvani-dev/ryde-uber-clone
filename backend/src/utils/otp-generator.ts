import * as crypto from 'crypto';

const digits = '0123456789';
const lowerCaseAlphabets = 'abcdefghijklmnopqrstuvwxyz';
const upperCaseAlphabets = lowerCaseAlphabets.toUpperCase();
const specialChars = '#!&@';

export interface GenerateOptions {
  digits?: boolean; // Include digits
  lowerCaseAlphabets?: boolean; // Include lowercase alphabets
  upperCaseAlphabets?: boolean; // Include uppercase alphabets
  specialChars?: boolean; // Include special characters
}

/**
 * Generate a password or OTP based on the specified length and options.
 * @param length - Length of the password or OTP. Defaults to 10.
 * @param options - Options to customize the character set used for generation.
 * @returns A randomly generated password or OTP string.
 */
export function otpGenerator(length: number = 10, options: GenerateOptions = {}): string {
  const {
    digits: includeDigits = true,
    lowerCaseAlphabets: includeLowerCase = true,
    upperCaseAlphabets: includeUpperCase = true,
    specialChars: includeSpecialChars = true,
  } = options;

  const allowedChars =
    (includeDigits ? digits : '') +
    (includeLowerCase ? lowerCaseAlphabets : '') +
    (includeUpperCase ? upperCaseAlphabets : '') +
    (includeSpecialChars ? specialChars : '');

  if (!allowedChars) {
    throw new Error('No characters available to generate password. Check your options.');
  }

  let password = '';
  while (password.length < length) {
    const charIndex = crypto.randomInt(0, allowedChars.length);

    // Prevent the first character from being '0' if digits are included
    if (password.length === 0 && includeDigits && allowedChars[charIndex] === '0') {
      continue;
    }

    password += allowedChars[charIndex];
  }

  return password;
}
