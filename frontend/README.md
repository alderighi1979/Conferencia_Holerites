# Frontend - Conferência de Folha de Pagamento

Interface moderna desenvolvida em React com Tailwind CSS para o sistema de conferência de folha de pagamento.

## 🚀 Instalação

### Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn

### Passos

1. Navegue até o diretório frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a URL da API (opcional):
   - Crie um arquivo `.env` na raiz do frontend
   - Adicione: `VITE_API_URL=http://localhost:8000`

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:3000`

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

## 🏗️ Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Cabecalho.jsx
│   │   ├── GradeLancamentos.jsx
│   │   ├── PainelResultados.jsx
│   │   └── admin/           # Componentes administrativos
│   │       ├── TabINSS.jsx
│   │       ├── TabIRRF.jsx
│   │       ├── TabEventos.jsx
│   │       └── TabConfigSimplificada.jsx
│   ├── pages/               # Páginas principais
│   │   ├── CalculoFolha.jsx
│   │   └── Administracao.jsx
│   ├── services/            # Serviços de API
│   │   └── api.js
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globais
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Funcionalidades

### Página de Cálculo
- **Cabeçalho**: Campos para nome do funcionário (opcional) e quantidade de dependentes
- **Grade de Lançamentos**: 
  - Busca automática de descrição ao digitar código do evento
  - Adição dinâmica de linhas
  - Seletor de tipo de cálculo (Mensal, 13º, Férias)
- **Painel de Resultados**: Exibe resumo completo com bases, impostos e valor líquido

### Área Administrativa
- **Abas separadas** para gerenciamento de:
  - Tabela INSS
  - Tabela IRRF
  - Configuração Simplificada
  - Eventos
- **CRUD completo** para todas as tabelas
- **Interface intuitiva** com formulários e tabelas

## 🔧 Tecnologias Utilizadas

- **React 18**: Biblioteca JavaScript para interfaces
- **Vite**: Build tool e dev server
- **Tailwind CSS**: Framework CSS utility-first
- **React Router**: Roteamento para SPA
- **Axios**: Cliente HTTP para requisições à API

## 📝 Notas

- O frontend está configurado para fazer proxy das requisições `/api` para `http://localhost:8000`
- Certifique-se de que o backend está rodando antes de iniciar o frontend
- A interface é totalmente responsiva e funciona em dispositivos móveis
