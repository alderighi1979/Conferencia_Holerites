# Sistema de Conferência de Folha de Pagamento

Sistema completo de conferência de folha de pagamento com backend em Python (FastAPI) e frontend em React (Tailwind CSS).

## 📋 Estrutura do Projeto

```
.
├── app/                    # Backend FastAPI
│   ├── main.py            # Aplicação principal
│   ├── models.py          # Modelos SQLAlchemy
│   ├── schemas.py         # Schemas Pydantic
│   ├── routers/           # Rotas da API
│   └── services/          # Lógica de negócio
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   └── services/      # Serviços de API
│   └── package.json
├── requirements.txt       # Dependências Python
└── README.md
```

## 🚀 Início Rápido

> 📖 **Para um guia detalhado passo a passo, consulte o arquivo [GUIA_INICIO_RAPIDO.md](./GUIA_INICIO_RAPIDO.md)**

### Backend

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Configure o banco de dados (opcional):
```bash
copy .env.example .env  # Windows
# ou
cp .env.example .env    # Linux/Mac
# Edite o .env se necessário
```

3. Execute o servidor:
```bash
uvicorn app.main:app --reload
```

O backend estará disponível em: `http://localhost:8000`
- Documentação: `http://localhost:8000/docs`

### Frontend

1. Navegue até o diretório frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

### ⚡ Início Rápido (Resumo)

**Terminal 1 - Backend:**
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Acesse:** http://localhost:3000

## 📚 Documentação Completa

- [Backend README](./README.md) - Documentação detalhada do backend
- [Frontend README](./frontend/README.md) - Documentação detalhada do frontend

## 📋 Funcionalidades

- **Tabela INSS**: Gerenciamento de faixas salariais, alíquotas e valores a deduzir
- **Tabela IRRF**: Gerenciamento de faixas salariais, alíquotas, parcelas a deduzir e valores por dependente
- **Configuração Simplificada**: Gerenciamento do valor de desconto padrão do novo cálculo de IRRF
- **Eventos**: Gerenciamento de eventos com incidências (INSS, FGTS, IRRF) para Mensal, 13º e Férias

## 🚀 Instalação

### Pré-requisitos

- Python 3.8 ou superior
- pip (gerenciador de pacotes Python)

### Passos

1. Clone o repositório ou navegue até o diretório do projeto

2. Crie um ambiente virtual (recomendado):
```bash
python -m venv venv
```

3. Ative o ambiente virtual:
   - Windows:
   ```bash
   venv\Scripts\activate
   ```
   - Linux/Mac:
   ```bash
   source venv/bin/activate
   ```

4. Instale as dependências:
```bash
pip install -r requirements.txt
```

5. Configure o banco de dados:
   - Copie o arquivo `.env.example` para `.env`:
   ```bash
   copy .env.example .env
   ```
   - Edite o arquivo `.env` e configure a URL do banco de dados (por padrão, usa SQLite)

## 🏃 Executando a Aplicação

Para iniciar o servidor, execute:

```bash
uvicorn app.main:app --reload
```

O servidor estará disponível em: `http://localhost:8000`

### Documentação Interativa

Acesse a documentação interativa da API:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📚 Estrutura do Projeto

```
.
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicação principal FastAPI
│   ├── database.py          # Configuração do banco de dados
│   ├── models.py            # Modelos SQLAlchemy
│   ├── schemas.py           # Schemas Pydantic para validação
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── inss.py          # Rotas CRUD para INSS
│   │   ├── irrf.py          # Rotas CRUD para IRRF
│   │   ├── config_simplificada.py  # Rotas CRUD para Config Simplificada
│   │   ├── eventos.py       # Rotas CRUD para Eventos
│   │   └── calculo.py       # Rotas para cálculo de folha
│   └── services/
│       ├── __init__.py
│       └── calculo_service.py  # Lógica de cálculo de folha
├── requirements.txt         # Dependências do projeto
├── .env.example            # Exemplo de configuração
└── README.md               # Este arquivo
```

## 🔌 Endpoints da API

### Tabela INSS
- `POST /api/inss/` - Criar nova faixa
- `GET /api/inss/` - Listar todas as faixas
- `GET /api/inss/{id}` - Obter faixa específica
- `PUT /api/inss/{id}` - Atualizar faixa
- `DELETE /api/inss/{id}` - Deletar faixa

### Tabela IRRF
- `POST /api/irrf/` - Criar nova faixa
- `GET /api/irrf/` - Listar todas as faixas
- `GET /api/irrf/{id}` - Obter faixa específica
- `PUT /api/irrf/{id}` - Atualizar faixa
- `DELETE /api/irrf/{id}` - Deletar faixa

