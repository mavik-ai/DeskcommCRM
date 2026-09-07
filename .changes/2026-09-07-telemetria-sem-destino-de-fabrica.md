---
impacto: capacidade_nova
secao: alterado
titulo: Relatórios de erro não têm mais destino de fábrica — vazio agora é desligado
---

Havia um DSN do Sentry embutido no código: com `SENTRY_DSN` vazio — o padrão de
toda instalação nova — os stack traces iam para o Sentry do projeto, e sair disso
exigia saber que havia algo de que sair. O DSN embutido foi removido. Vazio agora
significa desligado, e nada sai da máquina de quem opera a menos que ele aponte o
próprio Sentry em `SENTRY_DSN`. O instalador deixou de perguntar sobre telemetria,
porque não há mais consentimento a colher — um passo a menos na instalação.
Quem já tinha um DSN próprio no `.env` não muda em nada.
