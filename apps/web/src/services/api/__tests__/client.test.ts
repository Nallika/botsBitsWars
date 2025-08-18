import MockAdapter from 'axios-mock-adapter';

import { apiClient } from '../client';

// Mock axios adapter for real request testing
const mockAxios = new MockAdapter(apiClient);

describe('apiClient', () => {
  beforeEach(() => {
    mockAxios.reset();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be configured with correct defaults', () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(apiClient.defaults.timeout).toBe(10000);
    expect(apiClient.defaults.withCredentials).toBe(true);
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should log errors in development environment', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      configurable: true,
    });

    const consoleErrorSpy = jest.spyOn(console, 'error');
    mockAxios.onGet('/error').reply(500);

    await expect(apiClient.get('/error')).rejects.toThrow();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ API Error: GET /error - 500'
    );
  });

  it('should not log in production environment', async () => {
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      configurable: true,
    });

    const consoleErrorSpy = jest.spyOn(console, 'error');
    mockAxios.onGet('/error').reply(500);

    await expect(apiClient.get('/error')).rejects.toThrow();

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle network connection errors', async () => {
    mockAxios.onGet('/test').networkError();

    await expect(apiClient.get('/test')).rejects.toThrow(
      'Network error. Please check your connection.'
    );
  });

  it('should handle timeout errors', async () => {
    mockAxios.onGet('/test').timeout();

    await expect(apiClient.get('/test')).rejects.toThrow(
      'Request timed out. Please try again.'
    );
  });

  it('should handle server errors with custom message', async () => {
    mockAxios.onPost('/auth/login').reply(400);

    await expect(
      apiClient.post('/auth/login', { email: 'test' })
    ).rejects.toThrow('Invalid request. Please check your input.');
  });

  it('should handle server errors with custom message', async () => {
    mockAxios.onPost('/auth/login').reply(400, {
      error: 'Invalid credentials provided.',
    });

    await expect(
      apiClient.post('/auth/login', { email: 'test' })
    ).rejects.toThrow('Invalid credentials provided.');
  });

  it('should handle 401 unauthorized errors', async () => {
    mockAxios.onGet('/protected').reply(401);

    await expect(apiClient.get('/protected')).rejects.toThrow(
      'Authentication required. Please log in.'
    );
  });

  it('should handle 403 forbidden errors', async () => {
    mockAxios.onDelete('/admin/users').reply(403);

    await expect(apiClient.delete('/admin/users')).rejects.toThrow(
      'Access denied.'
    );
  });

  it('should handle 404 not found errors', async () => {
    mockAxios.onGet('/nonexistent').reply(404);

    await expect(apiClient.get('/nonexistent')).rejects.toThrow(
      'Requested resource not found.'
    );
  });

  it('should handle 429 rate limit errors', async () => {
    mockAxios.onGet('/api/data').reply(429);

    await expect(apiClient.get('/api/data')).rejects.toThrow(
      'Too many requests. Please try again later.'
    );
  });

  it('should handle 500 server errors', async () => {
    mockAxios.onPost('/api/process').reply(500);

    await expect(apiClient.post('/api/process')).rejects.toThrow(
      'Server error. Please try again later.'
    );
  });

  it('should handle unknown status codes', async () => {
    mockAxios.onGet('/weird').reply(418);

    await expect(apiClient.get('/weird')).rejects.toThrow(
      'An unexpected error occurred. Please try again.'
    );
  });

  it('should handle successful responses', async () => {
    const responseData = { id: 1, name: 'Test User' };
    mockAxios.onGet('/users/1').reply(200, responseData);

    const response = await apiClient.get('/users/1');

    expect(response.data).toEqual(responseData);
    expect(response.status).toBe(200);
  });

  it('should handle ECONNREFUSED network errors specifically', async () => {
    // Create a custom error with ECONNREFUSED code
    const econnrefusedError = new Error('Network Error') as any;
    econnrefusedError.code = 'ECONNREFUSED';
    econnrefusedError.isAxiosError = true;

    mockAxios.onGet('/test').reply(() => Promise.reject(econnrefusedError));

    await expect(apiClient.get('/test')).rejects.toThrow(
      'Unable to connect to server. Please try again later.'
    );
  });
});
