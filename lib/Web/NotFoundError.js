class NotFoundError extends Error {
  constructor() {
    super();
    this.status = 404;
    this.name = 'Not Found';
  }
}
