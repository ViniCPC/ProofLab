# ProofLab

ProofLab é uma plataforma experimental para financiar pesquisa científica com cripto, IA e governança comunitária. A proposta é permitir que qualquer pessoa apoie projetos científicos, mas com liberação de recursos condicionada a entregas verificáveis por etapas, chamadas de milestones.

No MVP atual, o ProofLab combina:

- autenticação mockada por wallet;
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

- Login mockado por wallet address.
- Criação automática de usuário quando a wallet ainda não existe.
- JWT simples para rotas protegidas.
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
- `OPENAI_API_KEY` é necessária para fluxos que chamam análise real de IA.
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

## Rotas do Frontend

| Rota | Descrição |
| --- | --- |
| `/` | Home com pitch do produto |
| `/explore` | Listagem paginada de pesquisas |
| `/create` | Criação de pesquisa e milestones |
| `/research/:id` | Detalhes do projeto, funding, IA, milestones e votação |
| `/demo` | Painel de controle para apresentação |

## Principais Endpoints da API

### Auth

| Método | Endpoint | Protegido | Descrição |
| --- | --- | --- | --- |
| `POST` | `/auth/wallet-login` | Não | Login mockado com `walletAddress` |
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
| `POST` | `/ai/analyze-research` | Não | Analisa uma proposta de pesquisa |
| `POST` | `/ai/analyze-milestone` | Não | Analisa uma entrega de milestone |

### Demo

| Método | Endpoint | Protegido | Descrição |
| --- | --- | --- | --- |
| `GET` | `/demo` | Não | Retorna resumo dos dados de demo |
| `POST` | `/demo/seed` | Não | Recria dados de demo |
| `POST` | `/demo/scenario` | Não | Aplica cenário de apresentação |

## Exemplos de Payload

### Login com wallet

```json
{
  "walletAddress": "DemoFunder111111111111111111111111111111111"
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
- A IA depende de `OPENAI_API_KEY`.
- O backend usa `ValidationPipe` global com whitelist, transform e bloqueio de campos não permitidos.
- O CORS está habilitado no backend.
- Não commite arquivos `.env` com segredos reais.

## Troubleshooting

### `OPENAI_API_KEY is not configured`

Defina `OPENAI_API_KEY` em `backend/.env`. Sem essa variável, fluxos que chamam análise de IA vão falhar.

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
- Adicionar documentação OpenAPI/Swagger.
- Melhorar o modo demo offline para cenários sem `OPENAI_API_KEY`.
- Implantar backend, frontend e banco em ambiente público de staging.

## Licença

Este projeto está marcado como `UNLICENSED` nos pacotes atuais. Defina uma licença antes de distribuir publicamente.
