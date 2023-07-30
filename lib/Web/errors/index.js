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

class BadRequestError extends Error {
  constructor(message) {
    super(message);

    this.status = 400;
    this.name = 'Bad Request';
  }
}

module.exports = { NotFoundError, ForbiddenError, BadRequestError };
