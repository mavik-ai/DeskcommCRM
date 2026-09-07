// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import { resolveSentryDsn } from "./lib/sentry/dsn";
import { sentryScrubHooks } from "./lib/sentry/scrub";

// `undefined` quando SENTRY_DSN está vazio ou `off` — e `dsn: undefined` deixa o
// SDK inerte, sem envio nenhum. Não existe destino de fábrica: ver lib/sentry/dsn.ts.
const sentryDsn = resolveSentryDsn(
  typeof window !== "undefined" ? window.__PUBLIC_ENV__?.SENTRY_DSN : undefined,
);

Sentry.init({
  dsn: sentryDsn,

  // O replay DE ERRO é o que explica o stack trace, e o replayIntegration() sem
  // argumentos já aplica maskAllText/blockAllMedia. As amostragens são cheias
  // porque o único destino possível é o Sentry de quem opera a instalação.
  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: 1,
  enableLogs: true,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: false,

  ...sentryScrubHooks,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
