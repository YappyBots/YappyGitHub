const crypto = require('crypto');

const sigHeaderName = 'X-Hub-Signature-256';
const sigHashAlg = 'sha256';
const ghWebhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

if (!ghWebhookSecret) {
  Log.warn(
    'GitHub | No app webhook secret set! Webhooks will not be verified.'
  );
}

const checkSecret = (req, secret) => {
  const header = req.get(sigHeaderName);

  if (!secret || !header) {
    return false;
  }

  const sig = Buffer.from(header || '', 'utf8');
  const hmac = crypto.createHmac(sigHashAlg, secret);
  const digest = Buffer.from(
    `${sigHashAlg}=${hmac.update(req.rawBody).digest('hex')}`,
    'utf8'
  );

  return sig.length === digest.length && crypto.timingSafeEqual(digest, sig);
};

const verifyWebhookSecret = (req, res, next) => {
  if (!ghWebhookSecret) return next();
  if (!req.rawBody) {
    return next('Request body empty');
  }

  if (!checkSecret(req, ghWebhookSecret)) {
    return next(401);
  }

  return next();
};

module.exports = { verifyWebhookSecret, checkSecret };
