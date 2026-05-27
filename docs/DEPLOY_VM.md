# Deploy na VM — Painel Ribas

## 1. Objetivo

Este documento registra o fluxo padrão de atualização do sistema Painel Ribas na VM de produção.

A ideia é evitar perda de contexto e garantir que o deploy seja sempre feito de forma segura, repetível e documentada.

Este guia deve ser usado sempre que houver atualização de código, documentação, variáveis de ambiente ou ajustes operacionais no sistema.

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

**Domínio em uso:**

```txt
painelribas.com.br
```

---

## 3. Fluxo padrão de deploy

Acessar a VM e executar:

```powershell
cd c:\tv-v2\tv
git status
git branch
git pull origin fix-admin-funcionalidades
pm2 restart painel-tv-v2 --update-env
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

### 4.2 Conferir estado do Git

```powershell
git status
```

Confirma se há alterações locais não commitadas.

O ideal antes do deploy é ver:

```txt
nothing to commit, working tree clean
```

Se houver arquivos modificados diretamente na VM, o deploy deve ser interrompido até entender a origem dessas alterações.

---

### 4.3 Conferir branch atual

```powershell
git branch
```

A branch em uso na VM deve ser:

```txt
fix-admin-funcionalidades
```

Se a VM estiver em outra branch, trocar antes do deploy:

```powershell
git checkout fix-admin-funcionalidades
```

---

### 4.4 Atualizar o código

```powershell
git pull origin fix-admin-funcionalidades
```

Baixa as últimas alterações da branch funcional do repositório remoto.

Usar a branch explicitamente evita confusão caso a configuração local do Git esteja diferente.

---

### 4.5 Reiniciar o processo com variáveis atualizadas

```powershell
pm2 restart painel-tv-v2 --update-env
```

Reinicia o processo Node.js responsável por servir o sistema.

O parâmetro `--update-env` é importante porque o sistema usa variáveis do `.env`, incluindo configurações operacionais como:

```env
MEDIA_MAX_STORAGE_GB=180
DISK_MIN_FREE_GB=50
```

Sempre que o `.env` for alterado, usar `--update-env`.

Por segurança, o fluxo padrão de deploy já utiliza esse parâmetro mesmo quando o `.env` não foi modificado.

---

### 4.6 Conferir status

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

### 4.7 Salvar estado do PM2

```powershell
pm2 save
```

Salva a lista atual de processos do PM2 para restauração automática futura.

---

## 5. Variáveis de ambiente importantes

O arquivo `.env` da VM não é versionado no Git.

Por isso, algumas configurações precisam ser conferidas manualmente em produção.

### Variáveis operacionais da Fase 3

```env
MEDIA_MAX_STORAGE_GB=180
DISK_MIN_FREE_GB=50
```

### Significado

`MEDIA_MAX_STORAGE_GB`

Define o limite operacional da pasta `midia/`.

Valor padrão usado na VM:

```txt
180 GB
```

---

`DISK_MIN_FREE_GB`

Define a reserva mínima de espaço livre que o disco da VM deve manter.

Valor padrão usado na VM:

```txt
50 GB
```

---

## 6. Cuidados antes do deploy

Antes de atualizar a VM, confirmar no ambiente local:

```powershell
git status
git --no-pager log --oneline -5
```

O ideal é que:

- a branch local esteja atualizada;
- as alterações estejam commitadas;
- o push já tenha sido feito;
- a branch remota `fix-admin-funcionalidades` contenha os commits esperados.

---

## 7. Checklist pós-deploy

Após atualizar a VM, testar:

### Acesso

- [ ] Acessar `https://painelribas.com.br/admin`.
- [ ] Fazer hard refresh no navegador.
- [ ] Confirmar tela de login.
- [ ] Fazer login com superadmin.
- [ ] Confirmar dashboard carregando sem erro visual grave.
- [ ] Confirmar ausência de erro vermelho no console.

