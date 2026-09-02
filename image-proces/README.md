# Image Processing Platform

API para upload e processamento assíncrono de imagens. O sistema recebe imagens, armazena no S3, envia para uma fila SQS e um worker processa as imagens (otimiza para WebP e gera thumbnail).

## Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm

## Como Rodar

### 1. Subir infraestrutura (PostgreSQL + Floci/S3/SQS)

```bash
docker compose up -d postgres floci
```

| Serviço | Porta |
|---------|-------|
| PostgreSQL | `localhost:5433` |
| Floci (S3/SQS) | `localhost:4566` |

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

### 4. Rodar migrations

```bash
npm run db:migrate
```

### 5. Criar bucket S3 no Floci

```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://image-processing-bucket --region us-east-1
```

### 6. Iniciar API e Worker (em terminais separados)

```bash
# Terminal 1 - API (porta 3000)
npm run start:dev

# Terminal 2 - Worker
npm run worker:dev
```

A API estará disponível em `http://localhost:3000`.

> **Docker Compose**: Se rodar tudo via `docker compose up`, a API fica em `http://localhost:3002`.

---

## Endpoints

### Upload de imagem

```bash
curl -X POST http://localhost:3000/images \
  -F "file=@sua-imagem.jpg"
```

Resposta:
```json
{
  "id": "uuid-da-imagem",
  "status": "UPLOADED"
}
```

### Listar imagens

```bash
curl http://localhost:3000/images
curl "http://localhost:3000/images?limit=5&offset=0"
```

### Buscar imagem por ID

```bash
curl http://localhost:3000/images/{id}
```

### Deletar imagem

```bash
curl -X DELETE http://localhost:3000/images/{id}
```

### Health check

```bash
curl http://localhost:3000/health
```

---

## Fluxo de Processamento

1. Usuário envia imagem via `POST /images`
2. API salva no PostgreSQL (status: `UPLOADED`), envia para S3 e envia mensagem para SQS
3. Worker recebe a mensagem, baixa do S3, processa com Sharp (gera WebP + thumbnail)
4. Worker salva os arquivos processados no S3 e atualiza o status para `PROCESSED`

Status possíveis: `UPLOADED` → `PROCESSING` → `PROCESSED` | `FAILED`

---

## Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | API em modo dev (hot reload) - porta 3000 |
| `npm run worker:dev` | Worker em modo dev |
| `npm run db:push` | Push do schema para o banco |
| `npm run db:studio` | Abrir Drizzle Studio (UI do banco) |
| `npm run test` | Rodar testes |
| `npm run lint` | Verificar lint |

---

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `PORT` | Porta da API | `3000` |
| `DATABASE_URL` | URL do PostgreSQL | `postgresql://postgres:postgres@localhost:5433/image_processing` |
| `AWS_REGION` | Região AWS | `us-east-1` |
| `AWS_ENDPOINT` | Endpoint do S3/SQS (Floci) | `http://localhost:4566` |
| `AWS_S3_BUCKET` | Nome do bucket | `image-processing-bucket` |
| `AWS_SQS_QUEUE_URL` | URL da fila SQS | `http://localhost:4566/000000000000/image-processing` |
