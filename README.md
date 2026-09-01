# Image Processing Platform

Plataforma de processamento de imagens construída com NestJS, TypeScript e arquitetura Clean Architecture.

## Objetivo

API para upload e processamento assíncrono de imagens. O sistema recebe imagens via upload, armazena no S3, envia para uma fila SQS e um worker processa as imagens de forma assíncrona.

## Arquitetura

```
Cliente
   |
   | POST /images
   v
NestJS API
   |
   ├── salva informações no PostgreSQL
   ├── envia imagem para S3
   └── envia mensagem para SQS
              |
              v
        Image Worker
              |
              ├── recebe mensagem
              ├── baixa imagem do S3
              ├── processa com Sharp
              ├── gera imagem otimizada (WebP)
              ├── gera thumbnail
              ├── envia resultados para S3
              └── atualiza status no PostgreSQL
```

### Separação de Responsabilidades

- **Domain**: Entidades, interfaces e regras de negócio
- **Application**: Use cases e DTOs
- **Infrastructure**: Drizzle ORM, AWS SDK, configurações
- **Presentation**: Controllers e validação

## Stack

- NestJS
- TypeScript
- Drizzle ORM
- PostgreSQL
- Docker / Docker Compose
- AWS SDK v3 (S3, SQS)
- Sharp
- class-validator / class-transformer
- Jest

## Estrutura de Pastas

```
src/
├── modules/
│   ├── images/
│   │   ├── domain/          # Entidades e interfaces
│   │   ├── application/     # Use cases e DTOs
│   │   ├── infrastructure/  # Implementações (Drizzle)
│   │   └── presentation/    # Controllers
│   ├── health/
│   └── users/
├── infra/
│   ├── database/            # Drizzle ORM, schema
│   ├── aws/                 # S3, SQS
│   └── config/
├── workers/
│   └── image-processing/    # Worker de processamento
├── app.module.ts
└── main.ts
```

## Como Executar Localmente

### 1. Iniciar PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais AWS.

### 4. Executar Migrations

```bash
npm run db:migrate
```

### 5. Iniciar API

```bash
npm run start:dev
```

### 6. Iniciar Worker

```bash
npm run worker:dev
```

## Variáveis de Ambiente

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/image_processing
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
AWS_SQS_QUEUE_URL=
```

## Endpoints

### Upload de Imagem

```http
POST /images
Content-Type: multipart/form-data
```

### Listar Imagens

```http
GET /images?limit=10&offset=0
```

### Obter Imagem

```http
GET /images/:id
```

### Deletar Imagem

```http
DELETE /images/:id
```

### Health Check

```http
GET /health
```

## Scripts

```bash
npm run start          # Iniciar aplicação
npm run start:dev      # Iniciar em modo desenvolvimento
npm run build          # Build da aplicação
npm run lint           # Verificar lint
npm run test           # Executar testes
npm run test:watch     # Testes em watch mode
npm run test:cov       # Testes com cobertura
npm run db:generate    # Gerar migrations
npm run db:migrate     # Executar migrations
npm run db:studio      # Abrir Drizzle Studio
npm run db:push        # Push schema para banco
npm run worker         # Iniciar worker
npm run worker:dev     # Iniciar worker em modo desenvolvimento
```

## Decisões Arquiteturais

1. **Clean Architecture**: Separação clara entre Domain, Application, Infrastructure e Presentation
2. **Repository Pattern**: Interfaces no domínio, implementações na infraestrutura
3. **Dependency Injection**: Tokens para interfaces, facilitando testes e troca de implementações
4. **Abstrações AWS**: Interfaces `FileStorage` e `MessageQueue` abstraem S3 e SQS
5. **Worker Separado**: Processamento assíncrono em módulo independente
6. **Idempotência**: Worker verifica status antes de processar

## Próximos Passos de Infraestrutura

- Terraform
- AWS VPC
- ECS Fargate
- ECR
- RDS
- S3
- SQS
- IAM
- CloudWatch
- CI/CD
