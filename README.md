# 🔥 Lumina — Plataforma de Estudos com IA

Plataforma fullstack de estudos com inteligência artificial: geração de flashcards a partir de PDFs, correção de redações, planos de estudos personalizados, heatmap de frequência e muito mais.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18, React Router v6, Framer Motion, Recharts, react-dropzone |
| Backend | Node.js, Express, better-sqlite3, multer, pdf-parse |
| Auth | bcryptjs + JWT (7 dias) |
| IA | Anthropic Claude (claude-sonnet-4-20250514) |
| Banco | SQLite (lumina.db) |

## Estrutura

```
lumina/
├── backend/
│   ├── db/database.js       # Schema SQLite
│   ├── middleware/auth.js   # JWT middleware
│   ├── routes/
│   │   ├── auth.js          # Login/cadastro
│   │   ├── materials.js     # PDFs + geração flashcards
│   │   ├── flashcards.js    # CRUD + sessões de revisão
│   │   ├── essays.js        # Correção de redações
│   │   ├── plans.js         # Planos de estudo
│   │   ├── dashboard.js     # Stats + frequência
│   │   └── users.js         # Configurações de conta
│   ├── server.js
│   └── .env
└── frontend/
    ├── public/index.html
    └── src/
        ├── components/      # Layout, Sidebar, Toast, Particles
        ├── context/         # AuthContext
        ├── hooks/           # useToast
        ├── pages/           # Todas as páginas
        ├── utils/api.js     # Axios configurado
        ├── App.js
        └── index.css        # Design system
```

## Instalação e execução

### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env .env.local
# Edite .env com suas chaves:
#   JWT_SECRET=sua_chave_secreta_forte
#   ANTHROPIC_API_KEY=sk-ant-...

# Iniciar servidor
npm start
# Servidor rodará em http://localhost:5000
```

### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar API URL (já configurado para localhost)
# REACT_APP_API_URL=http://localhost:5000

# Iniciar
npm start
# App rodará em http://localhost:3000
```

## Configuração do .env (Backend)

```env
PORT=5000
JWT_SECRET=lumina_jwt_super_secreto_troque_isso
ANTHROPIC_API_KEY=sk-ant-api03-...
FRONTEND_URL=http://localhost:3000
```

## Funcionalidades

| Página | Funcionalidade |
|--------|---------------|
| **Dashboard** | Saudação personalizada, cards de resumo, gráfico 30 dias |
| **Meus PDFs** | Drag-and-drop, extração de texto, geração de 10/20/30/50 flashcards |
| **Flashcards** | Revisão sequencial com flip 3D, avaliação, registro de sessão |
| **Redação** | Editor + correção IA com nota, pontos fortes, melhorias, intro reescrita |
| **Plano de Estudos** | Formulário → Claude gera plano semanal com tarefas, metas, checklist |
| **Frequência** | Heatmap GitHub-style, gráficos Recharts, badges de conquistas |
| **Configurações** | Alterar nome/email/senha, excluir conta |

## Segurança

- Senhas com bcrypt (salt 12)
- JWT com expiração de 7 dias
- Chave Anthropic **nunca exposta no frontend**
- Todas chamadas IA passam pelo backend
- Validações em todos os endpoints

## Paleta de cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--black` | `#0A0A0A` | Fundo principal |
| `--black-card` | `#161616` | Cards e superfícies |
| `--beige` | `#E8DCC8` | Texto em destaque |
| `--gold` | `#C9A84C` | Cor primária de ação |
| `--gold-light` | `#E6C56B` | Hover e gradientes |
