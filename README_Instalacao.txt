================================================================================
  CONFERÊNCIA DE FOLHA DE PAGAMENTO - INSTRUÇÕES DE INSTALAÇÃO E USO
================================================================================

Este documento explica como instalar e usar o sistema em outro computador,
seja como executável (.exe) ou pela instalação em PWA no navegador.


--------------------------------------------------------------------------------
OPÇÃO 1: USAR O EXECUTÁVEL (.EXE)
--------------------------------------------------------------------------------

1. O que você precisa
   - Um arquivo chamado "ConferenciaFolha.exe" (gerado pelo desenvolvedor).
   - Windows 10 ou 11.
   - Nenhuma instalação de Python ou Node.js é necessária.

2. Onde colocar o programa
   - Copie o arquivo ConferenciaFolha.exe para qualquer pasta de sua preferência.
   - Exemplos: Área de Trabalho, Documentos, ou uma pasta como "C:\Programas\ConferenciaFolha".
   - Evite pastas que exijam "permissão de administrador" (ex.: dentro de Program Files)
     se você não for admin; o programa pode gravar dados em AppData automaticamente.

3. Como executar
   - Dê um duplo clique em ConferenciaFolha.exe.
   - Uma janela preta (terminal) pode aparecer por um instante; em seguida o
     sistema sobe o servidor e abre o navegador na tela do sistema.
   - Se o navegador NÃO abrir sozinho, abra-o manualmente e digite na barra de endereço:
     http://localhost:8000
   - A primeira execução pode demorar alguns segundos.

4. Onde os dados são guardados
   - O banco de dados (dados do sistema) é criado automaticamente em:
     C:\Users\[SEU_USUARIO]\AppData\Roaming\ConferenciaFolha\
   - Assim o programa funciona mesmo quando o .exe está em uma pasta só leitura.

5. Encerrando o sistema
   - Feche a aba/janela do navegador quando terminar de usar.
   - Para desligar o servidor por completo, feche a janela preta (console) que
     apareceu ao abrir o .exe, ou encerre o processo "ConferenciaFolha.exe"
     no Gerenciador de Tarefas (Ctrl+Shift+Esc).

6. Antivírus ou Windows Defender
   - Se o antivírus bloquear o .exe, adicione uma exceção para a pasta onde
     está o ConferenciaFolha.exe ou para o próprio arquivo.
   - O programa não acessa a internet; roda apenas na sua máquina (localhost).


--------------------------------------------------------------------------------
OPÇÃO 2: INSTALAR COMO PWA (NAVEGADOR)
--------------------------------------------------------------------------------

Se o sistema for acessado por um servidor (por exemplo, alguém já está
rodando o ConferenciaFolha.exe e você acessa pelo navegador), você pode
"instalar" a página como aplicativo:

1. Abra o sistema no Google Chrome ou no Microsoft Edge.
2. Na barra de endereço, procure o ícone de instalação (símbolo de computador
   com um + ou "Instalar").
3. Clique em "Instalar" ou "Instalar Conferência Folha".
4. O sistema passará a aparecer no menu Iniciar e na área de trabalho como
   um atalho, e poderá ser aberto como um aplicativo, sem precisar digitar
   o endereço no navegador.

Observação: para a instalação PWA funcionar, você precisa acessar o sistema
pelo endereço que o servidor fornecer (por exemplo http://localhost:8000
quando o .exe está rodando na sua máquina).


--------------------------------------------------------------------------------
PROBLEMAS COMUNS
--------------------------------------------------------------------------------

- "O navegador não abriu"
  Abra o navegador manualmente e acesse: http://localhost:8000

- "A página não carrega" / "Não é possível acessar este site"
  Confira se o ConferenciaFolha.exe ainda está em execução (janela preta ou
  processo no Gerenciador de Tarefas). Se tiver fechado, execute o .exe de novo.

- "Permissão negada" ou erro ao gravar
  O .exe não precisa ser executado como administrador. Os dados são gravados
  em AppData (pasta do usuário). Se o erro continuar, execute o .exe a partir
  de uma pasta onde você tem permissão de gravação (ex.: Documentos).

- Porta 8000 já em uso
  Outro programa pode estar usando a porta 8000. Feche outros servidores ou
  aplicativos que usem essa porta, ou peça ao desenvolvedor uma versão que
  use outra porta.


--------------------------------------------------------------------------------
RESUMO RÁPIDO (EXECUTÁVEL)
--------------------------------------------------------------------------------

1. Copie ConferenciaFolha.exe para uma pasta (ex.: Área de Trabalho).
2. Dê duplo clique no .exe.
3. Aguarde o navegador abrir (ou acesse http://localhost:8000).
4. Use o sistema normalmente.
5. Para fechar: feche o navegador e a janela preta do programa.

================================================================================
  Dúvidas: entre em contato com o suporte ou o desenvolvedor do sistema.
================================================================================
