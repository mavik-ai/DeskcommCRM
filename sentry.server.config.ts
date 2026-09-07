// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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

// Transparência de telemetria: uma linha no boot dizendo o que está ativo. O
// padrão agora é o silêncio, então a linha existe para o caso INVERSO — alguém
// configurou um destino e precisa ver isso no log, não descobrir na fatura.
if (!sentryDsn) {
  console.info("[telemetria] Desligada — nenhum erro sai desta instalação.");
} else {
  console.info("[telemetria] Erros sendo enviados ao Sentry configurado em SENTRY_DSN.");
}
