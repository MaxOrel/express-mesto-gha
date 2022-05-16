class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 403;
  }
}

module.exports = ForbiddenError;
