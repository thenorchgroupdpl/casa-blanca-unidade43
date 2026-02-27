# Arquitetura Técnica — Casa Blanca

Este documento descreve a arquitetura técnica do sistema Casa Blanca, servindo como referência para desenvolvedores que precisam entender, manter ou estender a plataforma.

---

## 1. Visão de Alto Nível

O Casa Blanca é uma aplicação monolítica full-stack que serve tanto o frontend React quanto a API tRPC a partir do mesmo processo Node.js. O Vite atua como middleware de desenvolvimento, enquanto em produção os assets estáticos são servidos pelo Express.

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Landing Page  │  │  Dashboard   │  │   Super Admin    │  │
│  │  (Público)    │  │  (Lojista)   │  │  (Plataforma)   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         └─────────────────┼────────────────────┘            │
│                           │ tRPC (HTTP Batch)               │
└───────────────────────────┼─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                     EXPRESS SERVER                           │
│                           │                                 │
│  ┌────────────────────────┼──────────────────────────────┐  │
│  │              tRPC Router (/api/trpc)                   │  │
│  │                                                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │  │  auth    │ │ catalog  │ │  orders  │ │ billing  │ │  │
│  │  │  users   │ │ tenants  │ │  store   │ │ coupons  │ │  │
│  │  │  onboard │ │ settings │ │ analytics│ │          │ │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌────────────────────────┼──────────────────────────────┐  │
│  │              Drizzle ORM + MySQL/TiDB                  │  │
│  └────────────────────────┼──────────────────────────────┘  │
│                           │                                 │
│  ┌──────────────┐  ┌──────┴───────┐  ┌──────────────────┐  │
│  │   AWS S3     │  │   Database   │  │  Manus APIs      │  │
│  │  (Storage)   │  │  (MySQL)     │  │  (LLM, OAuth)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Camadas da Aplicação

### 2.1 Frontend (client/)

O frontend é uma SPA React 19 com roteamento via **wouter**. A comunicação com o backend é exclusivamente via **tRPC** — não há chamadas fetch/axios manuais.

**Contextos e Providers:** O `main.tsx` configura o `trpc.Provider` e `QueryClientProvider` (TanStack Query). A autenticação é gerenciada pelo hook `useAuth()` que consome `trpc.auth.me.useQuery()`.

**Roteamento:** Definido em `App.tsx` com três áreas principais — rotas públicas (landing page, login), rotas do lojista (`/admin/dashboard/*`) e rotas do super admin (`/admin/super/*`).

**Estado Global:** O `useSiteData` (Zustand) armazena os dados da landing page pública. O estado do servidor é gerenciado pelo TanStack Query via tRPC.

**Layouts:** Dois layouts principais — `ClientAdminLayout` para o dashboard do lojista (com sidebar, top bar, SSE para pedidos em tempo real) e `SuperAdminLayout` para o painel do super admin.

### 2.2 Backend (server/)

O servidor Express expõe o tRPC em `/api/trpc`. Cada domínio de negócio tem seu próprio router em `server/routers/`.

**Procedures:** Três níveis de acesso — `publicProcedure` (sem autenticação), `protectedProcedure` (requer login, injeta `ctx.user`), e `adminProcedure` (requer `super_admin` ou `client_admin`).

**Contexto:** Construído em `server/_core/context.ts` a partir do cookie de sessão JWT. O `ctx.user` contém `id`, `role`, `tenantId`, `name`, `email`.

### 2.3 Banco de Dados (drizzle/)

O schema é definido em `drizzle/schema.ts` usando Drizzle ORM. As tabelas principais são:

| Tabela | Descrição | Relações |
|--------|-----------|----------|
| `users` | Autenticação e autorização | → `tenants` (via tenantId) |
| `tenants` | Dados do tenant (loja) | → `categories`, `products`, `orders` |
| `categories` | Categorias do cardápio | → `products` |
| `products` | Produtos com variações | → `categories`, `tenants` |
| `orders` | Pedidos dos clientes | → `tenants` |
| `coupons` | Cupons de desconto | → `tenants` |
| `global_settings` | Configurações da plataforma | — |
| `notifications` | Notificações do sistema | → `tenants` |

O campo `landingDesign` (JSON) na tabela `tenants` armazena todas as configurações visuais do Design System, incluindo cores, fontes, textos e configurações de seções.

### 2.4 Storage (server/storage.ts)

