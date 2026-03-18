# Lumina

**Plataforma de estudos com IA — flashcards, correção de redações e planos de estudo a partir dos seus PDFs.**

[Instalação](#instalação) · [Funcionalidades](#funcionalidades) · [Tecnologias](#tecnologias) · [Contribuindo](#contribuindo)

</div>

---

## O que é

Lumina é uma plataforma fullstack de estudos que usa IA para transformar material de estudo em algo prático. Você envia um PDF, ela gera flashcards. Você escreve uma redação, ela corrige com feedback detalhado. Você informa o tema e a disponibilidade de tempo, ela monta um plano semanal.

A interface é em dark mode com uma paleta dourada, e o progresso de estudos fica registrado num heatmap estilo GitHub.

---

## Funcionalidades

### PDFs
- Upload por drag-and-drop (até 20MB)
- Extração automática de texto
- Geração de 10, 20, 30 ou 50 flashcards com IA a partir do conteúdo

### Flashcards
- Cards com flip 3D animado
- Revisão sequencial com avaliação em três níveis: *Não sabia · Sabia · Sabia bem*
- Filtros por material e tema
- Registro automático de sessões com pontuação

### Redação
- Editor com contagem de palavras em tempo real
- A IA retorna: nota de 0 a 10, feedback geral, pontos fortes, melhorias por categoria e uma reescrita da introdução
- Histórico completo de redações salvo

### Plano de Estudos
- Você informa tema, duração, nível e carga horária
- A IA gera um plano semanal com metas, tarefas diárias e proposta de redação
- Timeline interativa com checklist e progresso por semana

### Frequência
- Heatmap com gradiente dourado, igual ao do GitHub
- Streak de dias consecutivos
- Gráficos de barras, linha e pizza com Recharts
- Badges desbloqueáveis: Primeiro PDF · 7 Dias Seguidos · 50 Flashcards · Nota 9+

### Dashboard
- Saudação por horário do dia
- Resumo de PDFs, flashcards, streak e média das redações
- Gráfico de atividade dos últimos 30 dias

### Configurações
- Alteração de nome, e-mail e senha
- Exclusão de conta com confirmação

---

## Tecnologias

**Frontend:** React 18, React Router v6, Framer Motion, Recharts, react-dropzone, Axios

**Backend:** Node.js + Express, sql.js (SQLite sem compilação nativa), multer, pdf-parse, bcryptjs, jsonwebtoken

**IA:** Google Gemini API — usada para gerar flashcards, corrigir redações e criar planos de estudo

**Design:** Paleta própria com preto `#0A0A0A`, bege `#F5EDD9` e dourado `#C9A84C / #E6C56B`. Fontes Playfair Display e DM Sans. Partículas douradas animadas em canvas.

---

## Estrutura do Projeto

```
lumina/
├── backend/
│   ├── db/database.js
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── materials.js
│   │   ├── flashcards.js
│   │   ├── essays.js
│   │   ├── plans.js
│   │   ├── dashboard.js
│   │   └── users.js
│   ├── utils/gemini.js
│   ├── server.js
│   └── .env
│
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        ├── utils/api.js
        ├── App.js
        └── index.css
```

---

## Instalação

**Pré-requisitos:** Node.js v18+ e uma chave da [Google Gemini API](https://aistudio.google.com/apikey) (gratuita).

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/lumina.git
cd lumina
```

### 2. Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` dentro de `backend/`:

```env
PORT=5000
JWT_SECRET=sua_chave_secreta_aqui
GEMINI_API_KEY=sua_chave_gemini_aqui
FRONTEND_URL=http://localhost:3000
```

Inicie o servidor:

```bash
node server.js
```

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Abre em `http://localhost:3000`.

---

## Banco de Dados

O arquivo `lumina.db` é criado automaticamente na primeira execução:

```sql
users(id, full_name, email, password_hash, created_at)
study_materials(id, user_id, title, filename, extracted_text, created_at)
flashcards(id, user_id, material_id, question, answer, source_type, topic_name, created_at)
study_sessions(id, user_id, date, duration_minutes, topic, cards_reviewed, score_percent, created_at)
essays(id, user_id, topic_name, content, feedback_json, score, created_at)
study_plans(id, user_id, topic_name, plan_json, created_at)
frequency_log(id, user_id, date, activity_type, created_at)
```

---

## Segurança

- Senhas com bcrypt (salt 12)
- Autenticação JWT com expiração de 7 dias
- A chave da Gemini API nunca é exposta no frontend — todas as chamadas passam pelo backend
- `.env` no `.gitignore`

---

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|:-----------:|
| `PORT` | Porta do servidor (padrão: 5000) | Não |
| `JWT_SECRET` | Chave para assinar tokens JWT | Sim |
| `GEMINI_API_KEY` | Chave da Google Gemini API | Sim |
| `FRONTEND_URL` | URL do frontend para CORS | Não |

---

## Contribuindo

1. Fork o projeto
2. Crie sua branch: `git checkout -b feature/minha-feature`
3. Commit: `git commit -m 'feat: descrição da mudança'`
4. Push: `git push origin feature/minha-feature`
5. Abra um Pull Request

---

## Licença

MIT. Veja `LICENSE` para mais detalhes.
