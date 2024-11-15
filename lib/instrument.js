const YappyGitHub = require('./Util/YappyGitHub');

if (process.env.SENTRY) {
  console.log(`Sentry | Initializing...`);

  const Sentry = require('@sentry/node');
  const tracesSampleRate = Number(process.env.SENTRY_SAMPLE_RATE) || 0;

  Sentry.init({
    dsn: process.env.SENTRY,
    release: YappyGitHub.git.release,
    environment:
      process.env.NODE_ENV === 'production' ? 'production' : 'development',
    integrations: [
      Sentry.httpIntegration({ tracing: true }),
      Sentry.expressIntegration(),
      Sentry.contextLinesIntegration(),
      Sentry.onUncaughtExceptionIntegration(),
      Sentry.onUnhandledRejectionIntegration(),
      Sentry.nativeNodeFetchIntegration(),
    ],
    tracesSampleRate,
    autoSessionTracking: false,
    defaultIntegrations: false,
  });

  console.log(`Sentry | Initialized (sample rate = ${tracesSampleRate})`);
}
