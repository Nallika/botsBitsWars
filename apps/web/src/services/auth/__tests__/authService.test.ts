import { login, register, logout, check } from '../authService';

jest.mock('../../api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockApiClient = require('../../api/client').apiClient;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        data: {
          success: true,
          user: { id: '123', email: 'test@example.com' },
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await login('test@example.com', 'password123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw ApiError when login fails', async () => {
      const errorMessage = 'Invalid credentials';
      mockApiClient.post.mockRejectedValue(new Error(errorMessage));

      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow(
        Error
      );
      await expect(login('test@example.com', 'wrongpassword')).rejects.toThrow(
        errorMessage
      );
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const mockResponse = {
        data: {
          success: true,
          user: { id: '456', email: 'newuser@example.com' },
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await register('newuser@example.com', 'password123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', {
        email: 'newuser@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw ApiError when registration fails', async () => {
      const errorMessage = 'Email already exists';
      mockApiClient.post.mockRejectedValue(new Error(errorMessage));

      await expect(
        register('existing@example.com', 'password123')
      ).rejects.toThrow(Error);
      await expect(
        register('existing@example.com', 'password123')
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockApiClient.post.mockResolvedValue({ data: { success: true } });

      await logout();

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should handle logout error', async () => {
      const errorMessage = 'Logout failed';
      mockApiClient.post.mockRejectedValue(new Error(errorMessage));

      await expect(logout()).rejects.toThrow(errorMessage);
    });
  });

  describe('check', () => {
    it('should return true when user is authenticated', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { authenticated: true },
      });

      const result = await check();

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { authenticated: false },
      });

      const result = await check();

      expect(result).toBe(false);
    });

    it('should return false when request fails', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      const result = await check();

      expect(result).toBe(false);
    });
  });
});
