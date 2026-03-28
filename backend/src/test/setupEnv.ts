/** Runs before any test file; ensures JWT utils can load without throwing. */
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret-must-be-at-least-32-characters-long';
}
