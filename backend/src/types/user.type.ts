/**
 * User Type Definition Module
 * Defines the structure of a user object in the application.
 * Used for type checking and ensuring data consistency.
 */

import { Role } from './role.type';

export interface UserType {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role: Role;
  is_verified: boolean;
}
