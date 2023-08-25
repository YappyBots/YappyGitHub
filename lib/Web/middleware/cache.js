module.exports = (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  } else {
    // Remove cache for the other HTTP methods to avoid stale data
    res.set('Cache-Control', 'no-store');
  }

  next();
};