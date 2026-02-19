# Auditoria Casa Blanca - Bugs Encontrados

## 1. Fluxo de Login
- ✅ Página de login carrega OK
- ✅ Credenciais de teste visíveis (admin@casablanca.com / lojista@casablanca.com / 123456)
- ✅ Login com credenciais inválidas mostra mensagem de erro "Email ou senha incorretos" corretamente
- ✅ Login Super Admin (admin@casablanca.com) redireciona para /admin/super OK
- NOTA: Credenciais de teste visíveis na tela de login - remover em produção

## 2. Super Admin
- ✅ Dashboard carrega OK - 3 clientes, 1 landing publicada, 3 usuários
- ✅ Stats cards funcionam (Clientes: 3, Landing Pages: 1, Planos: 1, Usuários: 3)
- ✅ Filtros visíveis (Status, Landing Page, Plano, Nicho, Estado, Cidade)
- ✅ 3 clientes listados: Tia do guarda, Aldeia, Restaurante Teste
- ⚠️ BUG: "Tia do guarda" e "Aldeia" sem CNPJ, sem nicho, sem localização - dados incompletos
- ⚠️ BUG: "Tia do guarda" sem plano visível no card
- ✅ Página Clientes carrega OK - 3 clientes listados com cards detalhados
- ✅ Botões de ação rápida visíveis: Acesso Direto, Design, Ver Landing, Gerenciar, Excluir
- ✅ Filtros visíveis: Status, Plano, Nicho
- ✅ Barra de busca visível
- ✅ Botão Novo Cliente visível
- ✅ Restaurante Teste mostra: Ativo, Professional, CNPJ, Patos de Minas/MG, Restaurante, Publicada
- ✅ Aldeia mostra: Implementação, Starter, CNPJ, Uberlândia/MG, Cafeteria, Rascunho, Sem API
- ⚠️ BUG: "Tia do guarda" mostra Starter e Implementação mas sem CNPJ, sem localização, sem nicho
- ✅ Painel de gerenciamento (Restaurante Teste): 3 abas funcionam
- ✅ Dados Contratuais: CNPJ, Razão Social, Email, Telefone, Status, Plano, Landing, Nicho, Cidade, Estado
- ✅ Domínio: Slug editável, Domínio Próprio, Links de Acesso
- ✅ Integrações: WhatsApp (Conectado), Google Places (Desconectado), Place ID (Pendente)
- ⚠️ BUG: WhatsApp mostra número com formato errado: +5503499120191 (com 0 extra no DDD)
- ✅ Formulário Novo Cliente: 4 abas funcionam (Básico, Contrato, APIs, Design)
- ✅ Aba Básico: Nome, Slug, Nicho, Plano, Cidade, Estado, Status toggle
- ✅ Aba Contrato: CNPJ, Razão Social, Email, Telefone
- ✅ Aba APIs: Google Places API Key, Google Place ID (com aviso de sensibilidade)
- ✅ Aba Design: Cor Primária, Cor de Fundo, Fonte Principal, Fonte Display

- ✅ Página Usuários carrega OK - 3 usuários listados
- ✅ Stats: Total 3, Super Admins 2, Lojistas 1, Usuários 0
- ✅ Tabela com Nome, Email, Papel, Loja, Login, Último Acesso, Ações
- ✅ Busca por nome, email ou papel
- ✅ Administrador (admin@casablanca.com) - Super Admin - Restaurante Teste
- ✅ Lojista Demo (lojista@casablanca.com) - Lojista - Restaurante Teste
- ✅ Gustavo Moreira (oper.globaladm@gmail.com) - Super Admin - Aldeia - Google login

- ✅ Design System: Seletor de loja, Cores (5 campos), Tipografia (2 fontes), Estilo (border-radius), Preview
- ✅ Integrações: Seletor de loja, Google Places API (Key + Place ID), Mais Integrações (Stripe, WhatsApp Business, iFood - em breve)
- ✅ Configurações: Geral (Nome, Versão, Ambiente), Notificações (em breve), Segurança (em breve), Banco de Dados (em breve)

