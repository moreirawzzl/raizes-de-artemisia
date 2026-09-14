# Raízes de Artemísia — Guia do Projeto (leia antes de mexer em qualquer coisa)

E-commerce artesanal em produção na Vercel. Já passou por várias sessões de
IA diferentes — este documento existe pra você não repetir erros já feitos
antes, nem duplicar coisa que já existe.

## Stack técnica
- Next.js 15 (App Router) — manter na linha 15.x, NÃO migrar pra 16 sem
  pedido explícito (risco de breaking changes não testados)
- TypeScript, Tailwind CSS
- Prisma ORM + PostgreSQL (hospedado no Neon)
- NextAuth v5 (beta) — e-mail/senha + Google OAuth
- Nodemailer (Gmail) para e-mails transacionais
- Framer Motion para animações
- Deploy: Vercel, conectado ao GitHub (push na main = deploy automático)

## ⚠️ Armadilhas já encontradas — não repita
1. **`auth.ts` fica na RAIZ do projeto**, ao lado de `package.json` — NÃO em
   `src/`. Um agente anterior editou o arquivo errado por assumir isso.
2. **Nomes exatos das variáveis de ambiente** (não use nomes "genéricos"
   parecidos): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`,
   `NEXTAUTH_URL`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `DATABASE_URL`,
   `WHATSAPP_NUMBER`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BLOB_READ_WRITE_TOKEN`,
   `CRON_SECRET`, `OPENAI_API_KEY` (opcional). NÃO usar `GOOGLE_ID`,
   `NEXTAUTH_SECRET` ou variações — já causou confusão antes.
3. **SEMPRE salvar arquivos como UTF-8 sem BOM.** O projeto já teve
   corrupção de acentos (mojibake, tipo "Artem├¡sia" em vez de "Artemísia")
   espalhada por vários arquivos por causa disso.
4. **Next.js precisa ficar na versão 15.5.9 ou mais recente da linha 15**
   (corrige CVE-2025-66478, crítica). Se atualizar, use
   `npx fix-react2shell-next` em vez de editar a versão manualmente à mão —
   já rolou erro de digitação (`15.5.23` virou `15.5.3` sem querer).
5. **Nunca use `npm audit fix --force`** sem supervisão — já quase quebrou o
   projeto pulando versões major sem avisar.
6. **Não deixe scripts de debug/diagnóstico no repositório.** Um agente
   anterior deixou ~25 arquivos soltos (`.ethereal_creds.json`,
   `check_*.js`, `patch_*.ts` etc.) commitados sem querer. Sempre limpe
   arquivos temporários de teste antes do commit final.
7. **Existe um sistema de reset "seguro" (data de corte, não apaga nada) E
   um "factory reset" (destrutivo, apaga pedidos de verdade)** — são coisas
   DIFERENTES, em rotas diferentes (`/api/admin/reset-revenue` vs
   `/api/admin/factory-reset`). Não confundir nem misturar a lógica dos dois.

## Identidade visual (seguir sempre)
- Verde principal `#556B4F`, verde secundário `#8A9A7B`, fundo `#F8F6F1`,
  bege claro `#DCCFB9`, bege escuro `#C8BDAA`
- Fontes: Cormorant Garamond (`font-display`, títulos) e Montserrat
  (`font-body`, texto)
- Tom: minimalista, artesanal, elegante, acolhedor — sem exagero visual
- Tema claro/escuro via atributo `data-theme` no `<html>`
  (`SettingsProvider.tsx`) — testar qualquer UI nova nos dois temas
- Sons de interface via `useSettings().playSound(nome)` —
  "click"|"toggle"|"open"|"close"|"add"|"success"|"error"|"checkout"

## O que já existe (não recriar do zero — confira antes)

**Autenticação**: e-mail/senha + Google, sessão de 24h, recuperação de
senha por e-mail com código de 6 dígitos, banimento de usuário (com e-mail
de aviso), promoção de usuário a admin pelo próprio painel
(`/admin/usuarios`).

**Loja**: produtos com busca/filtros, carrinho (só esvazia quando pedido é
CONFIRMED — não no checkout), favoritos, cupons de desconto, checkout via
WhatsApp, avaliações com estrelas (só após pedido DELIVERED).

**Pedidos**: status AWAITING_PAYMENT → CONFIRMED → DELIVERED (ou CANCELED),
numeração sequencial, painel completo em `/admin/pedidos` (confirmar,
cancelar, reabrir, marcar entregue, excluir).

**Chat**: bidirecional cliente↔admin (`/chat` e `/admin/conversas`), com
edição de mensagem (janela de 15 min), denúncia e exclusão de mensagem,
moderação em 2 camadas — filtro local de palavrão (`sanitizeMessage`,
funciona sempre) + API de moderação da OpenAI pra conteúdo grave (só
funciona com `OPENAI_API_KEY` configurada).

**Painel admin**: dashboard com métricas, calculadora de custo de material,
cupons (com slider de %), gestão de usuários, busca de receita por período,
reset seguro + factory reset, página de avisos/broadcast (notificação +
e-mail pra todos), página de atividades/changelog.

**Automação por e-mail**: cron diário (`/api/cron/daily-reminders`,
protegido por `CRON_SECRET`) para carrinho abandonado (24h+ parado) e
reengajamento de cliente sumido (60+ dias sem login).

**Notificações no site**: sino no Navbar, dispara em: mudança de status de
pedido, resposta no chat, aviso de broadcast, produto novo (se marcado).

## Pendências conhecidas / a verificar
- Login com Google: reportado como quebrado, causa ainda não confirmada —
  verificar `auth.ts` (local certo!) e as variáveis de ambiente na Vercel
  antes de qualquer coisa
- `OPENAI_API_KEY` não configurada ainda — moderação de conteúdo grave
  (ameaça/ódio) não funciona até isso ser resolvido; o filtro de palavrão
  comum funciona independente disso
- Página "Sobre Nós" existe no código (`src/app/sobre-nos`) mas está SEM
  link no menu (removida a pedido do usuário) — não reativar sem confirmar
  com ele antes

## Regras gerais pra qualquer agente trabalhando aqui
1. Rode `npm run build` antes de considerar qualquer tarefa concluída
2. Um commit por tarefa/mudança lógica, com mensagem descritiva — nunca um
   commit gigante misturando tudo
3. Antes de criar algo, procure se já existe (o projeto é grande e tem
   muita coisa já pronta — duplicar gera confusão)
4. Nunca coloque valores reais de senha/chave/token direto no código —
   sempre via `process.env`
5. Nunca modifique `.env` de um jeito que apague ou renomeie variável
   existente sem avisar isso claramente no resumo final
6. Ao terminar, sempre dê um resumo dizendo: o que foi feito, o que já
   existia (não recriado), e o que precisa de ação manual do usuário fora
   do código (Vercel, Google Cloud Console, OpenAI, Neon)