/**
 * DSN do Sentry — **sem destino embutido**. Vazio significa DESLIGADO.
 *
 * Uma instalação self-host só manda erro para onde quem a opera mandou:
 *
 *   SENTRY_DSN=  (vazio)     → desligado, nada sai da VPS (padrão)
 *   SENTRY_DSN=off           → desligado, explícito
 *   SENTRY_DSN=<seu-dsn>     → manda os erros pro SEU Sentry
 *
 * ─── Por que não existe mais um DSN de fábrica ──────────────────────────────
 *
 * Havia aqui um `DEFAULT_SENTRY_DSN` — o Sentry do projeto — usado sempre que a
 * variável vinha vazia, que é o valor do `.env.example` e do `.env.hostgator.example`.
 * O efeito prático: TODA instalação nascia enviando stack traces para um terceiro
 * que o operador nunca nomeou, e o opt-out (`SENTRY_DSN=off`) exigia que ele
 * soubesse que havia algo de que sair. Num produto que se instala na infraestrutura
 * de outra pessoa — e que se revende com a marca de outra pessoa —, o padrão certo
 * é o silêncio: quem quer telemetria liga a dela.
 *
 * O argumento que sustentava o default era "visibilidade para corrigir bug que
 * afeta todo mundo". Ele já não se pagava nem para quem o escreveu: medido em
 * 2026-08-10, o ingest respondia `429` com `x-sentry-rate-limits:
 * 60::organization:suspended` a 17 de 17 tentativas — organização suspensa por
 * cota. Nada chegava, e cada tentativa barrada virava erro de console no browser
 * de quem hospeda.
 *
 * Junto com o default saíram `isCommunityDsn` e `integracoesDoCliente`: os dois
 * existiam para RESTRINGIR o que ia para o destino de fábrica (sem trace, sem
 * replay de sessão, sem release health). Sem destino de fábrica, o único destino
 * possível é o do próprio operador — e lá o dado não sai da infraestrutura de quem
 * é dono dele, então não há o que restringir.
 *
 * O que NÃO mudou: `lib/sentry/scrub.ts` segue removendo CPF, telefone e e-mail de
 * tudo que sai. Sanitizar continua valendo mesmo quando o destino é seu.
 */
export function resolveSentryDsn(value: string | undefined | null): string | undefined {
  const v = (value ?? "").trim();
  if (v === "") return undefined;
  const desligado = v.toLowerCase();
  if (desligado === "off" || desligado === "false" || desligado === "0") return undefined;
  return v;
}