## 3. Lojista
- ✅ Login como Lojista: Redirecionou para /admin/dashboard
- ✅ Dashboard: Stats (2 Categorias, 1 Produto, 1 Disponível, Status Configurado)
- ✅ Ações Rápidas: Catálogo, Vitrine, Dados da Loja
- ✅ Produtos Recentes: Pizza Margherita R$ 45,90 (Disponível)
- ✅ Catálogo: Categorias (Pizzas 1 produto, Bebidas 0 produtos), Produtos (Pizza Margherita R$ 45,90)
- ✅ Vitrine: 3 fileiras configuráveis com seletor de categoria e título personalizado
- ✅ Dados da Loja: 5 abas (Contato, Horários, Endereço, Redes Sociais, Conteúdo)
- ⚠️ BUG: WhatsApp salvo como +55034991201913 (com 0 extra no DDD) - já corrigido no frontend mas dado no banco está incorreto

## 4. Landing Page
- ✅ Hero: Título, Subtítulo, Botão "Fazer Pedido", Status "Aberto até 23:00"
- ⚠️ BUG: Hero sem imagem de fundo - área toda preta, falta background
- ⚠️ BUG: Avaliações mostram "NaN anos atrás" - problema de formatação de data
- ⚠️ BUG: Seção Sobre vazia - "Proprietário: Casa Blanca" sem texto/história
- ⚠️ BUG: Endereço mostra campos vazios - ", " e "- /" e "CEP:" sem valores
- ⚠️ BUG: Seção Sobre mostra área preta vazia sem texto/história - placeholder não preenchido
- ⚠️ BUG: Foto do proprietário não carrega (círculo vazio com borda)
- ⚠️ BUG: Card do produto sem imagem (fundo branco vazio)
- ✅ Avaliações: 3 cards com nota 4.7, textos corretos
- ✅ Localização: Mapa com pin, botão Abrir no Mapa
- ✅ Horário de Funcionamento: Listagem correta
- ✅ Footer: Ícones de redes sociais (Instagram, Facebook, YouTube)
- ✅ Header fixo: Navegação funcional (Início, Cardápio, Sobre, Avaliações, Contato)

- ⚠️ BUG: Ícones de redes sociais no footer abrem em nova aba (Facebook abriu ao clicar no ícone) - isso é comportamento esperado, mas os links são placeholders

## 5. Carrinho / WhatsApp
- ⚠️ BUG: Ao adicionar produto ao carrinho, bottom sheet fecha mas NÃO aparece nenhum toast/notificação
- ⚠️ BUG: Não há indicador visual de carrinho no header (não sei se o item foi adicionado)
- ⚠️ BUG: Card do produto mostra imagem quebrada (fundo branco sem foto)
- ⚠️ BUG: Modal WhatsApp mostra número com formato incorreto: +55034991201913 (com zero extra no DDD)
- ✅ Modal WhatsApp abre corretamente com botão Abrir WhatsApp e Cancelar
- ✅ Botão Abrir WhatsApp redireciona para api.whatsapp.com com número correto (normalizado)
- ✅ Cardápio Completo: Overlay abre com busca, filtros (Todos, Pizzas, Bebidas) e lista de produtos
- ✅ Sacola: Botão "1 Ver Sacola R$ 45,90" aparece no rodapé do cardápio (item foi adicionado com sucesso)
- ⚠️ BUG: Imagem do produto no cardápio também está quebrada (fundo cinza sem foto)
- ✅ Sacola: Drawer abre com item correto (Pizza Margherita - R$ 45,90)
- ✅ Sacola: Botões +/- para quantidade, botão lixeira para remover
- ✅ Sacola: Campo de observações (opcional)
- ✅ Sacola: Total calculado corretamente (R$ 45,90)
- ✅ Sacola: Botão "Finalizar no WhatsApp" e "Limpar sacola"
