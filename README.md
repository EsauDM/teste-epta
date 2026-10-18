

## 📖 Visão Geral

O **Drivo Garage** é uma aplicação full-stack desenvolvida para facilitar o cadastro, organização e consulta de veículos. 

Um dos grandes diferenciais do projeto é a **leitura automatizada de documentos veiculares (CRLV - Certificado de Registro e Licenciamento de Veículo)**: ao fazer o upload do PDF oficial do documento, a aplicação utiliza a API do **Google Gemini (IA Generativa)** com extração estruturada para identificar e preencher automaticamente todos os campos do veículo (Placa, Renavam, Chassi, Marca, Modelo, Ano de Fabricação, Ano do Modelo, Cor e Combustível), reduzindo erros de digitação e acelerando o processo de cadastro.

---

## 🛠 Arquitetura e Tecnologias

A aplicação é dividida em serviços orquestrados via Docker Compose:

### ⚙️ Backend
- **Framework:** [NestJS 12](https://nestjs.com/) (Node.js 20+, TypeScript, Express, ESM)
- **Banco de Dados & ORM:** [PostgreSQL 15](https://www.postgresql.org/) com [Prisma ORM 5.21](https://www.prisma.io/)
- **Inteligência Artificial:** [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) (Google Gemini Flash com *Structured Outputs* / JSON Schema)
- **Autenticação & Segurança:** JWT (`@nestjs/jwt`), Senhas com `bcrypt` (10 rounds de salt), rotação de Refresh Tokens criptografados com SHA-256 e guards customizados
- **Uploads:** `Multer` para armazenamento de fotos de veículos e leitura em memória de arquivos PDF
- **Validação & DTOs:** `class-validator` e `class-transformer` com `ValidationPipe` global
- **Documentação de API:** [Swagger / OpenAPI](https://swagger.io/)
- **Testes & Ferramental:** [Vitest](https://vitest.dev/) e [Oxlint](https://oxc.rs/)

### 💻 Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router) com [React 19](https://react.dev/)
- **Monorepo:** [Turborepo](https://turbo.build/)
- **Estilização & UI:** [Tailwind CSS v4](https://tailwindcss.com/) com primitivos [Shadcn/UI](https://ui.shadcn.com/) e ícones [Lucide React](https://lucide.dev/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)
- **Comunicação HTTP:** [Axios](https://axios-http.com/) com interceptors para injeção automática de Bearer Token e renovação silenciosa de sessão (Refresh Token queue)
- **Controle de Sessão & Rotas:** Gerenciamento de cookies via `js-cookie` e proteção de rotas privadas/públicas no servidor via `middleware.ts` do Next.js

---

## 📥 Como Instalar o Projeto

### Pré-requisitos
Certifique-se de ter instalado em seu ambiente:
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (versão 20.9.0 ou superior)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)
- Uma chave de API do Google Gemini ([Google AI Studio](https://aistudio.google.com/))

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/teste-epta.git
cd teste-epta
```

### 2. Configurar as Variáveis de Ambiente

Crie o arquivo de variáveis de ambiente para o **Backend** (`backend/.env`):
```env
# Configuração do Banco de Dados PostgreSQL
DATABASE_URL="postgresql://admin-drivo:drivo141225@localhost:5432/drivo-garage?schema=public"

# Chaves de Autenticação JWT
JWT_ACCESS_SECRET="sua_chave_secreta_jwt_super_segura"
JWT_REFRESH_SECRET="sua_chave_secreta_refresh_super_segura"

# Chave da API do Google Gemini (para extração do CRLV)
GEMINI_API_KEY="AIzaSy..."
```
> **Nota para execução via Docker:** Ao utilizar o Docker Compose, o hostname do banco é resolvido internamente como `db`, o qual já é injetado automaticamente pelo `docker-compose.yml`.

Crie o arquivo de variáveis de ambiente para o **Frontend** (`frontend/drivo-garage/apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```


##  Como Executar o Projeto

### 1. Execução com Docker Compose (Recomendado)


Para iniciar todos os serviços com um único comando:

```bash
docker compose up --build
```

*(Ou adicione a flag `-d` para rodar em segundo plano)*

Após a inicialização, as seguintes portas e serviços estarão acessíveis:
| Serviço | URL / Porta | Descrição |
| :--- | :--- | :--- |
| **Frontend Web** | [http://localhost:3001](http://localhost:3001) | Interface web do usuário (Next.js) |
| **Backend API** | [http://localhost:3000](http://localhost:3000) | Servidor NestJS |
| **Swagger UI** | [http://localhost:3000/api](http://localhost:3000/api) | Documentação interativa de rotas |
| **Prisma Studio** | [http://localhost:5555](http://localhost:5555) | Interface gráfica para visualização do banco |
| **PostgreSQL** | `localhost:5432` | Banco de dados |

---

### 2. Execução Local (Desenvolvimento Manual)

Caso prefira rodar as aplicações individualmente em seu terminal:

#### Passo 1: Subir o Banco de Dados
Você pode subir apenas o serviço do PostgreSQL via Docker:
```bash
docker compose up -d db
```

#### Passo 2: Executar as Migrações do Prisma
```bash
cd backend
npx prisma migrate dev
```

#### Passo 3: Iniciar o Backend
```bash
# Ainda no diretório /backend
npm run start:dev
```
A API iniciará em `http://localhost:3000`.

#### Passo 4: Iniciar o Frontend
Em outro terminal:
```bash
cd frontend/drivo-garage
npm run dev
```
O frontend iniciará em `http://localhost:3001`.

---

## 🧪 Como Executar os Testes

Os testes automatizados foram construídos no Backend utilizando **Vitest**

A partir da raiz do projeto ou dentro do diretório `backend`:

```bash
cd backend

# Executar todos os testes unitários uma única vez
npm run test

# Executar os testes em modo interativo (Watch Mode)
npm run test:watch

# Executar os testes com relatório de cobertura (Coverage)
npm run test:cov

# Executar testes End-to-End (E2E)
npm run test:e2e
```

### Escopo dos Testes Unitários Implementados:
- **`AuthService`**: Validação de credenciais incorretas de login, expiração/invalidação de tokens e rotação de refresh tokens.
- **`AuthController`**: Validação dos fluxos de atualização de perfil e exclusão de conta de usuário.
- **`VehiclesService`**: Criação de veículo associado ao usuário, tratamento de exceção para duplicidade de Placa e Renavam (`ConflictException`), validação de dados vazios em atualizações (`BadRequestException`) e busca por identificador com restrição de posse (`NotFoundException`).
- **`VehiclesController`**: Roteamento, validação de decorators e injeção do usuário autenticado via token.

---

## 💡 Decisões Técnicas

1. **NestJS no Backend**: Adoção de uma arquitetura modular baseada em injeção de dependências, controladores, serviços e DTOs bem definidos. Essa estrutura garante manutenibilidade e separação de responsabilidades.
2. **Prisma ORM & PostgreSQL**: O Prisma oferece segurança de tipos facilitados, reduzindo erros de SQL em tempo de desenvolvimento. As migrações do Prisma garantem versionamento claro do banco de dados relacional, permitindo integridade referencial (cascateamento em exclusões de usuários e refresh tokens).
3. **Extração Inteligente com Google Gemini (IA Generativa) & Structured Output**: Em vez de depender de OCRs tradicionais e frágeis baseados em coordenadas de texto ou expressões regulares rígidas (que falham diante das variações de modelos estaduais do CRLV), foi utilizado o modelo `gemini-3.8-flash` configurado com `responseSchema` (JSON Schema rígido). A API recebe o buffer do documento em PDF e retorna um objeto tipado com garantia dos campos esperados.
4. **Segurança Avançada com Refresh Token Rotation & Hashing**:
   - O Access Token possui tempo de vida curto para minimizar riscos em caso de interceptação.
   - O Refresh Token possui validade de 7 dias, mas **nunca é persistido em texto claro no banco de dados**; apenas seu hash SHA-256 é armazenado.
   - Cada renovação invalida o token anterior e emite um novo par (rotação), protegendo a aplicação contra ataques de repetição.
5. **Interceptor do Axios com Fila de Requisições Silenciosa**: No frontend, caso uma requisição receba `401 Unauthorized`, um interceptor do Axios suspende as requisições subsequentes em uma fila (`failedRequestsQueue`), dispara a rota `/auth/refresh` com o Refresh Token e, ao obter o novo token, reprocessa todas as requisições pendentes de forma transparente para o usuário.
6. **Proteção de Rotas com Middleware do Next.js**: A checagem de autenticação ocorre no servidor através do `middleware.ts`. Usuários não autenticados são impedidos de acessar a rota protegida `/home`, e usuários já autenticados são automaticamente redirecionados de `/` ou `/signup` para `/home`, prevenindo "flashes" de tela no cliente.
7. **Monorepo com Turborepo & Shadcn/UI**: O frontend foi estruturado em monorepo separando a aplicação principal (`apps/web`) dos pacotes compartilháveis (`packages/ui`, `packages/eslint-config`), facilitando a escalabilidade do design system e padronização visual com componentes acessíveis baseados em Radix UI.


---

## ⚠️ Limitações Existentes

- **Armazenamento de Imagens em Disco Local**: As fotos dos veículos são salvas na pasta `./uploads` do servidor backend. 
- **Filtragem e Busca Realizadas no Client-Side**: O endpoint `GET /vehicles` retorna todos os veículos pertencentes ao usuário logado, e o filtro de busca textual por placa/modelo/marca é executado na memória do frontend. 
- **Recuperação de Senha por E-mail**: Não há fluxo de "Esqueci minha senha" com envio de e-mails transacionais e tokens temporários de redefinição.
- **Dependência de Conectividade e Cota da IA**: A extração automática de dados do CRLV depende da conexão com a API externa da Google e de cotas disponíveis da chave configurada 
- **Cobertura de Testes no Frontend**: A suíte de testes automatizados está concentrada no Backend; não foram configurados testes de componentes (Testing Library) ou testes ponta a ponta (E2E com Playwright/Cypress) no Frontend.

---

## 🔮 O Que Seria Feito com Mais Tempo

1. **Armazenamento em Nuvem (Cloud Object Storage)**: Migração do upload de imagens locais para serviços como AWS S3, Google Cloud Storage ou Cloudflare R2, utilizando URLs pré-assinadas (*presigned URLs*) para maior segurança e escalabilidade.
2. **Paginação, Ordenação e Busca no Backend**: Implementação de paginação baseada em cursor ou offset nos endpoints de listagem (`page`, `limit`, `search`), com índices Full-Text Search no PostgreSQL para otimização de consultas.
3. **Fluxo Completo de Recuperação de Senha e Notificações**: Integração com serviços de e-mail transacional (como Resend ou Amazon SES) para confirmação de conta e redefinição de senha com links assinados.
4. **Ampliação da Cobertura de Testes Automatizados**


---

## 📡 Endpoints da API

A documentação interativa completa com schemas de requisição e resposta pode ser acessada em `/api` (Swagger). Abaixo estão os principais endpoints:

### Autenticação (`/auth`)
- `POST /auth/signup` - Cadastro de novo usuário
- `POST /auth/signin` - Autenticação e obtenção de Access Token e Refresh Token
- `POST /auth/refresh` - Renovação de tokens de acesso através do Refresh Token
- `POST /auth/logout` - Revogação de refresh tokens e encerramento de sessão *(Requer Bearer Token)*
- `GET /auth/me` - Dados do perfil do usuário logado *(Requer Bearer Token)*
- `PATCH /auth/:id` - Atualização de nome e senha *(Requer Bearer Token)*
- `DELETE /auth/:id` - Exclusão definitiva da conta de usuário *(Requer Bearer Token)*

### Veículos (`/vehicles`) - *Todos exigem Bearer Token*
- `POST /vehicles/extract-crlv` - Upload do arquivo PDF do CRLV para extração automatizada com IA
- `POST /vehicles/create` - Cadastro de novo veículo com upload de foto
- `GET /vehicles` - Listagem de todos os veículos do usuário autenticado
- `GET /vehicles/:id` - Busca detalhada de um veículo específico por ID
- `PATCH /vehicles/:id` - Atualização dos dados e foto de um veículo
- `DELETE /vehicles/:id` - Exclusão de um veículo da garagem
