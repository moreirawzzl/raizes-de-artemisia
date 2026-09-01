# Raízes de Artemísia — E-commerce (Next.js + Prisma)

Loja completa da marca **Raízes de Artemísia**, com loja, carrinho, checkout via WhatsApp,
autenticação de clientes e painel administrativo.

## Stack
Next.js 15 (App Router) · React 19 · TypeScript · TailwindCSS · Prisma · PostgreSQL ·
NextAuth v5 · React Hook Form · Zod · Framer Motion

## 🚀 Teste rápido (5 minutos, sem criar conta em nada)

Esse projeto já vem configurado com **SQLite** (um banco de dados que é só um arquivo,
sem precisar instalar servidor nenhum). É só rodar, na pasta do projeto:

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Pronto. Abra **http://localhost:3000**, clique em "Acesso administrativo" (ou vá direto em
`/admin`) e entre com:

Essa conta é criada automaticamente pelo comando `npm run db:seed` (ele lê o `.env` e
grava o usuário admin no arquivo `dev.db`, com a senha já protegida por hash bcrypt —
nunca fica salva em texto puro). Rodar `db:seed` de novo não duplica, ele percebe que
o admin já existe.

Requisito: apenas o **Node.js 20+** instalado na sua máquina. Nada mais.

## 1. Pré-requisitos
- Node.js 20+
- Para uso local/teste: nenhum banco externo é necessário (usa SQLite, como acima)
- Para publicar de verdade (produção): um banco PostgreSQL — veja "Colocar no ar" abaixo

## 2. Configurar o projeto (mesma coisa do teste rápido acima)

```bash
npm install
cp .env.example .env
```

