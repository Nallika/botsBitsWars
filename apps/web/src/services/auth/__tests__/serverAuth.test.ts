import { isAuthenticated } from '../serverAuth';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockCookies = require('next/headers').cookies;

describe('serverAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAuthenticated', () => {
    it('should return true when auth-token cookie exists', async () => {
      const mockGet = jest.fn().mockReturnValue({
        value: 'valid-token-value',
      });
      mockCookies.mockReturnValue({
        get: mockGet,
      });

      const result = await isAuthenticated();

      expect(mockGet).toHaveBeenCalledWith('auth-token');
      expect(result).toBe(true);
    });

    it('should return false when auth-token cookie does not exist', async () => {
      const mockGet = jest.fn().mockReturnValue(undefined);
      mockCookies.mockReturnValue({
        get: mockGet,
      });

      const result = await isAuthenticated();

      expect(mockGet).toHaveBeenCalledWith('auth-token');
      expect(result).toBe(false);
    });
  });
});
