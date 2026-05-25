# Deploy na VM — Painel TV V2

## 1. Objetivo

Este documento registra o fluxo padrão de atualização do sistema Painel Ribas na VM de produção.

A ideia é evitar perda de contexto e garantir que o deploy seja sempre feito de forma segura, repetível e documentada.

---

## 2. Ambiente de produção

**Sistema:** Painel Ribas / Painel TV Prefeitura

**Servidor:** VM Windows

**Caminho do projeto na VM:**

```powershell
c:\tv-v2\tv
```

**Gerenciador de processo:** PM2

**Nome do processo PM2:**

```txt
painel-tv-v2
```

**Branch usada no deploy:**

```txt
fix-admin-funcionalidades
```

**Repositório remoto:**

```txt
https://github.com/pmrrp/tv
```

---

## 3. Fluxo padrão de deploy

Acessar a VM e executar:

```powershell
cd c:\tv-v2\tv
git pull
pm2 restart painel-tv-v2
pm2 status
pm2 save
```

---

## 4. Explicação dos comandos

### 4.1 Entrar na pasta do projeto

```powershell
cd c:\tv-v2\tv
```

Acessa a pasta onde o projeto está hospedado na VM.

---

### 4.2 Atualizar o código

```powershell
git pull
```

Baixa as últimas alterações do repositório remoto para a VM.

Como a VM já está configurada na branch correta, normalmente não é necessário informar a branch manualmente.

---

### 4.3 Reiniciar o processo

```powershell
pm2 restart painel-tv-v2
```

Reinicia o processo Node.js responsável por servir o sistema.

Mesmo quando a alteração for apenas em HTML, CSS ou JavaScript estático, o restart garante que o servidor continue em estado limpo.

---

### 4.4 Conferir status

```powershell
pm2 status
```

Confirma se o processo está online.

O esperado é algo semelhante a:

```txt
name: painel-tv-v2
status: online
```

---

### 4.5 Salvar estado do PM2

```powershell
pm2 save
```

Salva a lista atual de processos do PM2 para restauração automática futura.

---

## 5. Exemplo real de deploy

Exemplo de deploy já executado:

```powershell
PS C:\Windows\system32> cd c:\tv-v2\tv
PS C:\tv-v2\tv> git pull
remote: Enumerating objects: 13, done.
remote: Counting objects: 100% (13/13), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 7 (delta 5), reused 7 (delta 5), pack-reused 0 (from 0)
Unpacking objects: 100% (7/7), 4.79 KiB | 76.00 KiB/s, done.
From https://github.com/pmrrp/tv
   64d8211..733adab  fix-admin-funcionalidades -> origin/fix-admin-funcionalidades
Updating 64d8211..733adab
Fast-forward
 admin/admin.css  | 105 +++++++++++++++++
 admin/admin.js   | 347 ++++++++++++++++++++++++++++++++++++++++++++++++++++---
 admin/index.html |  30 +++++
 index.html       |   4 +-
 4 files changed, 471 insertions(+), 15 deletions(-)

PS C:\tv-v2\tv> pm2 restart painel-tv-v2
Use --update-env to update environment variables
[PM2] Applying action restartProcessId on app [painel-tv-v2](ids: [ 0 ])
[PM2] [painel-tv-v2](0) ✓

┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ painel-tv-v2       │ fork     │ 16   │ online    │ 0%       │ 58.0mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘

PS C:\tv-v2\tv> pm2 status

┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ painel-tv-v2       │ fork     │ 16   │ online    │ 0%       │ 58.1mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘

PS C:\tv-v2\tv> pm2 save
[PM2] Saving current process list...
[PM2] Successfully saved in C:\Users\raul.souza\.pm2\dump.pm2
```

---

## 6. Checklist pós-deploy

Após atualizar a VM, testar:

- [ ] Acessar o painel administrativo.
- [ ] Fazer hard reload no navegador.
- [ ] Confirmar se o login funciona.
- [ ] Confirmar se a dashboard carrega.
- [ ] Verificar console do navegador.
- [ ] Confirmar se não há erro vermelho.
- [ ] Testar upload de mídia.
- [ ] Testar biblioteca de mídias.
- [ ] Testar filtros.
- [ ] Testar usuários.
- [ ] Testar logs de auditoria.
- [ ] Testar player.
- [ ] Confirmar se playlist está sendo atualizada.
- [ ] Conferir `pm2 status`.
- [ ] Conferir se o processo está online.

---

## 7. Hard reload no navegador

Após deploy, usar:

```txt
Ctrl + Shift + R
```

Isso força o navegador a buscar os arquivos atualizados, evitando cache antigo de CSS e JavaScript.

Esse passo é importante principalmente após alterações em:

- `admin/admin.css`;
- `admin/admin.js`;
- `admin/index.html`;
- `index.html`;
- `script.js`;
- `style.css`.

---

## 8. Quando usar `npm install`

Rodar `npm install` na VM somente quando houver alteração em:

```txt
package.json
package-lock.json
```

Comando:

```powershell
npm install
```

Depois:

```powershell
pm2 restart painel-tv-v2
pm2 status
pm2 save
```

---

## 9. Quando usar `pm2 logs`

Se após deploy algo quebrar ou o sistema não responder, verificar logs com:

```powershell
pm2 logs painel-tv-v2
```

