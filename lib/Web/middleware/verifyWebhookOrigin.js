const IPCIDR = require('ip-cidr');
const NodeCache = require('node-cache');
const GitHub = require('../../GitHub');
const { ForbiddenError } = require('../errors');
const asyncHandler = require('../utils/asyncHandler');

const cache = new NodeCache();

const HOUR_IN_SECONDS = 60 * 60;
const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
const BYPASS = !!process.env.GITHUB_WEBHOOK_DISABLE_IP_CHECK;

if (BYPASS) Log.warn('GitHub | Webhook IP check disabled!');

// If we have a cached list, use it if it is less than a week old.
// If we don't have a cached list but we did attempt to fetch, do not retry if within an hour.
const getAllowed = async () => {
  const cached = cache.get('allowed');

  if (cached) return cached;
  if (cache.get('failed')) return;

  let hooks;

  try {
    Log.info('GitHub | Fetching allowed IPs');
    hooks = (await GitHub.getMeta()).hooks;
  } catch (err) {
    Log.error('GitHub | Failed to fetch allowed IPs');
    Log.error(err);
  }

  if (!hooks?.length) return cache.set('failed', true, HOUR_IN_SECONDS);

  const ips = hooks.map((hook) => new IPCIDR(hook));

  cache.set('allowed', ips, WEEK_IN_SECONDS);

  return ips;
};

module.exports = asyncHandler(async (req, res, next) => {
  if (req.method !== 'POST') return next();

  res.type('json');

  if (BYPASS) return next();

  const allowedIPs = await getAllowed();
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const allowed = allowedIPs?.some?.((range) => range.contains(clientIP));

  if (!allowed) {
    return next(new ForbiddenError());
  }

  return next();
});
