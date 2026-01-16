# Gupy Job Scraper

Aplicação web para filtrar, buscar e gerenciar vagas de emprego da Gupy.
Essa nova versão possui interface para configurar buscas, visualizar resultados e gerenciar vagas encontradas.

Projeto ainda em desenvolvimento

## Arquitetura

- **Backend**: Django + Django REST Framework (API REST)
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Banco de Dados**: SQLite
- **Single-user**: sem autenticação de usuários por enquanto

## Configuração

### Variáveis de Ambiente (Opcional)

O projeto funciona sem arquivo `.env` usando valores padrão. Se quiser personalizar, crie um arquivo `.env` na raiz do projeto:

```env
# Django
SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=*
```

**Nota:** Todas essas variáveis têm valores padrão no código, então o arquivo `.env` é opcional para desenvolvimento. É recomendado apenas se você precisar de configurações específicas. O arquivo `.env` é montado automaticamente no container do backend via Docker Compose se existir.

#### Frontend

A variável `NEXT_PUBLIC_API_URL` já está configurada no `docker-compose.yml` como `http://localhost:8000`. Não é necessário criar `.env.local` quando usando Docker.

#### Banco de Dados

As migrações são executadas automaticamente no startup do backend. O banco de dados SQLite é persistido através do volume montado `./apps/api:/app` no Docker Compose (arquivo `db.sqlite3` será criado em `apps/api/` no host).

## Pré-requisitos

- Docker
- Docker Compose

**Não é necessário instalar Python, Node.js, pnpm ou qualquer outra dependência localmente.**

## Uso

### Executar a Aplicação

Execute a aplicação completa com Docker Compose:

```bash
# Build e start dos serviços
docker-compose up --build

# Ou apenas start (se já buildou antes)
docker-compose up
```

**Como funciona:**
- Dependências Python e Node.js são instaladas automaticamente dentro dos containers
- O package scraper (`packages/scraper`) é instalado automaticamente no backend
- Migrações do banco são executadas automaticamente no startup
- Código é montado como volume para hot reload (alterações são refletidas automaticamente)
- Backend Django na porta 8000
- Frontend Next.js na porta 3000

**Acesse:** http://localhost:3000

### Executar Apenas Backend ou Frontend

```bash
# Apenas backend (porta 8000)
docker-compose up --build backend

# Apenas frontend (backend precisa estar rodando separadamente para a API funcionar)
docker-compose up --build frontend
```

### Comandos Úteis

#### Docker Compose

```bash
# Parar os serviços
docker-compose down

# Parar e remover volumes (limpar banco de dados)
docker-compose down -v

# Rebuild completo sem cache
docker-compose build --no-cache

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### Backend Django (via Docker)

```bash
# Criar migrações (se mudar models)
docker-compose exec backend python manage.py makemigrations

# Aplicar migrações
docker-compose exec backend python manage.py migrate

# Criar superusuário (para admin)
docker-compose exec backend python manage.py createsuperuser

# Acessar admin
# http://localhost:8000/admin

# Shell do Django
docker-compose exec backend python manage.py shell

# Executar comando genérico
docker-compose exec backend python manage.py <comando>
```

#### Frontend Next.js (via Docker)

```bash
# Rodar dev (já está rodando via docker-compose)
docker-compose exec frontend pnpm run dev

# Build de produção
docker-compose exec frontend pnpm run build

# Executar comando genérico
docker-compose exec frontend pnpm <comando>
```

**Nota:** Se o container não estiver rodando, use `docker-compose run --rm frontend` ao invés de `docker-compose exec frontend`.

### Qualidade de Código (Frontend)

```bash
# Executar lint (ESLint)
docker-compose exec frontend pnpm run lint

# Checagem TypeScript (sem emitir arquivos)
docker-compose exec frontend pnpm exec tsc --noEmit

# Executar lint e checagem TypeScript em sequência
docker-compose exec frontend sh -c "pnpm run lint && pnpm exec tsc --noEmit"
```

## API Endpoints

### Configs

- `GET /api/configs/` - Listar configurações
- `POST /api/configs/` - Criar configuração
- `GET /api/configs/latest/` - Última configuração

### Searches

- `GET /api/searches/` - Listar buscas
- `POST /api/searches/` - Criar nova busca
- `GET /api/searches/{id}/status/` - Status da busca

### Vacancies

- `GET /api/vacancies/` - Listar vagas (query params: search_id, exclude_deleted)
- `POST /api/vacancies/{id}/view/` - Marcar vaga como vista
- `POST /api/vacancies/{id}/delete/` - Soft delete de vaga
- `GET /api/vacancies/open-all-unviewed/` - URLs de vagas não vistas

## Funcionalidades

1. **Configuração de Busca**: Formulário para configurar parâmetros de busca
2. **Busca Assíncrona**: Busca de vagas em background com atualização de status
3. **Tabela de Vagas**: Exibição de vagas com filtros e ações
4. **Marcar como Vista**: Ao clicar em "Ver Vaga", a vaga é marcada como vista
5. **Soft Delete**: Exclusão visual de vagas (não remove do banco)
6. **Abrir Todas Não Vistas**: Botão para abrir todas as vagas não vistas em novas abas

## Testes

### Backend (via Docker)

```bash
# Executar todos os testes
docker-compose exec backend pytest jobs/tests/ -v

# Executar com coverage
docker-compose exec backend pytest jobs/tests/ --cov=jobs --cov-report=html

