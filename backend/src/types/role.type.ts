/**
 * Role Type Definition
 * Defines the possible user roles in the application.
 * Used for role-based access control (RBAC) throughout the system.
 *
 * @description
 * - user: Regular passenger who can book rides
 * - admin: System administrator with full access privileges
 */

export type Role = 'user' | 'admin';
