# Guia de Git e Branches — Painel Ribas

## Objetivo

Este documento registra o fluxo de versionamento usado no projeto Painel Ribas.

Ele serve para:

- evitar perda de código;
- organizar funcionalidades;
- separar documentação de desenvolvimento;
- reduzir risco de erro em merge;
- facilitar deploy na VM;
- manter histórico claro do projeto.

---

## Branch principal

A branch principal do repositório é:

```txt
main
```

Ela deve representar a versão mais estável/oficial do projeto.

No momento, a `main` não deve receber alterações diretamente sem revisão, pois o desenvolvimento mais recente está em branches específicas.

---

## Branch funcional atual

A branch funcional mais atual do sistema é:

```txt
fix-admin-funcionalidades
```

Ela concentra as melhorias recentes da Fase 2, incluindo:

- dashboard administrativa;
- filtros;
- usuários;
- logs;
- upload em chunks;
- melhorias do player;
- ajustes visuais;
- funcionalidades de administração.

A VM está atualmente usando esta branch.

---

## Branch de documentação

A branch criada para documentação é:

```txt
docs/documentacao-fase-2
```

Ela foi criada a partir da branch:

```txt
fix-admin-funcionalidades
```

Objetivo:

- criar documentação técnica;
- registrar histórico;
- registrar decisões;
- preparar documentos executivos;
- organizar manual de uso;
- evitar misturar documentação com novas funcionalidades do sistema.

---

## Branches existentes no projeto

Branches identificadas:

```txt
main
fase-2-backend-admin
fix-admin-funcionalidades
polish-admin-ui
polish-admin-ui-v2
docs/documentacao-fase-2
```

---

## Fluxo recomendado de trabalho

## 1. Antes de começar

Sempre verificar a branch atual:

```bash
git branch
```

E o estado dos arquivos:

```bash
git status
```

O ideal é começar qualquer tarefa com:

```txt
working tree clean
```

---

## 2. Trabalhando em documentação

Usar a branch:

```bash
git checkout docs/documentacao-fase-2
```

Atualizar com:

```bash
git pull origin docs/documentacao-fase-2
```

Após alterar documentos:

```bash
git status
git add docs/
git commit -m "docs: atualiza documentacao do projeto"
git push origin docs/documentacao-fase-2
```

---

## 3. Trabalhando em funcionalidades do admin

Usar a branch:

```bash
git checkout fix-admin-funcionalidades
```

Atualizar com:

```bash
git pull origin fix-admin-funcionalidades
```

Após alterar arquivos:

```bash
git status
git add caminho/do/arquivo
git commit -m "feat(admin): descreve a funcionalidade"
git push origin fix-admin-funcionalidades
```

---

## 4. Trabalhando em correções

Para correções pequenas na branch funcional:

```bash
git checkout fix-admin-funcionalidades
git pull origin fix-admin-funcionalidades
```

Depois:

```bash
git status
git add caminho/do/arquivo
git commit -m "fix(admin): descreve a correcao"
git push origin fix-admin-funcionalidades
```

---

## 5. Trabalhando em polimento visual

Se for ajuste visual pequeno e relacionado ao admin atual:

```bash
git checkout fix-admin-funcionalidades
```

Se for refatoração visual grande, criar branch própria:

```bash
git checkout fix-admin-funcionalidades
git pull origin fix-admin-funcionalidades
git checkout -b polish/refino-visual-admin
```

Depois:

```bash
git add .
git commit -m "style(admin): refina interface administrativa"
git push origin polish/refino-visual-admin
```

---

## 6. Criando nova branch

Sempre criar nova branch a partir da base correta.

Exemplo para documentação:

```bash
git checkout fix-admin-funcionalidades
git pull origin fix-admin-funcionalidades
git checkout -b docs/nome-da-documentacao
```

Exemplo para funcionalidade:

```bash
git checkout fix-admin-funcionalidades
git pull origin fix-admin-funcionalidades
git checkout -b feat/nome-da-funcionalidade
```

Exemplo para correção:

