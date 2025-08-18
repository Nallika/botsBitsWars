import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '@repo/shared-types/src';

import { apiClient } from '../api/client';

/**
 * Login user with email and password
 * Authentication token will be stored in HTTP-only cookie automatically
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const payload: LoginRequest = { email, password };
  const response = await apiClient.post<LoginResponse>('/auth/login', payload);

  return response.data;
}

/**
 * Register new user with email and password
 * Authentication token will be stored in HTTP-only cookie automatically
 */
export async function register(
  email: string,
  password: string
): Promise<RegisterResponse> {
  const payload: RegisterRequest = { email, password };
  const response = await apiClient.post<RegisterResponse>(
    '/auth/register',
    payload
  );

  return response.data;
}

/**
 * Logout current user by clearing the authentication cookie
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

/**
 * Check if user is authenticated
 * Uses cookie-based authentication automatically
 */
export async function check(): Promise<boolean> {
  try {
    const response = await apiClient.get('/auth/me');

    return response.data.authenticated === true;
  } catch (error) {
    // If request fails, user is not authenticated
    return false;
  }
}
