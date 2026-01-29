# 🚀 Guia de Início Rápido - Sistema de Conferência de Folha

Este guia vai te ajudar a executar o sistema pela primeira vez.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Python 3.11 ou 3.12** (recomendado) - [Download Python](https://www.python.org/downloads/)
  - ⚠️ **Python 3.14** pode dar erro ao instalar (falta de pacotes pré-compilados). Use **Python 3.12** para este projeto.
- **Node.js 18 ou superior** - [Download Node.js](https://nodejs.org/)
- **Git** (opcional) - [Download Git](https://git-scm.com/)

## 🔧 Passo 1: Configurar o Backend

### 1.1. Abrir o Terminal/Prompt de Comando

- **Windows**: Pressione `Win + R`, digite `cmd` e pressione Enter
- **Linux/Mac**: Abra o Terminal

### 1.2. Navegar até a pasta do projeto

```bash
cd "c:\Users\Controladoria\Documents\Fechamentos RH\Conferência de Holerites e Férias"
```

### 1.3. Criar ambiente virtual (Recomendado)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 1.4. Instalar dependências do backend

```bash
# Use um destes comandos (no Windows, prefira python -m pip):
python -m pip install -r requirements.txt
```

Se der erro "python não é reconhecido", tente:
```bash
py -m pip install -r requirements.txt
```

### 1.5. Configurar banco de dados (Opcional)

O sistema usa SQLite por padrão, então não precisa configurar nada. Se quiser usar PostgreSQL ou MySQL:

1. Copie o arquivo `.env.example` para `.env`:
```bash
copy .env.example .env
```

2. Edite o arquivo `.env` e configure a URL do banco de dados

### 1.6. Executar o backend

```bash
uvicorn app.main:app --reload
```

Você verá uma mensagem como:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

✅ **Backend está rodando!** Mantenha este terminal aberto.

---

## 🎨 Passo 2: Configurar o Frontend

### 2.1. Abrir um NOVO Terminal/Prompt de Comando

⚠️ **IMPORTANTE**: Deixe o terminal do backend aberto e abra um novo terminal!

### 2.2. Navegar até a pasta frontend

⚠️ **IMPORTANTE**: O comando `npm run dev` só funciona **dentro da pasta frontend**!

```powershell
cd "c:\Users\Controladoria\Documents\Fechamentos RH\Conferência de Holerites e Férias\frontend"
```

Confirme que está na pasta certa: deve aparecer `...\frontend>` no prompt.

### 2.3. Instalar dependências do frontend

⚠️ **OBRIGATÓRIO**: Execute este comando antes de rodar `npm run dev`!

```powershell
npm install
```

Isso pode levar alguns minutos na primeira vez. Você verá muitas linhas sendo baixadas e instaladas.

✅ **Aguarde até aparecer algo como:**
```
added 234 packages, and audited 235 packages in 2m
```

### 2.4. Executar o frontend

```bash
npm run dev
```

Você verá uma mensagem como:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

✅ **Frontend está rodando!**

---

## 🔄 Reiniciar os servidores e abrir o aplicativo

Quando você fechar os terminais ou o computador, precisa **subir os servidores de novo** para usar o sistema.

### 1. Parar os servidores (se estiverem rodando)

- No terminal do **backend**: pressione **Ctrl + C**
- No terminal do **frontend**: pressione **Ctrl + C**

### 2. Abrir o aplicativo novamente

**Terminal 1 – Backend:**

```powershell
cd "c:\Users\Controladoria\Documents\Fechamentos RH\Conferência de Holerites e Férias"
venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 – Frontend:**

```powershell
cd "c:\Users\Controladoria\Documents\Fechamentos RH\Conferência de Holerites e Férias\frontend"
npm run dev
```

### 3. Abrir no navegador

Acesse: **http://localhost:3000**

---

**Resumo:** Abra 2 terminais, rode o backend em um e o frontend no outro, depois acesse http://localhost:3000 no navegador.

---

## 🌐 Passo 3: Acessar o Sistema

Abra seu navegador e acesse:

**http://localhost:3000**

Você verá a interface do sistema!

---

## 📖 Como Usar o Sistema

### 1️⃣ Primeira Configuração (Área Administrativa)

Antes de calcular folhas, você precisa cadastrar as tabelas:

1. Clique em **"Administração"** no menu superior
2. Configure as seguintes abas:

#### **Aba INSS**
- Adicione as faixas salariais do INSS
- Exemplo:
  - Faixa Inicial: 0
  - Faixa Final: 1320.00
  - Alíquota: 7.5
  - Valor a Deduzir: 0

#### **Aba IRRF**
- Adicione as faixas salariais do IRRF
- Exemplo:
  - Faixa Inicial: 0
  - Faixa Final: 1903.98
  - Alíquota: 0
  - Parcela a Deduzir: 0
  - Valor por Dependente: 189.59

#### **Aba Config Simplificada**
- Adicione o valor do desconto padrão para cálculo simplificado de IRRF
- Exemplo: 528.00

#### **Aba Eventos**
- Cadastre os eventos que serão usados nos cálculos
- Exemplo:
  - Código: 1
  - Descrição: Salário Base
  - Tipo: Provento
  - Marque as incidências (INSS, FGTS, IRRF) para Mensal, 13º e Férias

### 2️⃣ Calcular Folha de Pagamento

1. Clique em **"Cálculo"** no menu superior
2. Preencha os dados:
   - **Nome do Funcionário** (opcional)
   - **Quantidade de Dependentes**
3. Adicione os eventos:
   - Digite o **Código do Evento** (a descrição aparecerá automaticamente)
   - Digite o **Valor**
   - Clique em **"+ Adicionar Evento"** para adicionar mais eventos
4. Selecione o **Tipo de Cálculo** (Mensal, 13º Salário ou Férias)
5. Clique em **"Calcular Folha"**
6. Veja os resultados no painel à direita
7. Clique em **"Ver Detalhes do Cálculo"** para ver o log completo

---

## 🔍 Verificar se está tudo funcionando

### Backend
- Acesse: http://localhost:8000/docs
- Você verá a documentação interativa da API (Swagger)

### Frontend
- Acesse: http://localhost:3000
- Você verá a interface do sistema

---

## ⚠️ Problemas Comuns

### Erro: "pip não é reconhecido"
Use o pip através do Python:
```bash
python -m pip install -r requirements.txt
```
Ou no Windows com o launcher:
```bash
py -m pip install -r requirements.txt
```

### Erro ao instalar: "pydantic-core", "Rust", "metadata-generation-failed"
Você está usando **Python 3.14**. Muitos pacotes ainda não têm versão pré-compilada para 3.14.

**Solução:** Use **Python 3.12** para este projeto.

1. Baixe e instale Python 3.12: https://www.python.org/downloads/release/python-3120/
   - Na instalação, marque **"Add Python to PATH"**.
   - Se quiser manter o 3.14, instale o 3.12 em outra pasta (ex: `C:\Python312`).

2. Crie o ambiente virtual com o Python 3.12:
   ```powershell
   # Se o 3.12 foi instalado e está no PATH:
   py -3.12 -m venv venv
   venv\Scripts\activate
   python -m pip install -r requirements.txt
   ```
   Ou, usando o caminho completo do Python 3.12:
   ```powershell
   "C:\Python312\python.exe" -m venv venv
   venv\Scripts\activate
   python -m pip install -r requirements.txt
   ```

### Tabelas INSS, IRRF ou Eventos vazias ou apagadas
Se as tabelas ficaram vazias (por exemplo após reinstalar ou trocar de máquina), reponha os dados iniciais com o script de seed.

**Na pasta do projeto**, com o ambiente virtual ativado:

```powershell
cd "c:\Users\Controladoria\Documents\Fechamentos RH\Conferência de Holerites e Férias"
venv\Scripts\activate
py -m app.seed_data
```

Ou, se usar `python`:
```powershell
python -m app.seed_data
```

O script insere:
- **INSS**: 4 faixas (ex.: 0–1320; 1320,01–2571,29; etc.)
- **IRRF**: 5 faixas com valor por dependente
- **Config Simplificada**: desconto padrão R$ 528,00
- **Eventos**: Salário Base (1), Vale Transporte (2), Vale Refeição (3), Horas Extras (4), Adicional Noturno (5), Comissões (6)

Só insere se a tabela estiver vazia. Depois, reinicie o backend e use o sistema normalmente.

### Erro: "Module not found" no backend
```bash
# Certifique-se de estar no ambiente virtual
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Reinstale as dependências
python -m pip install -r requirements.txt
```

### Erro: "npm não é reconhecido"
- Instale o Node.js: https://nodejs.org/
- Reinicie o terminal após instalar

### Erro: "Port 8000 already in use"
- Altere a porta do backend:
```bash
uvicorn app.main:app --reload --port 8001
```
- E atualize o `.env` do frontend para `VITE_API_URL=http://localhost:8001`

### Erro: "'vite' não é reconhecido"
As dependências não foram instaladas. Execute primeiro:

```powershell
cd "c:\Users\Controladoria\Documents\Fechamentos RH\Conferência de Holerites e Férias\frontend"
npm install
```

Aguarde a instalação terminar (pode levar alguns minutos). Depois execute:
```powershell
npm run dev
```

### Erro: "Missing script: dev"
Você está na pasta errada. O comando `npm run dev` deve ser executado **dentro da pasta frontend**:

```powershell
cd "c:\Users\Controladoria\Documents\Fechamentos RH\Conferência de Holerites e Férias\frontend"
npm run dev
```

Confirme que o prompt mostra `...\frontend>` antes de rodar `npm run dev`.

### Erro: "Port 3000 already in use"
- O Vite automaticamente usará a porta 3001, 3002, etc.

### Backend não conecta com Frontend
- Certifique-se de que o backend está rodando na porta 8000
- Verifique se não há firewall bloqueando
- O frontend está configurado para fazer proxy automático para `http://localhost:8000`

---

## 📝 Próximos Passos

1. ✅ Configure as tabelas de INSS e IRRF
2. ✅ Cadastre os eventos que você usa
3. ✅ Configure o desconto padrão simplificado
4. ✅ Comece a calcular folhas!

---

## 🆘 Precisa de Ajuda?

- Verifique os logs no terminal para mensagens de erro
- A documentação da API está em: http://localhost:8000/docs
- O código está bem comentado para facilitar entendimento

---

## 🎯 Resumo dos Comandos

### Terminal 1 (Backend):
```bash
cd "c:\Users\Controladoria\Documents\Fechamentos RH\Conferência de Holerites e Férias"
python -m pip install -r requirements.txt
venv\Scripts\activate
uvicorn app.main:app --reload
```

### Terminal 2 (Frontend):
```bash
cd "c:\Users\Controladoria\Documents\Fechamentos RH\Conferência de Holerites e Férias\frontend"
npm install
npm run dev
```

### Acessar:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Documentação: http://localhost:8000/docs

---

**Boa sorte! 🚀**
