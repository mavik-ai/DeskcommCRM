// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { resolveSentryDsn } from "./lib/sentry/dsn";
import { sentryScrubHooks } from "./lib/sentry/scrub";

// Vazio ou `off` ⇒ undefined ⇒ SDK inerte. Sem destino de fábrica (lib/sentry/dsn.ts).
const sentryDsn = resolveSentryDsn(process.env.SENTRY_DSN);

Sentry.init({
  dsn: sentryDsn,

  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: false,

  ...sentryScrubHooks,
});
