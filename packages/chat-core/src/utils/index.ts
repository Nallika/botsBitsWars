// Utility functions for chat functionality
export const formatMessage = (content: string): string => {
  return content.trim();
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};
