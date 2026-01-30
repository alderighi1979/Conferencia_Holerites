"""
Configura o arquivo hosts do Windows para o domínio local conferencia.local.
Verifica se a linha "127.0.0.1 conferencia.local" já existe; se não, tenta
adicioná-la. Em Windows, editar C:\\Windows\\System32\\drivers\\etc\\hosts
exige permissão de administrador.

Uso (na pasta do projeto):
  python setup_hosts.py

Execute como Administrador se quiser que o script adicione a linha
automaticamente quando faltar.
"""
import os
import sys

HOSTS_PATH = os.path.join(os.environ.get("SystemRoot", "C:\\Windows"), "System32", "drivers", "etc", "hosts")
ENTRY = "127.0.0.1    conferencia.local"
ENTRY_STRIP = "127.0.0.1 conferencia.local"


def normalize_line(line: str) -> str:
    """Remove comentários e normaliza espaços para comparação."""
    if "#" in line:
        line = line[: line.index("#")].strip()
    return " ".join(line.split())


def has_entry(content: str) -> bool:
    """Verifica se a entrada conferencia.local já existe no conteúdo."""
    for raw in content.splitlines():
        norm = normalize_line(raw)
        if norm == "127.0.0.1 conferencia.local":
            return True
    return False


def main() -> int:
    if not os.path.isfile(HOSTS_PATH):
        print(f"[ERRO] Arquivo hosts não encontrado: {HOSTS_PATH}")
        return 1

    try:
        with open(HOSTS_PATH, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except PermissionError:
        print("[ERRO] Sem permissão para ler o arquivo hosts.")
        print("       Execute este script como Administrador (clique direito no")
        print("       prompt de comando ou no Python -> 'Executar como administrador').")
        return 1

    if has_entry(content):
        print("OK: A entrada '127.0.0.1 conferencia.local' já existe no arquivo hosts.")
        return 0

    try:
        with open(HOSTS_PATH, "a", encoding="utf-8") as f:
            f.write("\n# Conferência de Folha - domínio local\n")
            f.write(ENTRY + "\n")
        print("OK: Entrada '127.0.0.1 conferencia.local' adicionada ao arquivo hosts.")
        return 0
    except PermissionError:
        print("[AVISO] conferencia.local nao foi adicionado ao hosts (falta permissao de admin).")
        print("         O app abre em http://localhost:3001 normalmente.")
        print("         Para usar http://conferencia.local:3001, adicione manualmente ao hosts:")
        print(f"         Arquivo: {HOSTS_PATH}")
        print(f"         Linha:   {ENTRY}")
        print("         (Bloco de Notas como Administrador -> Abrir -> drivers\\etc -> hosts)")
        return 0


if __name__ == "__main__":
    sys.exit(main())
