# Guia de Contribuição — Casa Blanca

Este documento descreve os padrões, fluxos de trabalho e boas práticas para contribuir com o projeto Casa Blanca. Siga estas diretrizes para manter a consistência e qualidade do código.

---

## 1. Setup do Ambiente

```bash
# Clonar e instalar
git clone https://github.com/<owner>/cb.git
cd cb
pnpm install

# Configurar banco de dados
# Preencha DATABASE_URL no .env
pnpm db:push

# Iniciar desenvolvimento
pnpm dev
```

O servidor de desenvolvimento inicia em `http://localhost:3000` com hot reload via Vite HMR.

---

## 2. Fluxo de Desenvolvimento (Build Loop)

O ciclo de desenvolvimento segue quatro pontos de contato principais, executados nesta ordem:

**Passo 1 — Schema.** Atualize as tabelas em `drizzle/schema.ts` e execute `pnpm db:push` para aplicar as migrações.

**Passo 2 — Query Helpers.** Adicione funções auxiliares em `server/db.ts` que retornam resultados brutos do Drizzle. Essas funções são reutilizadas entre procedures.

**Passo 3 — Procedures tRPC.** Crie ou estenda procedures em `server/routers/*.ts`. Escolha entre `publicProcedure` (sem auth), `protectedProcedure` (requer login) ou `adminProcedure` (requer role admin). Wire a UI com `trpc.*.useQuery/useMutation`.

**Passo 4 — Frontend.** Construa a interface usando shadcn/ui + Tailwind. Consuma os dados via hooks tRPC. Siga o Design Guide para cores e tipografia.

**Passo 5 — Testes.** Cubra as mudanças com specs Vitest em `server/*.test.ts` e execute `pnpm test`.

---

## 3. Adicionando uma Nova Feature (Checklist)

Ao implementar uma nova funcionalidade, siga este checklist:

| Etapa | Arquivo | Ação |
|-------|---------|------|
| 1. Schema | `drizzle/schema.ts` | Adicionar/alterar tabelas |
| 2. Migração | Terminal | `pnpm db:push` |
| 3. DB Helper | `server/db.ts` | Criar query helper |
| 4. Router | `server/routers/<feature>.ts` | Criar procedures |
| 5. Agregar | `server/routers.ts` | Registrar novo router |
| 6. Página | `client/src/pages/<Feature>.tsx` | Criar componente |
| 7. Rota | `client/src/App.tsx` | Registrar rota |
| 8. Testes | `server/<feature>.test.ts` | Escrever testes |
| 9. Todo | `todo.md` | Marcar como concluído |

---

## 4. Padrões de Código

### 4.1 Backend (tRPC Procedures)

```typescript
// server/routers/example.ts
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const exampleRouter = router({
  // Query pública (sem autenticação)
  list: publicProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      // Retornar dados
    }),

  // Mutation protegida (requer login)
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // ctx.user disponível aqui
      // ctx.user.role, ctx.user.tenantId, etc.
    }),
});
```

### 4.2 Frontend (Consumindo tRPC)

```tsx
// Queries
const { data, isLoading } = trpc.example.list.useQuery({ tenantId: 1 });

// Mutations com invalidação
const utils = trpc.useUtils();
const createMutation = trpc.example.create.useMutation({
  onSuccess: () => {
    utils.example.list.invalidate();
    toast.success("Criado com sucesso!");
  },
});

// Autenticação
const { user, isAuthenticated, logout } = useAuth();
```

### 4.3 Estabilização de Inputs (Evitar Loops)

```tsx
// ERRADO: Cria nova referência a cada render → loop infinito
const { data } = trpc.items.list.useQuery({ ids: [1, 2, 3] });

// CORRETO: Estabilizar com useMemo
const ids = useMemo(() => [1, 2, 3], []);
const { data } = trpc.items.list.useQuery({ ids });
```

### 4.4 Upload de Arquivos

