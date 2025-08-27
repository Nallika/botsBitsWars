import { formatMessage, generateSessionId } from '../index';

describe('utils', () => {
  describe('formatMessage', () => {
    it('trims whitespace from message content', () => {
      const result = formatMessage('  hello world  ');

      expect(result).toBe('hello world');
    });
  });

  describe('generateSessionId', () => {
    it('generates a session ID with correct format', () => {
      const sessionId = generateSessionId();

      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]{7}$/);
    });

    it('generates unique session IDs', () => {
      const sessionId1 = generateSessionId();
      const sessionId2 = generateSessionId();

      expect(sessionId1).not.toBe(sessionId2);
    });

    it('contains timestamp component', () => {
      const beforeTimestamp = Date.now();
      const sessionId = generateSessionId();
      const afterTimestamp = Date.now();

      const timestampPart = sessionId.split('_')[1];
      const extractedTimestamp = parseInt(timestampPart);

      expect(extractedTimestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(extractedTimestamp).toBeLessThanOrEqual(afterTimestamp);
    });
  });
});
