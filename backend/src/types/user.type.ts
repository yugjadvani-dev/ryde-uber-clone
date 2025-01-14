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