### Configuração Simplificada
- `POST /api/config-simplificada/` - Criar nova configuração
- `GET /api/config-simplificada/` - Listar todas as configurações
- `GET /api/config-simplificada/{id}` - Obter configuração específica
- `PUT /api/config-simplificada/{id}` - Atualizar configuração
- `DELETE /api/config-simplificada/{id}` - Deletar configuração

### Eventos
- `POST /api/eventos/` - Criar novo evento
- `GET /api/eventos/` - Listar todos os eventos
- `GET /api/eventos/{codigo_evento}` - Obter evento específico
- `PUT /api/eventos/{codigo_evento}` - Atualizar evento
- `DELETE /api/eventos/{codigo_evento}` - Deletar evento

### Cálculo de Folha
- `POST /api/calculo/` - Calcular folha de pagamento completa

## 📝 Exemplos de Uso

### Criar uma faixa de INSS
```bash
curl -X POST "http://localhost:8000/api/inss/" \
  -H "Content-Type: application/json" \
  -d '{
    "faixa_inicial": 0.0,
    "faixa_final": 1320.0,
    "aliquota": 7.5,
    "valor_deduzir": 0.0
  }'
```

### Criar um evento
```bash
curl -X POST "http://localhost:8000/api/eventos/" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo_evento": 1,
    "descricao": "Salário Base",
    "tipo": "Provento",
    "inss_mensal": "S",
    "fgts_mensal": "S",
    "irrf_mensal": "S",
    "inss_13": "S",
    "fgts_13": "S",
    "irrf_13": "S",
    "inss_ferias": "S",
    "fgts_ferias": "S",
    "irrf_ferias": "S"
  }'
```

### Calcular folha de pagamento
```bash
curl -X POST "http://localhost:8000/api/calculo/" \
  -H "Content-Type: application/json" \
  -d '{
    "eventos": [
      {"codigo_evento": 1, "valor": 5000.0},
      {"codigo_evento": 2, "valor": 500.0}
    ],
    "quantidade_dependentes": 2,
    "tipo_calculo": "mensal"
  }'
```

**Resposta:**
```json
{
  "total_proventos": 5000.0,
  "total_descontos": 500.0,
  "base_inss": 5000.0,
  "valor_inss": 550.0,
  "base_irrf": 5000.0,
  "valor_irrf": 250.0,
  "metodo_irrf_utilizado": "tradicional",
  "base_fgts": 5000.0,
  "valor_fgts": 400.0,
  "valor_liquido": 3700.0
}
```

## 🗄️ Banco de Dados

Por padrão, o sistema usa SQLite, mas pode ser configurado para usar PostgreSQL ou MySQL através do arquivo `.env`.

### Criar tabelas manualmente

As tabelas são criadas automaticamente na primeira execução. Se necessário, você pode recriá-las executando:

```python
from app.database import Base, engine
Base.metadata.create_all(bind=engine)
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DATABASE_URL=sqlite:///./conferencia_folha.db
```

Para PostgreSQL:
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/conferencia_folha
```

Para MySQL:
```env
DATABASE_URL=mysql+pymysql://usuario:senha@localhost:3306/conferencia_folha
```

## 📦 Gerar executável (.exe) para distribuição

O projeto pode ser empacotado em um único arquivo executável com PyInstaller.

1. Instale as dependências de build:
   ```bash
   pip install -r requirements.txt -r requirements-build.txt
   ```

2. Na pasta raiz do projeto, execute:
   ```bash
   python build_exe.py
   ```

3. O executável será gerado em `dist/ConferenciaFolha.exe`. Copie-o para qualquer máquina Windows; o banco de dados será criado em `%APPDATA%\ConferenciaFolha\`.

Para instruções passo a passo para o **usuário final** (como instalar e usar o .exe em outra máquina), consulte **README_Instalacao.txt**.

## 🔄 Atualizar repositório no GitHub

Repositório: **https://github.com/alderighi1979/Confer-ncia_Holerites.git**

Na pasta do projeto (PowerShell):

```powershell
# Configurar remote (se ainda não estiver)
git remote remove origin 2>$null
git remote add origin https://github.com/alderighi1979/Confer-ncia_Holerites.git

# Adicionar, commitar e enviar
git add -A
git status
git commit -m "Sua mensagem de commit"
git branch -M main
git push -u origin main
```

Ou execute o script: `.\atualizar_github.ps1` (na pasta do projeto).

## 📄 Licença

Este projeto foi desenvolvido para uso interno.
