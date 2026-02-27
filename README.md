# Casa Blanca — Plataforma SaaS Multi-Tenant para Delivery

**Casa Blanca** é uma plataforma SaaS completa para restaurantes e estabelecimentos de alimentação, oferecendo landing pages personalizáveis, sistema de pedidos via WhatsApp, painel administrativo para lojistas e um Super Admin para gestão da plataforma.

---

## Visão Geral

O sistema opera em uma arquitetura **multi-tenant**, onde cada lojista (tenant) possui sua própria landing page pública, cardápio digital, carrinho de compras e painel de gestão. O Super Admin da plataforma gerencia todos os tenants, configurações globais, cobrança e design system.

| Camada | Descrição |
|--------|-----------|
| **Landing Page Pública** | Vitrine do restaurante com cardápio, carrinho, pedidos via WhatsApp |
| **Dashboard do Lojista** | Gestão de pedidos, catálogo, cupons, entregas, notificações |
| **Painel Super Admin** | Gestão de tenants, billing, design system, configurações globais |

---

## Stack Tecnológica

| Tecnologia | Uso |
|------------|-----|
| **React 19** + **TypeScript** | Frontend SPA |
| **Tailwind CSS 4** + **shadcn/ui** | Estilização e componentes UI |
| **tRPC 11** + **Superjson** | API type-safe end-to-end |
| **Express 4** | Servidor HTTP |
| **Drizzle ORM** | ORM para banco de dados |
| **MySQL / TiDB** | Banco de dados relacional |
| **Vite** | Build tool e dev server |
| **Vitest** | Framework de testes |
| **AWS S3** | Armazenamento de arquivos |
| **Manus OAuth** | Autenticação |

---

## Estrutura de Pastas

```
casa-blanca/
├── client/                    # Frontend React
│   ├── public/                # Assets estáticos
│   ├── src/
│   │   ├── _core/hooks/       # Hook de autenticação (useAuth)
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   ├── ui/            # Componentes shadcn/ui
│   │   │   ├── ClientAdminLayout.tsx   # Layout do Dashboard do Lojista
│   │   │   ├── SuperAdminLayout.tsx    # Layout do Super Admin
│   │   │   ├── SuspensionBlocker.tsx   # Hard block para lojas suspensas
│   │   │   ├── BillingPopupModal.tsx   # Modal de aviso de cobrança
│   │   │   ├── ProductModal.tsx        # Modal Giant Card (glassmorphism)
│   │   │   ├── CartDrawer.tsx          # Carrinho lateral
│   │   │   └── ...
│   │   ├── contexts/          # React contexts
│   │   ├── data/              # Dados estáticos (designPresets.ts)
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # tRPC client, utilitários
│   │   ├── pages/
│   │   │   ├── Home.tsx               # Página inicial (redirect)
│   │   │   ├── StoreLanding.tsx       # Landing page pública do tenant
│   │   │   ├── Login.tsx              # Login com email/senha
│   │   │   ├── Onboarding.tsx         # Wizard de onboarding
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/         # Páginas do Dashboard do Lojista
│   │   │   │   │   ├── Dashboard.tsx
│   │   │   │   │   ├── Orders.tsx
│   │   │   │   │   ├── Catalog.tsx
│   │   │   │   │   ├── Notifications.tsx
│   │   │   │   │   └── ...
│   │   │   │   └── super/             # Páginas do Super Admin
│   │   │   │       ├── Dashboard.tsx
│   │   │   │       ├── Tenants.tsx
│   │   │   │       ├── Design.tsx
│   │   │   │       ├── Billing.tsx
│   │   │   │       └── ...
│   │   ├── store/             # Zustand stores (useSiteData, etc.)
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Rotas e layout principal
│   │   ├── main.tsx           # Entry point + providers
│   │   └── index.css          # Variáveis CSS globais e tema
│   └── index.html
├── server/
│   ├── _core/                 # Infraestrutura (NÃO editar)
│   │   ├── context.ts         # Contexto tRPC (user, session)
│   │   ├── env.ts             # Variáveis de ambiente
│   │   ├── llm.ts             # Integração LLM
│   │   ├── imageGeneration.ts # Geração de imagens
│   │   ├── notification.ts    # Notificações do owner
│   │   ├── oauth.ts           # Manus OAuth
│   │   └── trpc.ts            # Instância tRPC base
│   ├── routers/               # Routers tRPC por domínio
│   │   ├── analytics.ts       # Métricas e gráficos
│   │   ├── auth.ts            # Login email/senha
│   │   ├── billing.ts         # Cobrança, popup, notificações
│   │   ├── catalog.ts         # Categorias e produtos
│   │   ├── coupons.ts         # Cupons de desconto
│   │   ├── globalSettings.ts  # Configurações globais
│   │   ├── onboarding.ts      # Wizard de onboarding
│   │   ├── orders.ts          # Pedidos e entregas
│   │   ├── store.ts           # Dados da loja (horários, etc.)
│   │   ├── tenants.ts         # CRUD de tenants + design
│   │   └── users.ts           # Gestão de usuários
│   ├── db.ts                  # Query helpers (Drizzle)
│   ├── routers.ts             # Agregador de routers
│   └── storage.ts             # Helpers S3 (storagePut/storageGet)
├── drizzle/
│   ├── schema.ts              # Schema do banco de dados
│   ├── relations.ts           # Relações entre tabelas
│   └── migrations/            # Migrações SQL
├── shared/
│   ├── const.ts               # Constantes compartilhadas
│   └── types.ts               # Types compartilhados
├── package.json
├── vite.config.ts
├── drizzle.config.ts
├── vitest.config.ts
├── tsconfig.json
├── ARCHITECTURE.md            # Documentação de arquitetura
├── CONTRIBUTING.md            # Guia de contribuição
└── todo.md                    # Tracking de features
```