O `.env.example` já vem preenchido para teste local (`DATABASE_URL="file:./dev.db"`,
`WHATSAPP_NUMBER`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`). Gere apenas o `AUTH_SECRET`:

```bash
openssl rand -base64 32
```
e cole o resultado no `.env`.

## 3. Criar as tabelas e o usuário admin

```bash
npx prisma migrate dev --name init
npm run db:seed
```

## 4. Rodar localmente

```bash
npm run dev
```

Acesse http://localhost:3000 — a loja abre para qualquer visitante,
`/admin` exige login com a conta admin acima.

## 5. Colocar no ar (deploy)

O SQLite é ótimo pra testar, mas **não funciona na Vercel** (ambiente serverless não
mantém arquivos). Antes de publicar de verdade:

1. Crie um banco Postgres grátis — [Neon](https://neon.tech) ou [Supabase](https://supabase.com), 2 minutos.
2. Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"`.
3. No `.env` (e depois no painel da Vercel), troque `DATABASE_URL` para a connection string do Postgres.
4. Suba o código para um repositório no GitHub.
5. Crie um projeto na [Vercel](https://vercel.com), conecte o repositório e configure as mesmas variáveis de ambiente.
6. Rode `npx prisma migrate deploy` e depois `npm run db:seed` (uma vez) apontando para o banco de produção.

⚠️ **Upload de imagens**: neste protótipo as fotos de produto são salvas em `public/uploads`.
Isso funciona rodando localmente ou em servidor próprio, mas **não persiste na Vercel**
(ambiente serverless). Para produção real, troque `src/app/api/upload/route.ts` por um
upload para Cloudinary, S3 ou Vercel Blob — a estrutura já está isolada nesse único arquivo
para facilitar a troca.

## O que já está pronto
- Cadastro (usuário, e-mail, senha) com senha forte obrigatória e hash bcrypt
- Login/logout com sessão (NextAuth), rotas `/admin` e `/carrinho` protegidas por middleware
- Loja com busca instantânea e filtros: preço (menor/maior), mais/menos vendidos,
  mais/menos vistos, mais recentes/antigos, A-Z/Z-A
- Página de produto estilo iFood (fotos, descrição, quantidade, adicionar ao carrinho, relacionados)
- Carrinho com subtotal e total, persistido no banco por usuário
- Checkout que redireciona ao WhatsApp (5511978912732) com a mensagem formatada
- Painel admin: dashboard (membros, produtos, visualizações, vendas, receita, mais
  vendidos/vistos, novos usuários, últimos pedidos), CRUD completo de produtos com
  upload múltiplo de fotos e campo de preço com máscara monetária

## O que foi deixado como próximo passo (fora do escopo inicial, mas fácil de adicionar depois)
- Verificação de e-mail e recuperação de senha (a estrutura de auth já suporta isso)
- Lista de desejos / favoritos (o modelo `Favorite` já existe no schema, falta a UI)
- Depoimentos, newsletter, páginas de FAQ/Termos/Privacidade (conteúdo institucional)
- SEO avançado (sitemap.xml, robots.txt), Google Analytics e Meta Pixel
- Duplicar/ocultar produto (o campo `hidden` já existe no schema, falta o botão na UI)

Se quiser, posso implementar qualquer um desses itens em seguida.

---

## 🆕 Novidades desta versão

- **Sons de interface**: cliques, sucesso, erro e finalização de compra tocam sons curtos e suaves (gerados por código, sem arquivos de áudio). Pode ser desativado em Configurações.
- **Correção de bug real**: antes, se você mudasse a quantidade no carrinho bem perto de finalizar, a mensagem do WhatsApp podia sair com a quantidade antiga (condição de corrida entre salvar a alteração e finalizar o pedido). Agora o checkout sempre usa exatamente o que está na tela, em tempo real.
- **Correção de pop-up bloqueado**: o botão do WhatsApp agora abre a janela de forma síncrona, então navegadores não bloqueiam mais o pop-up.
- **Cupons de desconto** (`/admin/cupons`): crie cupons com um controle de arrastar para definir a porcentagem (1–100%) e uma data de validade. O cliente aplica o código na página do carrinho e o desconto é recalculado em tempo real.
- **Calculadora de custos** (`/admin/calculadora`): lance os gastos com materiais e veja receita bruta, custo total e receita líquida (bruto − custos) automaticamente, com a margem em %.
- **Tema claro/escuro**: em Configurações, o usuário escolhe entre os dois, mantendo a identidade visual da marca (verde principal, verde secundário, bege) — só invertendo as superfícies para tons escuros elegantes.
- **Configurações da conta** (`/configuracoes`): tema, tamanho da fonte, ativar/desativar sons e animações, trocar/criar senha, trocar foto de perfil, e ativar/desativar login com Google — tudo salvo permanentemente na conta.
- **Perfil do usuário** (`/perfil`): mostra foto, nome, e-mail, pedidos feitos e total gasto — funciona tanto para clientes quanto para a conta admin.
- **Login com Google**: clique em "Entrar com Google" para criar a conta automaticamente com nome, e-mail e foto do Google. Na primeira vez, é oferecida a opção (não obrigatória) de criar também uma senha do site. Requer configurar `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no `.env` (veja abaixo) — sem isso, o botão simplesmente fica inativo e o resto do site funciona normal.
- **Esqueci minha senha** (`/esqueci-senha`): gera um código de 6 dígitos. **Por enquanto, o código aparece na própria tela por 10 segundos**, só para você testar o fluxo sem precisar configurar envio de e-mail ainda — antes de publicar de verdade, isso precisa ser trocado por um envio real por e-mail (Resend, Postmark, SendGrid etc.), o que podemos fazer depois.
- Animações discretas (Framer Motion) nos cards de produto — desativáveis em Configurações.

### Configurar o login com Google (opcional)
1. Acesse https://console.cloud.google.com/apis/credentials
2. Crie um "OAuth Client ID" do tipo "Web application"
3. Em "Authorized redirect URIs" adicione: `http://localhost:3000/api/auth/callback/google` (e depois a URL de produção, trocando o domínio)
4. Copie o Client ID e o Client Secret para o `.env`:
   ```
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   ```

### Importante: banco de dados mudou de estrutura
Como adicionamos tabelas novas (cupons, custos de material, código de recuperação de senha) e campos novos no usuário, é preciso recriar o banco local:

```bash
rm -f prisma/dev.db
rm -rf prisma/migrations
npx prisma migrate dev --name novidades
npm run db:seed
```
# raizes-de-artemisia
 
 