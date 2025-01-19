/**
 * Role Type Definition
 * Defines the possible user roles in the application.
 * Used for role-based access control (RBAC) throughout the system.
 * 
 * @typedef {('user' | 'driver' | 'admin')} Role
 * 
 * @description
 * - user: Regular passenger who can book rides
 * - driver: Verified driver who can accept and complete rides
 * - admin: System administrator with full access privileges
 */

export type Role = 'user' | 'driver' | 'admin';