# Executar testes específicos
docker-compose exec backend pytest jobs/tests/test_utils.py -v
docker-compose exec backend pytest jobs/tests/test_services.py -v
```

### Frontend (via Docker)

```bash
# Executar testes
docker-compose exec frontend pnpm test

# Testes em modo watch
docker-compose exec frontend pnpm run test:watch

# Coverage
docker-compose exec frontend pnpm run test:coverage
```

**Nota:** Se o container não estiver rodando, use `docker-compose run --rm frontend` ao invés de `docker-compose exec frontend`.

## Migrations (Banco de Dados)

As migrations são versionadas no repositório em `apps/api/jobs/migrations/`.

### Aplicar migrations

As migrations são aplicadas automaticamente ao iniciar o container. Para aplicar manualmente:

```bash
docker-compose exec backend python manage.py migrate
```

### Criar novas migrations

Após alterar os models em `apps/api/jobs/models.py`:

```bash
docker-compose exec backend python manage.py makemigrations
```

### Verificar status das migrations

```bash
# Ver quais migrations foram aplicadas
docker-compose exec backend python manage.py showmigrations

# Verificar se há migrations pendentes de criação
docker-compose exec backend python manage.py makemigrations --check --dry-run
```

### Boas práticas

- Sempre commitar as migrations junto com as mudanças nos models
- Nunca editar migrations já aplicadas em produção
- Revisar o conteúdo das migrations antes de commitar

## Estrutura do Projeto

```
.
├── apps/
│   ├── api/                   # Backend Django
│   │   ├── jobs/              # App Django para gerenciar vagas
│   │   │   ├── tests/         # Testes do backend
│   │   │   ├── models.py      # Modelos de dados
│   │   │   ├── services.py    # Lógica de scraping
│   │   │   ├── views.py       # Viewsets da API
│   │   │   └── ...
│   │   ├── scraper/           # Projeto Django
│   │   ├── manage.py          # Django management script
│   │   └── requirements.txt   # Dependências Python
│   └── frontend/              # Aplicação Next.js
│       ├── app/               # App router do Next.js
│       ├── components/        # Componentes React
│       ├── hooks/             # React hooks
│       └── ...
├── packages/
│   └── scraper/               # Package reutilizável para scraping
│       └── gupy_scraper/      # Código do scraper
├── docker-compose.yml         # Docker Compose para aplicação web
├── Dockerfile.backend         # Dockerfile para Django
└── README.md                  # Este arquivo
```

### Arquitetura

- **Backend (apps/api)**: Django + Django REST Framework
  - Utiliza o package `packages/scraper` para fazer scraping da API Gupy
  - O package é instalado em modo desenvolvimento dentro do container Docker
- **Frontend (apps/frontend)**: Next.js + TypeScript + Tailwind CSS
- **Package Scraper (packages/scraper)**: Package Python reutilizável para scraping da API Gupy

## Modelos de Banco de Dados

- **Config**: Configurações de busca
- **Search**: Buscas executadas com snapshot da config
- **Vacancy**: Vagas encontradas (unique por job_id)
- **SearchVacancy**: Relacionamento ManyToMany entre Search e Vacancy

## Trabalhando com o Package Scraper

O package scraper (`packages/scraper`) é instalado automaticamente no backend em modo desenvolvimento. Para fazer alterações:

1. Edite os arquivos em `packages/scraper/gupy_scraper/`
2. As alterações são refletidas automaticamente via hot reload (volume montado)
3. Se necessário, reinicie o container: `docker-compose restart backend`

### Adicionar Nova Funcionalidade ao Scraper

1. Edite os arquivos em `packages/scraper/gupy_scraper/`
2. O package é instalado em modo desenvolvimento (`pip install -e`), então as alterações são imediatas
3. Teste importando no backend: `from gupy_scraper import JobScraperService`

## Troubleshooting

### Backend não inicia

- Verifique se Docker está rodando
- Verifique logs: `docker-compose logs backend`
- Verifique se a porta 8000 está livre
- Tente rebuild: `docker-compose build --no-cache backend`

### Frontend não conecta ao backend

- Certifique-se que o backend está rodando: `docker-compose ps`
- Verifique logs do backend: `docker-compose logs backend`
- Verifique CORS no `apps/api/scraper/settings.py`
- Verifique se `NEXT_PUBLIC_API_URL` está correto no `docker-compose.yml`

### Erro de migrações

```bash
# Resetar banco (CUIDADO: apaga dados)
docker-compose down -v
docker-compose up --build
```

### Problemas com Docker

```bash
# Rebuild completo sem cache
docker-compose build --no-cache
docker-compose up

# Limpar containers e volumes
docker-compose down -v

# Ver logs detalhados
docker-compose logs -f
```

### Package Scraper não é encontrado

- Verifique se o volume está montado corretamente no `docker-compose.yml`
- Verifique se o package está sendo instalado no Dockerfile: `pip install -e /app/packages/scraper`
- Rebuild o backend: `docker-compose build --no-cache backend`

## Notas Importantes

- Vagas duplicadas são evitadas através de unique constraint em `job_id`
- Soft delete: vagas excluídas têm `deleted_at` preenchido
- Vagas vistas têm `viewed_at` preenchido
- A lógica de scraping está centralizada em `jobs/services.py`

## Links Úteis

- API Gupy: https://employability-portal.gupy.io/api/v1/jobs
- Docs Gupy: https://developers.gupy.io/reference/authentication

## Contribuições

Sinta-se à vontade para enviar pull requests.