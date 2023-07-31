// Taken from https://github.com/getsentry/sentry-javascript/issues/3284#issuecomment-838690126
const asyncHandler = (fn) => {
  const asyncFn =
    fn.length === 3
      ? (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
      : (err, req, res, next) =>
          Promise.resolve(fn(err, req, res, next)).catch(next);

  Object.defineProperty(asyncFn, 'name', {
    value: fn.name,
  });

  return asyncFn;
};

module.exports = asyncHandler;
