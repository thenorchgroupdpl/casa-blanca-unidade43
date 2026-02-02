# Casa Blanca SaaS - Checklist de Implementação

## Fase 1: Upgrade para Full-Stack
- [x] Fazer upgrade do projeto com `webdev_add_feature` para web-db-user
- [x] Verificar estrutura de pastas e dependências após upgrade

## Fase 2: Schema do Banco de Dados Multi-Tenant
- [x] Criar tabela `tenants` (id, name, slug, google_api_key, google_place_id, theme_colors, fonts, border_radius, created_at)
- [x] Criar tabela `users` (id, tenant_id, email, password_hash, role: super_admin|client_admin, created_at)
- [x] Criar tabela `categories` (id, tenant_id, name, slug, order, created_at)
- [x] Criar tabela `products` (id, tenant_id, category_id, name, description, price, image_url, available, created_at)
- [x] Criar tabela `store_settings` (id, tenant_id, whatsapp, address, city, state, cep, opening_hours, social_links)
- [x] Criar tabela `home_rows` (id, tenant_id, row_number, category_id) - para configurar vitrine

## Fase 3: Sistema de Autenticação e RBAC
- [x] Implementar rotas de login/logout (usando Manus OAuth integrado)
- [x] Criar middleware de autenticação JWT (já integrado no template)
- [x] Criar middleware de autorização por role (super_admin vs client_admin)
- [x] Proteger rotas do Super Admin (superAdminProcedure)
- [x] Proteger rotas do Cliente Admin (clientAdminProcedure)

## Fase 4: Painel Super Admin
- [x] Criar layout do painel Super Admin
- [x] Implementar listagem de clientes/tenants
- [x] Implementar CRUD de clientes
- [x] Criar aba "Integrações & APIs" com campos google_api_key e google_place_id (mascarados)
- [x] Criar aba "Design System" com cores, fontes e border-radius
- [x] Implementar preview do tema em tempo real

## Fase 5: Dashboard do Lojista
- [x] Criar layout do dashboard do lojista
- [x] Seção Catálogo: CRUD de Categorias
- [x] Seção Catálogo: CRUD de Produtos (foto, nome, descrição, preço)
- [x] Seção Vitrine: 3 dropdowns para escolher categorias das fileiras da home
- [x] Seção Dados da Loja: WhatsApp, Horários, Endereço, Redes Sociais

## Fase 6: Landing Page Multi-Tenant
- [x] Refatorar para carregar dados do tenant via API
- [x] Aplicar cores/fontes/border-radius do tenant dinamicamente
- [x] Componente de Reviews que consome Google Places API (ou mock)
- [x] Mapa dinâmico usando Place ID do tenant

## Fase 7: Carrinho Persistente
- [x] Implementar Zustand com persist (localStorage)
- [x] Isolar carrinho por tenant (chave única no localStorage)
- [x] Contador dinâmico (- 1 +) no card do produto

## Fase 8: Testes e Ajustes
- [x] Testar fluxo completo Super Admin
- [x] Testar fluxo completo Cliente Admin
- [x] Testar isolamento de dados entre tenants
- [x] Testar carrinho isolado por sessão
- [x] Ajustes de responsividade

## Fase 9: Melhorias de UX
- [ ] Toast de "Produto adicionado" em box estilizado com cor personalizável
- [ ] Substituir menu hambúrguer por ícone de carrinho no header mobile
- [ ] Criar popup do carrinho ao clicar no ícone

## Fase 10: Sistema de Login Próprio
- [x] Criar rotas de autenticação com email/senha no backend
- [x] Criar página de login personalizada (sem OAuth Manus)
- [x] Criar usuário Super Admin de teste (admin@casablanca.com)
- [x] Criar usuário Client Admin de teste (lojista@casablanca.com)
- [x] Proteger rotas do dashboard com verificação de sessão
- [x] Testar fluxo completo de login
- [x] Criar rota /admin que redireciona para o dashboard correto baseado no role
