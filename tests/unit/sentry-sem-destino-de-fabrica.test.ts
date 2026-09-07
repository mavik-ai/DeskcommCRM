/**
 * NENHUMA INSTALAÇÃO MANDA ERRO PARA UM DESTINO QUE NINGUÉM ESCOLHEU.
 *
 * ## O que se pagava
 *
 * `lib/sentry/dsn.ts` embutia um `DEFAULT_SENTRY_DSN` — o Sentry do projeto — e o
 * usava sempre que a variável vinha VAZIA. Vazio é o valor do `.env.example` e do
 * `.env.hostgator.example`, isto é: o padrão de toda instalação nova. O opt-out
 * existia (`SENTRY_DSN=off`) e estava documentado, mas exigia que o operador
 * soubesse que havia algo de que sair — e num produto revendido com a marca de
 * outra pessoa, quem instala não leu o `.env.example` de ninguém.
 *
 * O argumento do default era "visibilidade para corrigir bug que afeta todo mundo",
 * e ele já não se pagava: medido em 2026-08-10, o ingest respondeu `429` com
 * `x-sentry-rate-limits: 60::organization:suspended` a 17 de 17 tentativas. Nada
 * chegava, e cada tentativa barrada virava erro de console no browser de quem
 * hospeda.
 *
 * ## O que este arquivo guarda
 *
 * O modo de falha que se caça é o RETORNO do default — uma constante com um DSN
 * literal reaparecendo em `lib/`, em `instrumentation-client.ts` ou nos configs.
 * Ele é invisível a typecheck e a lint (é uma string válida), e o efeito vai para
 * a rede da instalação de um cliente, nunca para a tela de quem o escreveu.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { resolveSentryDsn } from "@/lib/sentry/dsn";

describe("vazio é desligado — o padrão de uma instalação nova não envia nada", () => {
  it("vazio, só espaço, undefined e null devolvem undefined (SDK inerte)", () => {
    expect(resolveSentryDsn("")).toBeUndefined();
    expect(resolveSentryDsn("   ")).toBeUndefined();
    expect(resolveSentryDsn(undefined)).toBeUndefined();
    expect(resolveSentryDsn(null)).toBeUndefined();
  });

  it("os desligamentos explícitos continuam desligando, em qualquer caixa", () => {
    for (const v of ["off", "OFF", "Off", "false", "0"]) {
      expect(resolveSentryDsn(v), `"${v}" deveria desligar`).toBeUndefined();
    }
  });

  it("um DSN de verdade passa intacto — quem quer telemetria continua tendo", () => {
    const meu = "https://abc123@o1.ingest.us.sentry.io/42";
    expect(resolveSentryDsn(meu)).toBe(meu);
    expect(resolveSentryDsn(`  ${meu}  `)).toBe(meu);
  });
});

/**
 * A VARREDURA — porque a função pode estar perfeita e o call site trazer o
 * destino de volta por fora dela.
 */
describe("nenhum DSN de Sentry está embutido no código", () => {
  const ARQUIVOS = [
    "lib/sentry/dsn.ts",
    "lib/sentry/scrub.ts",
    "instrumentation-client.ts",
    "sentry.server.config.ts",
    "sentry.edge.config.ts",
  ];

  // Um DSN do Sentry é sempre `https://<chave>@<host>/<projeto>`. O `@` depois do
  // esquema é o que o distingue de qualquer outra URL — e é o que a sonda procura.
  const DSN_LITERAL = /https:\/\/[A-Za-z0-9]+@[A-Za-z0-9.-]*sentry\.io/;

  for (const arquivo of ARQUIVOS) {
    it(`${arquivo} não carrega um DSN literal`, () => {
      const fonte = readFileSync(path.join(process.cwd(), arquivo), "utf8");
      // Comentário e teste podem citar a FORMA de um DSN; o que não pode é código
      // executável trazer um endereço real de volta. Por isso a sonda ignora as
      // linhas de comentário e mede só o que resta.
      const codigo = fonte
        .split("\n")
        .filter((l) => !/^\s*(\/\/|\/\*|\*)/.test(l))
        .join("\n");
      expect(
        DSN_LITERAL.test(codigo),
        `${arquivo} voltou a embutir um DSN. Um destino de fábrica faz TODA ` +
          `instalação nova enviar stack trace para quem o operador nunca nomeou — ` +
          `foi o defeito removido em 2026-09-07. Quem quer telemetria configura ` +
          `SENTRY_DSN com o DSN dela.`,
      ).toBe(false);
    });
  }
});
