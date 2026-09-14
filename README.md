# ProofLab

[Código-fonte](https://github.com/ViniCPC/ProofLab) · [Health da API](https://prooflab-9ffw.onrender.com/health) · [Swagger da API](https://prooflab-9ffw.onrender.com/docs) · [Roteiro de apresentação](docs/DEMO.md)

Demo frontend: URL pública do Vercel pendente de confirmação. Vídeo: ainda não informado. A documentação Swagger ficará disponível na API após o deploy destas alterações.

ProofLab é uma plataforma experimental para financiar pesquisa científica com cripto, IA e governança comunitária. A proposta é permitir que qualquer pessoa apoie projetos científicos, mas com liberação de recursos condicionada a entregas verificáveis por etapas, chamadas de milestones.

No MVP atual, o ProofLab combina:

- autenticação por assinatura de mensagem da wallet e JWT;
- backend em NestJS com Prisma e PostgreSQL;
- frontend em React, Vite e Solana Wallet Adapter;
- análise de propostas e entregas com IA;
- funding mockado no banco para demonstração;
- preparação de transações on-chain em Solana/Anchor para escrow, milestones, votos, liberação de fundos e refund.

## Visão do Produto

O ProofLab foi pensado para atacar três problemas recorrentes no financiamento científico:

1. falta de transparência sobre o uso dos recursos;
2. baixa accountability depois que o pesquisador recebe o financiamento;
3. dificuldade de financiadores não técnicos avaliarem entregas científicas.

O fluxo esperado é:

1. o pesquisador cria uma pesquisa e divide o trabalho em milestones;
2. a IA analisa a proposta e traduz pontos técnicos em linguagem mais acessível;
3. financiadores contribuem com recursos;
4. o pesquisador envia evidências de progresso;
5. a IA analisa a entrega da milestone;
6. a comunidade vota para aprovar ou rejeitar a próxima liberação;
7. os fundos são liberados em caso de aprovação ou podem ser devolvidos em cenários de falha/cancelamento.

## Como avaliar o MVP

Em cerca de cinco minutos, sem cadastro e sem wallet, é possível avaliar o fluxo de leitura:

1. Abra `/explore` no frontend e compare as pesquisas, seus orçamentos e milestones.
2. Abra os detalhes de um projeto seedado e confira entregas, funding, resumo de análise e votação. Os dados do seed são demonstrativos.
3. Visite `/demo` para localizar os projetos preparados para apresentação. Em produção, os controles que recriam dados ficam reservados ao administrador.
4. Abra [a documentação da API](https://prooflab-9ffw.onrender.com/docs) para inspecionar rotas, payloads e autenticação.
5. Opcionalmente, conecte uma wallet própria, assine a mensagem de login e teste criação de pesquisa, contribuição mockada ou voto no projeto “Demo rápida para doação e voto”. Essas ações alteram dados da demo, mas contribuições mockadas não transferem fundos reais.

O que observar tecnicamente: separação de módulos no NestJS, validação de payloads, autenticação por nonce assinado, persistência com Prisma, proteção dos controles administrativos e comportamento quando a IA está indisponível.

Este é um MVP de portfólio, não uma plataforma auditada para receber dinheiro real. As rotas Solana dependem de configuração de Devnet, IDL, mint e wallet; os exemplos on-chain do seed não equivalem a transações reais. Consulte também o [roteiro de apresentação](docs/DEMO.md).

## Status Atual

Este repositório está em estágio de MVP/demo. Ele já contém backend, frontend, seed de apresentação e um programa Anchor. Parte do fluxo on-chain ainda é orientada à preparação de transações para assinatura pela wallet do usuário, não à custódia ou assinatura pelo servidor.

O backend monta transações Solana serializadas em base64. A intenção é que a wallet do usuário assine e envie essas transações. O servidor não deve custodiar fundos nem assinar em nome do usuário final.

## Stack

### Backend

- NestJS
- Prisma
- PostgreSQL
- JWT
- class-validator
- OpenAI Responses API
- Solana Web3.js
- Anchor
- SPL Token

### Frontend

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- Solana Wallet Adapter
- Zustand
- Radix UI
- Lucide React

### Blockchain

- Solana Devnet
- Anchor
- Programa `research_escrow`
- Escrow por projeto
- Milestones on-chain
- Contribuições
- Votos
- Release de fundos
- Refund

## Estrutura do Repositório

```txt
proofLab/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── ai/
│       ├── auth/
│       ├── blockchain/
│       ├── contributions/
│       ├── demo/
│       ├── milestones/
│       ├── prisma/
│       ├── research/
│       ├── users/
│       └── votes/
├── frontend/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── store/
│       ├── types/
│       └── utils/
├── solana/
│   ├── programs/
│   │   └── research-escrow/
│   └── Anchor.toml
├── docker-compose.yml
└── README.md
```

## Funcionalidades

### Autenticação

- Login por wallet address com nonce temporário e assinatura verificada.
- Criação automática de usuário quando a wallet ainda não existe.
- JWT para rotas protegidas.
- Endpoint para recuperar o usuário autenticado.

### Pesquisas

- Criação de projetos científicos.
- Listagem paginada.
- Busca por ID com milestones.
- Análise da proposta com IA.
- Registro on-chain do projeto.

### Milestones

- Criação de milestones vinculadas a uma pesquisa.
- Validação de existência do projeto.
- Garantia de ordem sequencial.
- Listagem ordenada por `order`.
- Submissão de relatório de progresso.
- Análise de entrega com IA.
- Preparação de transações on-chain para criar, submeter, finalizar votação e liberar fundos.

### Contributions

- Registro de funding mockado no banco.
- Validação de existência do projeto.
- Soma do total arrecadado.
- Cálculo da porcentagem financiada.
- Listagem paginada de investidores.
- Preparação de funding on-chain.

### Votação

- Voto `approve` ou `reject` em milestones.
- Bloqueio para impedir o pesquisador de votar na própria milestone.
- Consulta do resultado da votação.
- Preparação de voto on-chain.
- Preparação da finalização de votação on-chain.

### Demo

- Seed de dados para apresentação.
- Página `/demo` no frontend.
- Cenários controláveis:
  - `baseline`
  - `funding`
  - `pending-review`
  - `approved`
  - `cancelled`
  - `completed`

## Pré-requisitos

- Node.js
- npm
- Docker e Docker Compose
- PostgreSQL, usado via Docker neste projeto
- Solana CLI, recomendada para trabalhar com o programa Anchor
- Anchor CLI, recomendada para build, teste e deploy do programa
- Uma wallet Solana, como Phantom, para testar a integração no frontend

## Configuração de Ambiente

Crie os arquivos de ambiente antes de subir o projeto.

### 1. Variáveis para Docker

Na raiz do projeto, crie um arquivo `.env`:

```env
POSTGRES_USER=prooflab
POSTGRES_PASSWORD=prooflab
POSTGRES_DB=prooflab
POSTGRES_PORT=5437
```

Essas variáveis são usadas pelo `docker-compose.yml`.

### 2. Variáveis do Backend

Copie o exemplo:

```bash
cd backend
cp .env.example .env
```

No PowerShell:

```powershell
cd backend
Copy-Item .env.example .env
```

Exemplo de `backend/.env`:

```env
POSTGRES_USER=prooflab
POSTGRES_PASSWORD=prooflab
POSTGRES_DB=prooflab
POSTGRES_PORT=5437

DATABASE_URL="postgresql://prooflab:prooflab@localhost:5437/prooflab?schema=public"
JWT_SECRET="troque-este-valor"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
DEMO_ADMIN_TOKEN=""

OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.4-mini"

SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_PROGRAM_ID="5q7tMMX6j5M4m6JQ2R4kGPZZ8sJ5bxFcxwJkmxfW4AcJ"
SOLANA_IDL_PATH="../solana/target/idl/research_escrow.json"
USDC_MINT_ADDRESS="<devnet-usdc-mint>"

# Opcional. Defina apenas se tiver uma secret key real.
# SOLANA_ADMIN_KEYPAIR="[1,2,3]"
```

Notas importantes:

- `JWT_SECRET` deve ser definido. Não use o valor de exemplo em produção.
- Em produção, `JWT_SECRET` deve ter pelo menos 32 caracteres e `FRONTEND_URL` deve ser uma origem HTTPS exata, sem barra final ou caminho. O backend valida essas configurações ao iniciar.
- `DEMO_ADMIN_TOKEN` protege as alterações da demo. Não coloque esse segredo em variáveis `VITE_*`.
- `OPENAI_API_KEY` é necessária para análise real de IA. Sem chave, os fluxos continuam com mensagem de indisponibilidade e sem scores inventados; o status de IA fica `FAILED`, não `COMPLETED`.
- `SOLANA_IDL_PATH` precisa apontar para o IDL gerado pelo Anchor.
- `USDC_MINT_ADDRESS` precisa ser um mint válido para o ambiente Solana usado.
- `SOLANA_ADMIN_KEYPAIR` é opcional no MVP. Sem essa variável, o backend usa uma wallet efêmera para construir transações.

### 3. Variáveis do Frontend

No diretório `frontend`, crie `.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

## Como Rodar Localmente

### 1. Subir o banco

Na raiz do projeto:

```bash
docker compose up -d
```

### 2. Instalar dependências do backend

```bash
cd backend
npm install
```

### 3. Rodar migrations do Prisma

```bash
npx prisma migrate dev
```

Se necessário, gere o Prisma Client:

```bash
npx prisma generate
```

### 4. Popular dados de demo

```bash
npm run seed
```

### 5. Rodar o backend

```bash
npm run start:dev
```

Backend padrão:

```txt
http://localhost:3000
```

### 6. Instalar dependências do frontend

Em outro terminal:

```bash
cd frontend
npm install
```

### 7. Rodar o frontend

```bash
npm run dev
```

Frontend padrão:

```txt
http://localhost:5173
```

## Fluxo Recomendado para Demo

1. Suba o banco com Docker.
2. Rode as migrations.
3. Rode `npm run seed` no backend.
4. Inicie o backend.
5. Inicie o frontend.
6. Abra `http://localhost:5173/demo`.
7. Use o painel de demo para alternar cenários.
8. Acesse `/explore`.
9. Abra o projeto principal.
10. Conecte uma wallet.
11. Teste funding, review, voto, finalização e release/refund.

## Deploy: Vercel e Render

### Frontend no Vercel

- Root Directory: `frontend`.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Cadastre `VITE_API_URL=https://prooflab-9ffw.onrender.com` no ambiente Production e faça um novo deploy. As variáveis `VITE_*` são incorporadas durante o build, não em tempo de execução.
- O arquivo `frontend/vercel.json` encaminha rotas como `/explore`, `/demo` e `/research/:id` para a SPA, inclusive ao atualizar a página.

O build de produção falha se `VITE_API_URL` não estiver definido como uma origem HTTPS válida. Para um build local contra uma API HTTP, use `npm run build -- --mode development`.

### Backend no Render

- Root Directory: `backend`.
- Build Command: `npm ci && npx prisma generate && npm run build`.
- Start Command: `npm run start:prod`.
- Health Check Path: `/health`.
- Execute `npm run db:deploy` antes de iniciar a versão nova. Use o Pre-Deploy Command quando disponível, ou o shell do serviço. Não use `prisma migrate dev` no banco público.

Cadastre estas variáveis no Render, usando os valores reais do seu ambiente:

```env
NODE_ENV=production
DATABASE_URL=<conexao-postgresql-do-banco-publico>
JWT_SECRET=<segredo-aleatorio-com-pelo-menos-32-caracteres>
FRONTEND_URL=https://<seu-dominio-exato>.vercel.app
DEMO_ADMIN_TOKEN=<outro-segredo-aleatorio>
OPENAI_API_KEY=<chave-da-api>
OPENAI_MODEL=gpt-5.4-mini
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=<programa-implantado-na-devnet>
USDC_MINT_ADDRESS=<mint-usdc-valido-na-devnet>
```

`FRONTEND_URL` deve corresponder exatamente à URL usada pelo visitante. Não use curingas, caminhos, barra final ou uma lista de domínios. O CORS não substitui autenticação.

Confira também se `SOLANA_IDL_PATH` aponta para um IDL disponível no deploy quando for usar os fluxos on-chain.

### Popular e preservar a demo pública

Após as migrations, execute `npm run seed` uma vez no shell do backend implantado. O seed recria somente os três projetos reservados para demonstração e seus registros relacionados; ele apaga alterações anteriores feitas nesses projetos. Não execute automaticamente em cada deploy.

Sem acesso ao shell, um administrador pode usar a rota protegida:

```bash
curl -X POST "https://prooflab-9ffw.onrender.com/demo/seed" \
  -H "x-demo-admin-token: <DEMO_ADMIN_TOKEN>"
```

Em produção, o painel público permite consultar e abrir os projetos, mas não alterar cenários. `POST /demo/seed` e `POST /demo/scenario` exigem `x-demo-admin-token`; se o segredo não estiver cadastrado, as alterações ficam bloqueadas. Somente com `NODE_ENV=development` e sem segredo configurado os controles públicos ficam disponíveis localmente. Se `NODE_ENV` estiver ausente, as alterações também ficam bloqueadas.

Após o deploy, confirme que `/health` responde com `{"status":"ok"}`, que `/demo` contém os projetos e que as rotas internas do frontend abrem diretamente e sobrevivem a um refresh.

## Rotas do Frontend

| Rota | Descrição |
| --- | --- |
| `/` | Home com pitch do produto |
| `/explore` | Listagem paginada de pesquisas |
| `/create` | Criação de pesquisa e milestones |
| `/research/:id` | Detalhes do projeto, funding, IA, milestones e votação |
| `/demo` | Painel de controle para apresentação |

## Principais Endpoints da API

A documentação interativa fica em `/docs` e a especificação OpenAPI em `/docs-json`. Localmente: `http://localhost:3000/docs`. Use JWT em **Authorize** para rotas autenticadas e a chave administrativa apenas para alterações da demo. O Swagger não persiste essas credenciais no navegador. A integração segue a [documentação oficial do NestJS](https://docs.nestjs.com/openapi/introduction).

### Auth

| Método | Endpoint | Protegido | Descrição |
| --- | --- | --- | --- |
| `POST` | `/auth/nonce` | Não | Gera mensagem temporária para assinatura pela wallet |
| `POST` | `/auth/wallet-login` | Não | Verifica `walletAddress` e assinatura do nonce em base64 |
| `GET` | `/auth/me` | Sim | Retorna o usuário autenticado |

### Research

| Método | Endpoint | Protegido | Descrição |
| --- | --- | --- | --- |
| `POST` | `/research` | Sim | Cria pesquisa vinculada ao usuário logado |
| `GET` | `/research?page=1&limit=10` | Não | Lista pesquisas com paginação |
| `GET` | `/research/:id` | Não | Busca pesquisa por ID com milestones |
| `POST` | `/research/:id/create-on-chain` | Sim | Prepara transação para registrar projeto on-chain |
| `POST` | `/research/:id/fund-on-chain` | Sim | Prepara transação de funding on-chain |
| `POST` | `/research/:id/claim-refund` | Sim | Prepara transação de refund |
| `POST` | `/research/:id/cancel-on-chain` | Sim | Prepara transação de cancelamento |

### Milestones

| Método | Endpoint | Protegido | Descrição |
| --- | --- | --- | --- |
| `POST` | `/research/:id/milestones` | Sim | Cria milestone no banco |
| `GET` | `/research/:id/milestones` | Não | Lista milestones de uma pesquisa |
| `POST` | `/research/:id/milestones/:milestoneId/submit-review` | Sim | Envia relatório para análise da IA |
| `PATCH` | `/research/:id/milestones/:milestoneId/status` | Sim | Atualiza status administrativo |
| `POST` | `/research/:id/milestones/:milestoneId/create-on-chain` | Sim | Prepara criação da milestone on-chain |
| `POST` | `/research/:id/milestones/:milestoneId/submit-on-chain` | Sim | Prepara submissão da milestone on-chain |
| `POST` | `/research/:id/milestones/:milestoneId/finalize-vote-on-chain` | Sim | Prepara finalização da votação on-chain |
| `POST` | `/research/:id/milestones/:milestoneId/release-on-chain` | Sim | Prepara release de fundos |

### Contributions

| Método | Endpoint | Protegido | Descrição |
| --- | --- | --- | --- |
| `POST` | `/research/:id/contribute` | Sim | Registra contribuição mockada no banco |
| `GET` | `/research/:id/contributions?page=1&limit=10` | Não | Lista investidores e estatísticas de funding |

### Votes

| Método | Endpoint | Protegido | Descrição |
| --- | --- | --- | --- |
| `POST` | `/research/:projectId/milestones/:milestoneId/votes` | Sim | Registra voto mockado |
| `GET` | `/research/:projectId/milestones/:milestoneId/votes` | Não | Retorna votos e resumo |
| `POST` | `/research/:projectId/milestones/:milestoneId/vote-on-chain` | Sim | Prepara voto on-chain |
| `POST` | `/research/:projectId/milestones/:milestoneId/finalize-vote-on-chain` | Sim | Prepara finalização da votação on-chain |

### AI

| Método | Endpoint | Protegido | Descrição |
| --- | --- | --- | --- |
| `POST` | `/ai/analyze-research` | Sim | Analisa proposta ou informa indisponibilidade sem chave |
| `POST` | `/ai/analyze-milestone` | Sim | Analisa entrega ou informa indisponibilidade sem chave |

### Demo

| Método | Endpoint | Protegido | Descrição |
| --- | --- | --- | --- |
| `GET` | `/demo` | Não | Retorna resumo dos dados de demo |
| `POST` | `/demo/seed` | Sim em produção | Recria dados de demo; exige `x-demo-admin-token` |
| `POST` | `/demo/scenario` | Sim em produção | Aplica cenário; exige `x-demo-admin-token` |

## Exemplos de Payload

### Login com wallet

Primeiro chame `/auth/nonce` com sua `walletAddress`, assine a mensagem retornada usando a wallet e envie a assinatura em base64 para `/auth/wallet-login`. O endereço abaixo é apenas ilustrativo; não permite login sem a assinatura correspondente.

```json
{
  "walletAddress": "<chave-publica-da-sua-wallet>",
  "signature": "<assinatura-base64-da-mensagem-do-nonce>"
}
```

### Criar pesquisa

```json
{
  "title": "Diagnóstico rápido com microfluídica",
  "description": "Pesquisa para validar um chip de baixo custo para separação de biomarcadores.",
  "totalAmount": "120000.000000",
  "milestones": [
    {
      "title": "Protótipo validado",
      "description": "Construir e validar protótipo inicial em amostras simuladas.",
      "amount": "40000.000000",
      "order": 1
    }
  ]
}
```

### Criar contribution mockada

```json
{
  "amount": "5000.000000"
}
```

### Submeter milestone para análise da IA

```json
{
  "submittedReport": "Protótipo v1 concluído com testes documentados.",
  "progress": 82,
  "evidenceText": "Resultados de bancada, imagens do protótipo e planilha de amostras."
}
```

### Votar em uma milestone

```json
{
  "approve": true
}
```

## Autenticação

As rotas protegidas esperam um token JWT no header:

```txt
Authorization: Bearer <accessToken>
```

O token é retornado por:

```txt
POST /auth/wallet-login
```

No frontend, o token é salvo em `localStorage` com a chave:

```txt
prooflab_token
```

## Programa Solana

O programa Anchor fica em:

```txt
solana/programs/research-escrow
```

Instruções disponíveis:

- `create_project`
- `create_milestone`
- `fund_project`
- `submit_milestone`
- `vote_milestone`
- `finalize_milestone_vote`
- `release_funds`
- `cancel_project`
- `claim_refund`

Arquivos principais:

```txt
solana/programs/research-escrow/src/
├── lib.rs
├── state.rs
├── error.rs
├── constants.rs
└── instructions/
```

Comandos úteis:

```bash
cd solana
anchor build
anchor test
```

Depois de rodar `anchor build`, confira se o IDL foi gerado em:

```txt
solana/target/idl/research_escrow.json
```

Esse arquivo é usado pelo backend para montar as instruções on-chain.

## Arquitetura On-chain no Backend

A pasta `backend/src/blockchain` separa responsabilidades:

```txt
blockchain.provider.ts  # conexão, IDL e Program Anchor
blockchain.pda.ts       # derivação de PDAs
blockchain.utils.ts     # conversões de BN, PublicKey e seeds
blockchain.tx.ts        # infraestrutura de transação e erros Solana
blockchain.service.ts   # regras de domínio e instruções on-chain
```

O `BlockchainService` é o serviço exportado pelo módulo para o restante da aplicação.

## Scripts Úteis

### Backend

```bash
cd backend
npm run start:dev
npm run build
npm run lint
npm run test
npm run seed
npx prisma migrate dev
npx prisma generate
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

### Solana

```bash
cd solana
anchor build
anchor test
```

## Modelo de Dados

Principais entidades:

- `User`: usuário autenticado por wallet.
- `ResearchProject`: projeto científico.
- `Milestone`: etapa do projeto.
- `Contribution`: contribuição de um financiador.
- `Vote`: voto de um financiador em uma milestone.

Enums principais:

- `UserRole`: `RESEARCHER`, `FUNDER`, `ADMIN`
- `ProjectStatus`: `DRAFT`, `ACTIVE`, `CANCELLED`, `COMPLETED`
- `MilestoneStatus`: `PENDING`, `PENDING_REVIEW`, `SUBMITTED`, `APPROVED`, `REJECTED`

## Observações Importantes

- O funding mockado (`POST /research/:id/contribute`) registra contribuição no banco e é útil para demo.
- O funding on-chain (`POST /research/:id/fund-on-chain`) prepara uma transação Solana.
- A análise real de IA depende de `OPENAI_API_KEY`, mantida somente no backend, conforme a [documentação oficial da OpenAI](https://developers.openai.com/api/docs/quickstart). Sem chave, o fallback não faz requisições externas e não atribui avaliações fictícias.
- O backend usa `ValidationPipe` global com whitelist, transform e bloqueio de campos não permitidos.
- O CORS aceita somente a origem definida em `FRONTEND_URL`. Em produção, defina essa variável com o domínio exato do frontend no Vercel, por exemplo `https://seu-projeto.vercel.app`.
- A rota `GET /health` retorna `{ "status": "ok" }` e pode ser usada pelo provedor de deploy para verificar a saúde da API.
- Não commite arquivos `.env` com segredos reais.

## Troubleshooting

### `OPENAI_API_KEY is not configured`

Defina `OPENAI_API_KEY` no ambiente do backend e reinicie o serviço para habilitar a análise real. Sem chave ou com valor vazio, a API retorna `source: "unavailable"` e scores nulos; pesquisas e entregas continuam sendo salvas com mensagem de revisão manual e `aiStatus: "FAILED"`. Uma resposta real usa `source: "openai"`. Falhas do provedor não são ocultadas por esse fallback; em reanálises com falha, os resultados anteriores são preservados.

### `Anchor IDL not found`

Rode:

```bash
cd solana
anchor build
```

Depois confira `SOLANA_IDL_PATH` no `backend/.env`.

### Erro de conexão com o banco

Confirme se o container está rodando:

```bash
docker compose ps
```

Também confira se `DATABASE_URL` aponta para a mesma porta configurada em `POSTGRES_PORT`.

### Frontend chamando API errada

Confira `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

### Transações on-chain falhando

Confira:

- `SOLANA_RPC_URL`;
- `SOLANA_PROGRAM_ID`;
- `SOLANA_IDL_PATH`;
- `USDC_MINT_ADDRESS`;
- se o projeto já foi registrado on-chain antes de funding/milestones;
- se a milestone já foi criada/submetida on-chain antes de voto/release.

## Roadmap Sugerido

- Assinar e enviar transações Solana diretamente pelo frontend.
- Mostrar assinatura real da transação na UI.
- Criar mint USDC devnet controlado para demo.
- Melhorar o fluxo de permissões para admin.
- Adicionar testes e2e para o fluxo completo.
- Implantar backend, frontend e banco em ambiente público de staging.

## Licença

Este projeto usa a licença [MIT](LICENSE). Os metadados dos pacotes frontend, backend e do programa Rust foram alinhados à licença.