```typescript
// Sempre usar S3, nunca armazenar bytes no banco
import { storagePut } from "../storage";

const fileKey = `${userId}-files/${fileName}-${randomSuffix()}.png`;
const { url } = await storagePut(fileKey, fileBuffer, "image/png");
// Salvar apenas url e fileKey no banco
```

---

## 5. Design System e Estilos

### 5.1 Tema e Cores

O tema é definido por variáveis CSS em `client/src/index.css`. Use sempre as variáveis semânticas (`bg-background`, `text-foreground`, `bg-card`, etc.) em vez de cores hardcoded.

Ao usar `bg-{semantic}`, sempre pareie com `text-{semantic}-foreground` para evitar texto invisível.

### 5.2 Componentes UI

Prefira componentes shadcn/ui (`@/components/ui/*`) para interações. Antes de criar um componente novo, verifique se já existe um equivalente em `client/src/components/`.

### 5.3 Design System Dinâmico

As variáveis do Design System (cores, fontes) são armazenadas em `landingDesign` no tenant. Na landing page pública, essas variáveis são mapeadas para inline styles em `StoreLanding.tsx`. Ao adicionar uma nova variável visual, siga o fluxo completo: tipo TypeScript → Design.tsx (color picker) → StoreLanding.tsx (mapeamento) → componente (consumo).

---

## 6. Estrutura de Routers

Quando um router ultrapassar ~150 linhas, divida-o em arquivos menores dentro de `server/routers/`. Registre cada sub-router no agregador `server/routers.ts`.

| Router | Responsabilidade |
|--------|-----------------|
| `auth` | Login email/senha, sessão |
| `billing` | Cobrança, popups, status financeiro |
| `catalog` | Categorias, produtos, variações |
| `coupons` | Cupons de desconto |
| `globalSettings` | Configurações globais da plataforma |
| `onboarding` | Wizard de onboarding do lojista |
| `orders` | Pedidos, SSE real-time, histórico |
| `store` | Dados da loja (horários, endereço) |
| `tenants` | CRUD de tenants, design, landing |
| `users` | Gestão de usuários, roles |
| `analytics` | Métricas, gráficos do dashboard |

---

## 7. Testes

Os testes ficam em `server/*.test.ts` e usam Vitest. Cada router deve ter seu arquivo de teste correspondente.

```bash
# Rodar todos os testes
pnpm test

# Rodar um arquivo específico
pnpm vitest server/routers/billing.test.ts

# Modo watch
pnpm vitest --watch
```

Ao criar um teste, siga o padrão existente em `server/auth.logout.test.ts` como referência.

---

## 8. Convenções de Commit

Use mensagens de commit descritivas em português, seguindo o padrão:

```
feat: adicionar cupons de desconto ao checkout
fix: corrigir cálculo de frete para CEPs inválidos
refactor: extrair lógica de billing para helper separado
docs: atualizar README com instruções de deploy
test: adicionar testes para router de pedidos
```

---

## 9. Arquivos que NÃO Devem Ser Editados

Os seguintes diretórios e arquivos são infraestrutura do framework e não devem ser modificados:

```
server/_core/          # OAuth, contexto, tRPC base, Vite bridge
shared/_core/          # Tipos e erros do framework
client/src/_core/      # Hook useAuth do framework
```

Se precisar estender a infraestrutura, documente a razão e o impacto no PR.

---

## 10. Resolução de Problemas Comuns

**Texto invisível:** Verifique se o `defaultTheme` no `ThemeProvider` (App.tsx) corresponde às variáveis CSS em `index.css`. Sempre pareie `bg-*` com `text-*-foreground`.

**Loop infinito de queries:** Estabilize inputs com `useState` ou `useMemo`. Objetos/arrays criados no render causam re-fetches infinitos.

**Erro de autenticação:** O `QueryClient` intercepta `UNAUTHED_ERR_MSG` e redireciona para login. Verifique se o cookie de sessão está sendo enviado com `credentials: "include"`.

**Migrações falhando:** Execute `pnpm db:push` que roda `drizzle-kit generate && drizzle-kit migrate`. Se houver conflitos, verifique `drizzle/migrations/` e resolva manualmente.