---

### Player

- [ ] Acessar `https://painelribas.com.br/`.
- [ ] Confirmar carregamento do player.
- [ ] Confirmar exibição de mídias.
- [ ] Confirmar loop da playlist.
- [ ] Confirmar atualização automática da playlist.
- [ ] Confirmar áudio, quando aplicável no mini PC.
- [ ] Confirmar que o player continua em tela cheia/quiosque nos pontos instalados.

---

### APIs básicas

Testar no navegador, estando autenticado quando necessário:

```txt
/api/health
```

Resultado esperado:

- servidor respondendo;
- `ok: true`;
- uptime retornando.

---

```txt
/api/admin/resumo
```

Resultado esperado:

- resumo das mídias;
- resumo da playlist;
- bloco de armazenamento.

---

```txt
/api/admin/backups
```

Resultado esperado:

- listagem de backups JSON;
- listagem de backups SQLite;
- total de backups por tipo.

---

```txt
/api/admin/diagnostico
```

Resultado esperado:

- status geral `ok`, `aviso` ou `critico`;
- banco SQLite verificado;
- armazenamento verificado;
- backups verificados;
- arquivos essenciais verificados.

---

### Dashboard administrativa

- [ ] Cards de resumo carregam corretamente.
- [ ] Card de armazenamento aparece corretamente.
- [ ] Biblioteca de mídias abre corretamente.
- [ ] Filtros funcionam.
- [ ] Upload continua funcionando.
- [ ] Salvar mídia continua funcionando.
- [ ] Gerar/sincronizar playlist continua funcionando.
- [ ] Logs de auditoria carregam para superadmin.
- [ ] Seção Backups aparece para superadmin.
- [ ] Seção Diagnóstico aparece para superadmin.

---

### Backups

- [ ] Abrir seção Backups.
- [ ] Confirmar total de backups.
- [ ] Confirmar contagem de `midia-config`.
- [ ] Confirmar contagem de `playlist`.
- [ ] Confirmar contagem de banco SQLite.
- [ ] Gerar backup manual do banco SQLite, se necessário.
- [ ] Confirmar log `sistema.backup.database`.

---

### Diagnóstico

- [ ] Abrir seção Diagnóstico.
- [ ] Confirmar status geral.
- [ ] Confirmar Banco SQLite.
- [ ] Confirmar Armazenamento.
- [ ] Confirmar Backups.
- [ ] Confirmar Mídias.
- [ ] Confirmar Arquivos essenciais.
- [ ] Confirmar se há avisos.
- [ ] Se houver aviso, verificar se é esperado.

---

## 8. Primeiro backup SQLite após deploy da Fase 3

Após o deploy da Fase 3, o diagnóstico pode exibir aviso informando que não existe backup do banco SQLite.

Isso acontece porque o recurso de backup do banco passou a existir somente após essa entrega.

### Procedimento

No painel administrativo da VM:

1. fazer login como superadmin;
2. abrir a seção **Backups**;
3. clicar em **Backup do banco**;
4. confirmar a ação;
5. atualizar o diagnóstico.

### Resultado esperado

O aviso deve desaparecer após a criação do primeiro backup `.db`.

Também pode ser conferido na VM:

```powershell
dir backups
```

Procurar arquivo no formato:

```txt
database_YYYY-MM-DD_HH-MM-SS.db
```

---

## 9. Diagnóstico operacional em produção

A rota protegida:

```txt
/api/admin/diagnostico
```

deve ser usada para verificar a saúde operacional do sistema.

Ela complementa o health check público:

```txt
/api/health
```

### Diferença

`/api/health`

Verifica apenas se o servidor está respondendo.

`/api/admin/diagnostico`

Verifica pontos operacionais, como:

- banco SQLite;
- armazenamento;
- backups;
- mídias;
- arquivos essenciais;
- avisos;
- problemas críticos.

---

