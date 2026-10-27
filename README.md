# ProofLab

ProofLab organiza financiamento científico por etapas, com evidências, votação dos financiadores e regras registradas em Solana Devnet.
A IA resume o material enviado, mas não aprova pesquisas nem libera recursos.

![Landing da ProofLab](docs/prooflab-landing.png)

## Links

- [Site](https://prooflab.vercel.app)
- [API e Swagger](https://prooflab-9ffw.onrender.com/docs)
- [Código-fonte](https://github.com/ViniCPC/ProofLab)

## Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Router, Zustand e Solana Wallet Adapter.
- Backend: NestJS, Prisma, PostgreSQL, JWT, OpenAI Responses API e Solana Web3.js.
- Programa: Rust, Anchor, SPL Token e Solana Devnet.

## Rodar localmente

Pré-requisitos: Node.js 20+, npm, Docker e Docker Compose. Para compilar ou testar o programa Solana, instale também Rust, Solana CLI e Anchor.

```bash
git clone https://github.com/ViniCPC/ProofLab.git
cd ProofLab
cp .env.example .env
docker compose up -d
```

O `.env` da raiz define as credenciais do Postgres usadas pelo Docker. Elas já batem com o `DATABASE_URL` de `backend/.env.example`.

Configure e inicie a API:

```bash
cd backend
npm ci
cp .env.example .env
npx prisma migrate deploy
npm run seed   # opcional: dados de exemplo apenas para desenvolvimento local
npm run start:dev
```

Para gerar análises com IA, preencha `OPENAI_API_KEY` em `backend/.env`. Sem a chave, os projetos são salvos sem a análise.

Em outro terminal, inicie o frontend:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

O frontend abre em `http://localhost:5173` e a API em `http://localhost:3000`.

`VITE_VOTING_DURATION_SECONDS` define quanto tempo cada votação fica aberta (padrão: 3 dias). Para uma demonstração completa em poucos minutos, use um valor curto, como `180`.