```bash
git checkout fix-admin-funcionalidades
git pull origin fix-admin-funcionalidades
git checkout -b fix/nome-da-correcao
```

---

## 7. Padrão de mensagens de commit

Usar mensagens claras.

Formatos recomendados:

```bash
git commit -m "feat(admin): adiciona nova funcionalidade"
```

```bash
git commit -m "fix(player): corrige comportamento do video"
```

```bash
git commit -m "docs: atualiza documentacao da fase 2"
```

```bash
git commit -m "style(admin): ajusta visual dos filtros"
```

```bash
git commit -m "refactor(admin): organiza funcoes de midia"
```

```bash
git commit -m "chore: atualiza arquivos auxiliares"
```

---

## Tipos de commit

```txt
feat      nova funcionalidade
fix       correção de bug
docs      documentação
style     ajuste visual ou formatação
refactor  reorganização sem mudar comportamento
chore     manutenção geral
test      testes
```

---

## 8. Deploy na VM

A VM usa atualmente a branch:

```txt
fix-admin-funcionalidades
```

Fluxo padrão na VM:

```powershell
cd c:\tv-v2\tv
git pull
pm2 restart painel-tv-v2
pm2 status
pm2 save
```

A branch de documentação não precisa ser puxada diretamente na VM enquanto não for mesclada na branch funcional.

---

## 9. Merge da documentação na branch funcional

Quando a documentação estiver pronta, fazer:

```bash
git checkout fix-admin-funcionalidades
git pull origin fix-admin-funcionalidades
git merge docs/documentacao-fase-2
git push origin fix-admin-funcionalidades
```

Depois, na VM:

```powershell
cd c:\tv-v2\tv
git pull
pm2 restart painel-tv-v2
pm2 status
pm2 save
```

---

## 10. Merge da branch funcional na main

Somente fazer merge para `main` quando a Fase 2 estiver validada.

Fluxo futuro:

```bash
git checkout main
git pull origin main
git merge fix-admin-funcionalidades
git push origin main
```

Antes disso, revisar:

```bash
git status
git log --oneline --decorate --graph --all -20
```

A `main` deve receber apenas versões consideradas estáveis.

---

## 11. Cuidados antes de qualquer merge

Antes de fazer merge:

```bash
git status
```

O ideal é aparecer:

```txt
nothing to commit, working tree clean
```

Depois revisar histórico:

```bash
git log --oneline --decorate --graph --all -20
```

Se houver dúvida, não fazer merge no impulso.

---

## 12. Se der conflito

Se o Git indicar conflito:

1. Não entrar em pânico.
2. Ler quais arquivos conflitaram.
3. Abrir os arquivos marcados.
4. Resolver manualmente.
5. Testar o sistema.
6. Depois concluir o merge.

Comandos úteis:

```bash
git status
```

Após resolver conflitos:

```bash
git add arquivo-resolvido
git commit
```

---

## 13. Arquivos que não devem ser versionados

Evitar versionar:

```txt
.env
node_modules/
midia/
backups/
data/painel-tv.db
data/painel-tv.db-shm
data/painel-tv.db-wal
*.zip
```

Esses arquivos podem conter:

- credenciais;
- arquivos pesados;
- dados locais;
- banco real;
- backups operacionais;
- conteúdo institucional pesado.

---

## 14. Conferência antes de commit

Antes de commit, sempre rodar:

```bash
git status
```

Conferir se os arquivos listados fazem sentido.

Se aparecer algo estranho, revisar antes de adicionar.

---

## 15. Adicionando arquivos específicos

Preferir adicionar arquivos específicos quando a alteração for pequena:

```bash
git add admin/admin.js
git add admin/admin.css
```

Para documentação:

```bash
git add docs/
```

Para tudo, apenas quando tiver certeza:git styatus

```bash
git add .
```

---

## 16. Histórico recente visto no projeto

Histórico recente identificado:

```txt
docs/documentacao-fase-2
└── docs: adiciona contexto, deploy e checklist da fase 2

fix-admin-funcionalidades
└── feat(admin): melhora filtros de midias e atualiza favicon