## 10. Situações comuns e solução rápida

### 10.1 Pull não trouxe as alterações esperadas

Verificar branch:

```powershell
git branch
```

Verificar últimos commits locais:

```powershell
git --no-pager log --oneline -8
```

Verificar últimos commits remotos:

```powershell
git fetch origin
git --no-pager log origin/fix-admin-funcionalidades --oneline -8
```

Se a branch local estiver atrasada:

```powershell
git pull origin fix-admin-funcionalidades
```

---

### 10.2 Código está na VM, mas navegador mostra versão antiga

Fazer hard refresh:

```txt
Ctrl + F5
```

Também testar em aba anônima.

Se ainda persistir, reiniciar PM2:

```powershell
pm2 restart painel-tv-v2 --update-env
```

---

### 10.3 Rota nova retorna 404

Verificar se o código realmente está na VM.

Exemplo:

```powershell
Select-String -Path server.js -Pattern "api/admin/diagnostico"
```

Se a rota existir no arquivo, mas o navegador retornar 404, provavelmente o processo Node antigo ainda está rodando.

Reiniciar:

```powershell
pm2 restart painel-tv-v2 --update-env
```

---

### 10.4 PM2 mostra processo online, mas sistema não responde

Verificar logs:

```powershell
pm2 logs painel-tv-v2
```

Verificar status:

```powershell
pm2 status
```

Reiniciar:

```powershell
pm2 restart painel-tv-v2 --update-env
```

---

### 10.5 Alterou `.env`, mas sistema não mudou comportamento

Reiniciar com atualização de ambiente:

```powershell
pm2 restart painel-tv-v2 --update-env
pm2 save
```

---

## 11. Exemplo real de deploy

Exemplo simplificado de deploy:

```powershell
PS C:\Windows\system32> cd c:\tv-v2\tv

PS C:\tv-v2\tv> git status
On branch fix-admin-funcionalidades
Your branch is up to date with 'origin/fix-admin-funcionalidades'.

nothing to commit, working tree clean

PS C:\tv-v2\tv> git pull origin fix-admin-funcionalidades
From https://github.com/pmrrp/tv
 * branch            fix-admin-funcionalidades -> FETCH_HEAD
Updating fb50905..42e3f85
Fast-forward

PS C:\tv-v2\tv> pm2 restart painel-tv-v2 --update-env
[PM2] Applying action restartProcessId on app [painel-tv-v2](ids: [ 0 ])
[PM2] [painel-tv-v2](0) ✓

PS C:\tv-v2\tv> pm2 status
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ painel-tv-v2       │ fork     │ 24   │ online    │ 0%       │ 60.3mb   │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘

PS C:\tv-v2\tv> pm2 save
[PM2] Saving current process list...
[PM2] Successfully saved in C:\Users\raul.souza\.pm2\dump.pm2
```

---

## 12. Fluxo resumido para uso rápido

```powershell
cd c:\tv-v2\tv
git status
git pull origin fix-admin-funcionalidades
pm2 restart painel-tv-v2 --update-env
pm2 status
pm2 save
```

---

## 13. Regra de ouro do deploy

Nunca fazer deploy sem antes confirmar:

```powershell
git status
```

Se houver alterações locais não entendidas, parar e investigar.

Produção não é lugar para “depois eu vejo”.

---

## 14. Histórico de validação recente

### Deploy da Fase 3 — Robustez operacional

Status:

```txt
Validado em produção/VM.
```

Itens validados:

- armazenamento operacional;
- bloqueio preventivo de upload;
- logs/auditoria refinados;
- backups automáticos JSON;
- backup manual/auditado do banco SQLite;
- painel visual de backups;
- diagnóstico operacional protegido;
- painel visual de diagnóstico;
- primeiro backup SQLite em produção;
- remoção do aviso de backup SQLite ausente;
- recorrência inteligente da playlist;
- documentação atualizada.

---