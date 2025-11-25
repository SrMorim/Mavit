# Mavit - Mega App de Produtividade

![Mavit Logo](https://via.placeholder.com/200x100/ef4444/ffffff?text=MAVIT)

**Mavit** é um mega app de produtividade desenvolvido pela **Maver Tech** que centraliza todas as suas necessidades de organização pessoal e financeira em uma única plataforma segura e integrada.

## 🚀 Características Principais

### 🔥 5 Módulos Integrados
- **📋 Backlog**: Gerenciamento de tarefas similar ao Azure DevOps
- **📅 Calendário**: Eventos e lembretes com sincronização automática
- **📝 Bloco de Notas**: Editor rico para ideias e anotações
- **📑 Listas**: Listas de tarefas simples estilo Apple Reminders
- **💰 Finanças**: Controle completo de gastos, assinaturas e insights financeiros

### 🔐 Segurança e Privacidade
- **🛡️ Criptografia End-to-End**: Todos os dados sensíveis são criptografados
- **🔒 Arquitetura Zero-Trust**: Verificação contínua de autenticação
- **🚫 Zero Coleta de Dados**: Nenhum dado é vendido ou usado para fins comerciais
- **📋 Conformidade LGPD/GDPR**: Totalmente compatível com leis de privacidade

### 🎨 Design e Experiência
- **🌙 Tema Escuro**: Interface inspirada no design da Apple
- **❤️ Detalhes em Vermelho**: Cores da marca Maver Tech
- **📱 Responsivo**: Compatível com todos os dispositivos
- **⚡ Performance**: Tempo de resposta < 200ms

## 🏗️ Arquitetura

```
Mavit/
├── 🐳 docker-compose.yml      # Orquestração dos containers
├── 📁 backend/                # API REST com Node.js + TypeScript
│   ├── 🗄️ prisma/            # Schema do banco de dados
│   ├── 📝 src/               # Código fonte do backend
│   └── 🐳 Dockerfile         # Container do backend
├── 📁 frontend/               # Next.js + React + TypeScript
│   ├── 🎨 components/        # Componentes React
│   ├── 📄 pages/             # Páginas da aplicação
│   └── 🐳 Dockerfile         # Container do frontend
├── 📁 database/               # Scripts de inicialização do DB
└── 📁 docs/                   # Documentação do projeto
```

## 🛠️ Stack Tecnológica

### Backend
- **Node.js** + **TypeScript** + **Express**
- **Prisma ORM** com **PostgreSQL**
- **JWT** para autenticação
- **Docker** para containerização
- **Winston** para logging
- **Swagger** para documentação da API

### Frontend  
- **Next.js 14** + **React 18** + **TypeScript**
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **React Hook Form** + **Zod** para formulários
- **Axios** para requisições HTTP
- **Recharts** para gráficos financeiros

### DevOps & Segurança
- **Docker Compose** para desenvolvimento
- **PostgreSQL** como banco principal
- **Helmet** para headers de segurança
- **Rate Limiting** para proteção contra ataques
- **bcrypt** para hash de senhas

## 🚦 Como Iniciar

### Pré-requisitos
- **Docker** e **Docker Compose** instalados
- **Node.js 18+** (opcional, para desenvolvimento local)
- **Git** para clonagem do repositório

### 1️⃣ Clone o Repositório
```bash
git clone https://github.com/mavertech/mavit.git
cd mavit
```

### 2️⃣ Configure as Variáveis de Ambiente
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend (se necessário)
cp frontend/.env.example frontend/.env.local
```

### 3️⃣ Inicie com Docker
```bash
# Inicia todos os serviços (database, backend, frontend)
docker-compose up -d

# Ou para ver os logs em tempo real
docker-compose up
```

### 4️⃣ Execute as Migrações do Banco
```bash
# Entre no container do backend
docker-compose exec mavit_backend bash

# Execute as migrações
npm run db:migrate
```

### 5️⃣ Acesse a Aplicação
- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:3001
- **Documentação da API**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## 📚 Documentação da API

A API REST está completamente documentada usando **Swagger/OpenAPI 3.0**.

Acesse: http://localhost:3001/api-docs

### Principais Endpoints

#### 🔐 Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Renovar token

#### 👤 Usuário
- `GET /api/users/me` - Perfil do usuário
- `PUT /api/users/me` - Atualizar perfil
- `GET /api/users/sessions` - Sessões ativas

#### 📋 Tarefas (Backlog)
- `GET /api/tasks` - Listar tarefas
- `POST /api/tasks` - Criar tarefa
- `PUT /api/tasks/:id` - Atualizar tarefa
- `DELETE /api/tasks/:id` - Excluir tarefa

#### 📅 Eventos (Calendário)
- `GET /api/events` - Listar eventos
- `POST /api/events` - Criar evento
- `PUT /api/events/:id` - Atualizar evento

#### 💰 Finanças
- `GET /api/transactions` - Transações
- `POST /api/transactions` - Nova transação
- `GET /api/subscriptions` - Assinaturas
- `GET /api/analytics/financial` - Insights financeiros

## 🔧 Desenvolvimento Local

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Banco de Dados
```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar migrações
npm run db:migrate

# Abrir Prisma Studio
npm run db:studio
```

## 🧪 Testes

```bash
# Backend
cd backend
npm test
npm run test:coverage

# Frontend
cd frontend
npm test
npm run test:coverage
```

## 📈 Monitoramento e Logs

### Logs do Backend
```bash
# Ver logs em tempo real
docker-compose logs -f mavit_backend

# Logs salvos em arquivos
ls backend/logs/
```

### Health Check
```bash
curl http://localhost:3001/health
```

## 🔒 Segurança

### Recursos Implementados
- ✅ Criptografia E2E para dados sensíveis
- ✅ Autenticação JWT com refresh tokens
- ✅ Rate limiting por IP e usuário
- ✅ Validação rigorosa de entrada
- ✅ Headers de segurança (Helmet)
- ✅ Sanitização de HTML/XSS
- ✅ Logging de eventos de segurança
- ✅ Sessões com timeout automático

### Configurações de Produção
Para produção, certifique-se de:
1. Alterar todas as chaves secretas
2. Usar HTTPS em todos os endpoints
3. Configurar firewall adequado
4. Fazer backups regulares do banco
5. Monitorar logs de segurança

## 🚀 Deploy em Produção

### Docker Production
```bash
# Build das imagens otimizadas
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Variáveis de Ambiente (Produção)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-db:5432/mavit_prod
JWT_SECRET=super-secret-production-key
ENCRYPTION_KEY=production-encryption-master-key
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Faça commit das mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Suporte

### Maver Tech
- **Website**: https://mavertech.com
- **Email**: suporte@mavertech.com
- **Issues**: https://github.com/mavertech/mavit/issues

### Documentação Adicional
- [Guia de Instalação Detalhado](docs/installation-guide.md)
- [Guia de Desenvolvimento](docs/development-guide.md)
- [Documentação da API](docs/api-reference.md)
- [Guia de Segurança](docs/security-guide.md)

---

**Desenvolvido com ❤️ pela equipe Maver Tech**

*Mavit - Sua produtividade, nossa prioridade.*