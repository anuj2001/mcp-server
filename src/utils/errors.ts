export class McpError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'McpError';
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  MISSING_PERMISSIONS: 'MISSING_PERMISSIONS',
  INVALID_INPUT: 'INVALID_INPUT',
  API_ERROR: 'API_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  NETWORK_ERROR: 'NETWORK_ERROR'
};
