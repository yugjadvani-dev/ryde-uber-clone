/**
 * User Type Definition Module
 * Defines the structure of a user object in the application.
 * Used for type checking and ensuring data consistency.
 */

import { Role } from './role.type';

/**
 * User interface representing the structure of a user in the system
 * 
 * @interface UserType
 * @property {string} id - Unique identifier for the user
 * @property {string} firstname - User's first name
 * @property {string} lastname - User's last name
 * @property {string} email - User's email address (must be unique)
 * @property {string} password - User's hashed password
 * @property {Role} role - User's role in the system (user/driver/admin)
 * @property {boolean} is_verified - Whether the user's email is verified
 * 
 * @example
 * const user: UserType = {
 *   id: "123",
 *   firstname: "John",
 *   lastname: "Doe",
 *   email: "john@example.com",
 *   password: "$2b$10$...", // hashed password
 *   role: "user",
 *   is_verified: true
 * };
 */
export interface UserType {
  /** Unique identifier for the user */
  id: string;

  /** User's first name */
  firstname: string;

  /** User's last name */
  lastname: string;

  /** User's email address (must be unique) */
  email: string;

  /** User's hashed password */
  password: string;

  /** User's role in the system */
  role: Role;

  /** Whether the user's email is verified */
  is_verified: boolean;
}