Ou:

```powershell
pm2 logs
```

Erros importantes para observar:

- erro de sintaxe em JavaScript;
- erro ao iniciar servidor;
- porta em uso;
- problema ao acessar banco SQLite;
- problema em arquivo `.env`;
- erro ao ler playlist;
- erro ao ler configuração de mídia;
- erro em rota do backend;
- erro de permissão de arquivo/pasta.

---

## 10. Fluxo de deploy a partir do computador local

Quando uma alteração estiver pronta no computador local, o fluxo recomendado é:

```bash
git status
git add .
git commit -m "mensagem do commit"
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

## 11. Padrão de mensagem de commit

Usar mensagens claras, indicando o tipo de alteração.

Exemplos:

```bash
git commit -m "feat(admin): melhora filtros de midias"
```

```bash
git commit -m "fix(admin): corrige exibicao do popover de filtros"
```

```bash
git commit -m "docs: adiciona documentacao base do projeto"
```

```bash
git commit -m "chore(player): atualiza favicon"
```

Tipos comuns:

- `feat`: nova funcionalidade;
- `fix`: correção de bug;
- `docs`: documentação;
- `style`: alteração visual/CSS sem mudança de regra;
- `refactor`: refatoração sem mudar comportamento;
- `chore`: tarefas de manutenção;
- `test`: testes.

---

## 12. Cuidados antes do deploy

Antes de fazer push/deploy, conferir:

```bash
git status
```

Verificar se não foram incluídos por engano:

- `.env`;
- `node_modules/`;
- `midia/`;
- `backups/`;
- `data/painel-tv.db`;
- `data/painel-tv.db-shm`;
- `data/painel-tv.db-wal`;
- arquivos `.zip`;
- arquivos temporários;
- prints;
- arquivos de teste.

Esses arquivos devem ficar fora do repositório.

---

## 13. Arquivos geralmente alterados por tipo de tarefa

### Alterações no painel administrativo

Normalmente envolvem:

```txt
admin/index.html
admin/admin.js
admin/admin.css
```

---

### Alterações no login

Normalmente envolvem:

```txt
admin/login.html
admin/login.js
admin/login.css
```

---

### Alterações no player

Normalmente envolvem:

```txt
index.html
script.js
style.css
config.json
```

---

### Alterações no backend

Normalmente envolvem:

```txt
server.js
database/db.js
database/initDatabase.js
scripts/
```

---

### Alterações em documentação

Normalmente envolvem:

```txt
docs/
```

---

## 14. Observações importantes

- O processo correto no PM2 é `painel-tv-v2`.
- O caminho correto na VM é `c:\tv-v2\tv`.
- A branch operacional atual é `fix-admin-funcionalidades`.
- Evitar usar `pm2 restart all` sem necessidade.
- Sempre verificar `pm2 status` depois do restart.
- Sempre salvar com `pm2 save` após alteração relevante.
- Sempre fazer hard reload no navegador depois do deploy.
- Se o painel não atualizar visualmente, suspeitar primeiro de cache do navegador.
- Se o sistema não responder, verificar PM2 e logs.
- Se o backend não iniciar, verificar `server.js`, `.env` e porta configurada.

---

## 15. Observação sobre Cloudflare Tunnel

O sistema é acessado por domínio público usando Cloudflare Tunnel.

O Cloudflare Tunnel é responsável por expor o serviço hospedado na VM sem necessidade de abrir diretamente portas públicas no roteador/firewall.

Warnings no navegador envolvendo `cdnjs.cloudflare.com`, quando relacionados ao Font Awesome via CDN, não indicam necessariamente problema no Cloudflare Tunnel.

Esses warnings podem ocorrer por políticas de privacidade do navegador, especialmente no Microsoft Edge.

---

## 16. Recuperação rápida em caso de problema

Se após um deploy o sistema apresentar problema, seguir esta ordem:

1. Conferir se o processo está online:

```powershell
pm2 status
```

2. Verificar logs:

```powershell
pm2 logs painel-tv-v2
```

3. Conferir últimos commits:

```powershell
git log --oneline -5
```

4. Se necessário, voltar para o commit anterior com cuidado.

Exemplo:

```powershell
git log --oneline -5
```

Depois identificar o commit estável anterior.

A reversão deve ser feita com cautela e, de preferência, registrada em novo commit ou alinhada antes de executar em produção.

---

## Deploy de fechamento da Fase 2

Após a implementação dos refinamentos finais da dashboard administrativa, foi realizado deploy da branch `fix-admin-funcionalidades` na VM de produção.

Foram validados em produção:

- login;
- dashboard;
- biblioteca;
- filtros premium;
- modal premium de período;
- mini modal premium de horário;
- ativação/inativação de mídias;
- sincronização;
- player;
- console do navegador.

Resultado:

```txt
Deploy realizado com sucesso.
Processo PM2 online.
Testes em produção aprovados.
Fase 2 pronta para apresentação.

---

## 17. Observação final

Este documento deve ser mantido atualizado sempre que mudar:

- caminho do projeto na VM;
- nome do processo PM2;
- branch operacional;
- domínio;
- forma de deploy;
- dependências;
- comandos necessários para subir o sistema.

A documentação de deploy evita perda de contexto e reduz risco de erro durante atualizações em produção.