---

## Pré-requisitos

O projeto requer **Node.js 22+** e **pnpm** como gerenciador de pacotes. O banco de dados é **MySQL/TiDB** (conexão via `DATABASE_URL`).

---

## Instalação e Setup

```bash
# 1. Clonar o repositório
git clone https://github.com/<owner>/cb.git
cd cb

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
# Copie o .env.example e preencha as variáveis necessárias
cp .env.example .env

# 4. Rodar migrações do banco de dados
pnpm db:push

# 5. Iniciar o servidor de desenvolvimento
pnpm dev
```

---

## Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `pnpm dev` | Inicia o servidor de desenvolvimento com hot reload |
| `build` | `pnpm build` | Build de produção (Vite + esbuild) |
| `start` | `pnpm start` | Inicia o servidor de produção |
| `check` | `pnpm check` | Verifica tipos TypeScript |
| `test` | `pnpm test` | Executa todos os testes (Vitest) |
| `db:push` | `pnpm db:push` | Gera e aplica migrações do banco |
| `format` | `pnpm format` | Formata código com Prettier |

---

## Variáveis de Ambiente

As variáveis são injetadas automaticamente pela plataforma Manus em produção. Para desenvolvimento local, configure no `.env`:

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `DATABASE_URL` | Connection string MySQL/TiDB | Sim |
| `JWT_SECRET` | Segredo para assinatura de cookies de sessão | Sim |
| `VITE_APP_ID` | ID da aplicação Manus OAuth | Sim |
| `OAUTH_SERVER_URL` | URL base do servidor OAuth | Sim |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login OAuth | Sim |
| `BUILT_IN_FORGE_API_URL` | URL das APIs internas Manus | Sim |
| `BUILT_IN_FORGE_API_KEY` | Token bearer para APIs internas (server) | Sim |
| `VITE_FRONTEND_FORGE_API_KEY` | Token bearer para APIs internas (frontend) | Sim |
| `OWNER_OPEN_ID` | OpenID do proprietário da plataforma | Sim |
| `OWNER_NAME` | Nome do proprietário | Sim |

---

## Arquitetura Multi-Tenant

O sistema utiliza uma arquitetura multi-tenant com isolamento por `tenantId`. Cada tenant possui seu próprio conjunto de dados (produtos, categorias, pedidos, configurações visuais) isolado no mesmo banco de dados.

### Hierarquia de Roles

| Role | Acesso | Descrição |
|------|--------|-----------|
| `super_admin` | Tudo | Proprietário da plataforma Casa Blanca |
| `client_admin` | Dashboard do tenant | Lojista — gerencia sua própria loja |
| `user` | Landing page pública | Cliente final (visitante) |

### Fluxo de Dados Principal

```
Cliente → Landing Page → Carrinho → WhatsApp (pedido)
                                  ↓
Lojista → Dashboard → Pedidos → Gestão
                              ↓
Super Admin → Tenants → Billing → Design System
```

---

## Design System

O Design System é gerenciado pelo Super Admin e permite personalização completa da landing page de cada tenant. As configurações são organizadas em seções:

| Seção | Controles |
|-------|-----------|
| **2.1 Cabeçalho** | Cores do header, logo, navegação |
| **2.2 Seção Hero** | Background, textos, CTA |
| **2.3 Template de Cards** | Cores dos cards de produto |
| **2.4 Modal de Produto** | Glassmorphism, cores do modal giant card |
| **2.5 Fundo da Seção** | Background da vitrine |
| **2.6 Seção Sobre** | Cores e tipografia |
| **2.7 Rodapé** | Cores do footer |
| **2.8 Toast** | Notificações visuais |

O sistema inclui **18 presets visuais** prontos para diferentes nichos (pizzaria, sushi, churrascaria, padaria, etc.) que aplicam todas as variáveis com um clique.

---

## Sistema de Cobrança (Billing)

O billing opera em duas fases:

**Fase 1 — Mensalidade Atrasada (overdue):** Card de alta prioridade na aba de Notificações do Dashboard do lojista, com botões de ação via WhatsApp. Badge vermelho pulsante no sino de notificações. Modal dismissível ao entrar no painel.

**Fase 2 — Suspensão (suspended):** Componente `SuspensionBlocker` com overlay full-screen, extreme blur (`backdrop-blur: 64px`), modal infechável (sem X, sem ESC, sem click-outside). Botões WhatsApp para regularização. O lojista não consegue acessar nenhuma funcionalidade.

---

## Testes

O projeto possui **570 testes** cobrindo todos os routers do backend. Os testes são executados com Vitest.

```bash
# Rodar todos os testes
pnpm test

# Rodar testes em modo watch
pnpm vitest

# Rodar testes de um arquivo específico
pnpm vitest server/routers/billing.test.ts
```

---

## Licença

MIT
