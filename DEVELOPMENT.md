# Guia de Desenvolvimento - Mavit

## 🚀 Início Rápido

### 1. Setup Automático (Recomendado)
```bash
chmod +x setup.sh
./setup.sh
```

### 2. Setup Manual
```bash
# Clone e entre no diretório
git clone <repository-url>
cd mavit

# Configure as variáveis de ambiente
cp backend/.env.example backend/.env
cp .env.example .env

# Inicie os serviços
docker-compose up -d

# Execute as migrações
docker-compose exec mavit_backend npm run db:migrate
```

## 🏗️ Estrutura do Projeto

```
mavit/
├── backend/                 # API REST (Node.js + TypeScript)
│   ├── src/
│   │   ├── controllers/     # Controladores das rotas
│   │   ├── middleware/      # Middlewares (auth, validation, etc)
│   │   ├── routes/          # Definição das rotas
│   │   ├── services/        # Lógica de negócio
│   │   ├── utils/          # Utilitários (db, encryption, logger)
│   │   └── validations/    # Esquemas de validação Joi
│   ├── prisma/             # Schema e migrações do banco
│   └── logs/               # Logs da aplicação
├── frontend/               # Interface (Next.js + React)
│   ├── components/         # Componentes React
│   ├── pages/             # Páginas da aplicação
│   ├── lib/               # Utilitários do frontend
│   └── styles/            # Estilos CSS/Tailwind
└── database/              # Scripts de inicialização do DB
```

## 🛠️ Comandos Úteis

### Backend
```bash
# Entrar no container
docker-compose exec mavit_backend bash

# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Gerar cliente Prisma
npm run db:generate

# Aplicar migrações
npm run db:migrate

# Abrir Prisma Studio
npm run db:studio

# Testes
npm test
npm run test:coverage

# Build
npm run build
```

### Frontend
```bash
# Entrar no container
docker-compose exec mavit_frontend sh

# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Testes
npm test
```

### Docker
```bash
# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild
docker-compose build --no-cache

# Limpar tudo
docker-compose down -v --remove-orphans
```

## 🗄️ Banco de Dados

### Conectar ao PostgreSQL
```bash
# Através do Docker
docker-compose exec mavit_db psql -U mavit_user -d mavit_db

# URL de conexão local
postgresql://mavit_user:mavit_secure_password_2024@localhost:5432/mavit_db
```

### Migrations
```bash
# Criar nova migration
docker-compose exec mavit_backend npx prisma migrate dev --name add_new_feature

# Deploy migrations (produção)
docker-compose exec mavit_backend npx prisma migrate deploy
```

### Schema Changes
1. Modifique `backend/prisma/schema.prisma`
2. Gere o cliente: `npm run db:generate`
3. Crie a migration: `npm run db:migrate`

## 🔐 Autenticação e Segurança

### JWT Tokens
- **Access Token**: 15 minutos (padrão)
- **Refresh Token**: 7 dias (padrão)
- Armazenados em sessões no banco com validação Zero-Trust

### Criptografia E2E
```typescript
// Criptografar dados sensíveis
import { encryptData, decryptData } from '../utils/encryption';

const encrypted = encryptData(sensitiveData, userKey);
const decrypted = decryptData(encrypted, userKey);
```

### Headers de Segurança
Implementados via Helmet:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy

## 📡 API

### Swagger Documentation
- **URL**: http://localhost:3001/api-docs
- **Formato**: OpenAPI 3.0
- **Autenticação**: Bearer Token

### Estrutura de Resposta
```json
{
  "status": "success|error",
  "data": {...},
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": [...]
  }
}
```

### Rate Limiting
- **Padrão**: 100 requests/15min por IP
- **Autenticado**: Limite adicional por usuário
- **Headers**: `X-RateLimit-*` nos responses

## 🎨 Frontend

### Tema Escuro (Padrão)
```css
/* Cores principais */
--primary: #ef4444        /* Vermelho Maver Tech */
--background: #0f172a     /* Azul escuro */
--surface: #1e293b        /* Cinza escuro */
--text: #f8fafc          /* Quase branco */
```

### Componentes
```tsx
// Exemplo de componente
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md">
  Click me
</Button>
```

### Estado Global
- **Context API** para autenticação
- **Local Storage** para preferências
- **SWR/React Query** para cache de dados

## 🧪 Testes

### Backend
```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes específicos
npm test -- --grep "auth"
```

### Frontend
```bash
# Jest + Testing Library
npm test

# Testes E2E (quando implementados)
npm run test:e2e
```

## 📊 Monitoramento

### Logs
```bash
# Logs em tempo real
docker-compose logs -f mavit_backend

# Logs salvos
ls backend/logs/
```

### Health Checks
```bash
# Backend
curl http://localhost:3001/health

# Database
curl http://localhost:3001/health/db
```

### Métricas
- Tempo de resposta < 200ms
- Rate limiting por IP/usuário
- Logs estruturados (JSON)
- Eventos de segurança

## 🚀 Deploy

### Desenvolvimento
```bash
docker-compose up -d
```

### Produção
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Variáveis de Ambiente
Essenciais para produção:
- `JWT_SECRET`: Chave JWT forte
- `ENCRYPTION_KEY`: Chave E2E forte
- `DATABASE_URL`: String de conexão do banco
- `ALLOWED_ORIGINS`: Domínios permitidos

## 🐛 Debugging

### Backend
```bash
# Logs detalhados
LOG_LEVEL=debug docker-compose up

# Debug via VS Code
# Use o arquivo .vscode/launch.json
```

### Frontend
```bash
# Next.js debug mode
DEBUG=* npm run dev
```

### Database
```bash
# Prisma Studio
npm run db:studio

# Query logs
# Ver arquivo backend/logs/combined.log
```

## 📝 Padrões de Código

### Backend (TypeScript)
- **ESLint + Prettier** configurados
- **Clean Architecture** em camadas
- **Error Handling** centralizado
- **Validação** com Joi
- **Logs** estruturados com Winston

### Frontend (React/Next.js)
- **TypeScript** strict mode
- **ESLint + Prettier** configurados
- **Tailwind CSS** para estilos
- **Components** reutilizáveis
- **Hooks** customizados

### Commits
```bash
# Padrão conventional commits
feat: add user authentication
fix: resolve login validation bug
docs: update API documentation
style: format code with prettier
refactor: improve error handling
test: add unit tests for auth
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Abra um Pull Request

### Code Review
- ✅ Testes passando
- ✅ Código formatado
- ✅ Documentação atualizada
- ✅ Performance verificada
- ✅ Segurança revisada

---

**Dúvidas?** Abra uma [Issue](https://github.com/mavertech/mavit/issues) ou entre em contato com a equipe Maver Tech.