Arquivos são armazenados no AWS S3 via helpers `storagePut()` e `storageGet()`. O banco de dados armazena apenas metadados (URL, key, mime type). As credenciais S3 são injetadas automaticamente pela plataforma.

---

## 3. Fluxos Críticos

### 3.1 Autenticação

O sistema suporta dois métodos de login: **Manus OAuth** (para super admin) e **email/senha** (para lojistas). O fluxo de email/senha usa bcrypt para hash e JWT para sessão via cookie httpOnly.

```
Login → POST /api/trpc/auth.loginWithEmail
      → Verifica email + bcrypt.compare(senha, hash)
      → Gera JWT → Set-Cookie (httpOnly, secure)
      → Redirect para Dashboard
```

### 3.2 Pedido via WhatsApp

O fluxo de pedido é stateless — o carrinho é gerenciado no frontend (Zustand), e ao finalizar, uma mensagem formatada é enviada via URL `wa.me` com todos os itens, endereço e total.

```
Cliente → Adiciona ao carrinho → Preenche dados
        → Gera mensagem WhatsApp formatada
        → Abre wa.me em nova aba
        → Pedido registrado no banco (status: pending)
```

### 3.3 Design System (Super Admin)

O Design System permite personalização completa da landing page. As alterações são salvas em `landingDesign` (JSON) no tenant e refletidas em tempo real no preview.

```
Super Admin → Design.tsx → Altera cor/fonte
            → onChange → Atualiza state local
            → Save → trpc.tenants.updateDesign.mutate()
            → Salva landingDesign no banco
            → StoreLanding.tsx lê landingDesign
            → Mapeia para inline styles
```

### 3.4 Billing e Suspensão

```
Super Admin altera status → billing_status: "overdue" ou "suspended"
                          ↓
Lojista acessa Dashboard:
  - overdue  → Badge vermelho + Card na aba Notificações
  - suspended → SuspensionBlocker (hard block total)
                          ↓
Botões WhatsApp → Lojista contata suporte
                          ↓
Super Admin libera → billing_status: "active"
                          ↓
Acesso restaurado automaticamente
```

---

## 4. Padrões e Convenções

### 4.1 Nomenclatura

Os routers tRPC seguem o padrão `domínio.ação` (ex: `catalog.listProducts`, `orders.create`, `tenants.updateDesign`). Componentes React usam PascalCase. Arquivos de página ficam em `pages/`, componentes reutilizáveis em `components/`.

### 4.2 Tratamento de Erros

Erros tRPC são tipados e propagados automaticamente para o frontend. O `QueryClient` intercepta erros de autenticação (`UNAUTHED_ERR_MSG`) e redireciona para login. Erros de autorização usam `TRPCError({ code: 'FORBIDDEN' })`.

### 4.3 Otimização de Queries

Queries tRPC usam `staleTime` para evitar refetches desnecessários. Mutations usam `onSuccess → invalidate()` para atualizar caches. Inputs de query devem ser estabilizados com `useState` ou `useMemo` para evitar loops infinitos.

### 4.4 Armazenamento de Timestamps

Todos os timestamps de negócio são armazenados como UTC (Unix milliseconds) no banco. A conversão para timezone local é feita apenas no frontend via `toLocaleString()`.

---

## 5. Integrações Externas

| Serviço | Uso | Configuração |
|---------|-----|-------------|
| **Manus OAuth** | Login do super admin | `OAUTH_SERVER_URL`, `VITE_APP_ID` |
| **AWS S3** | Upload de imagens/arquivos | Credenciais injetadas automaticamente |
| **Manus LLM** | Geração de texto (invokeLLM) | `BUILT_IN_FORGE_API_KEY` |
| **Manus Image Gen** | Geração de imagens | `BUILT_IN_FORGE_API_KEY` |
| **WhatsApp API** | Pedidos e suporte (via wa.me) | Número configurável por tenant |
| **Google Maps** | Localização da loja | Proxy Manus (sem API key) |

---

## 6. Segurança

O sistema implementa as seguintes medidas de segurança: cookies httpOnly e secure para sessão JWT, isolamento de dados por `tenantId` em todas as queries, validação de role em procedures protegidas, hash bcrypt para senhas, e CORS configurado para o domínio da aplicação. O `SuspensionBlocker` impede acesso ao Dashboard de lojas suspensas no nível do frontend, enquanto as procedures do backend também verificam o status do tenant.
