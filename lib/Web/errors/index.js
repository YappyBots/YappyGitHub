class NotFoundError extends Error {
  constructor() {
    super();
    this.status = 404;
    this.name = 'Not Found';
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);

    this.status = 403;
    this.name = 'Forbidden';
  }
}

module.exports = { NotFoundError, ForbiddenError };
