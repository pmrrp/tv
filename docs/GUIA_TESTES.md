# Guia de Testes — Painel Ribas

## 1. Objetivo

Este guia organiza os testes manuais necessários para validar o funcionamento do Painel Ribas.

Ele deve ser usado antes de:

- apresentar o sistema;
- fazer deploy;
- considerar uma fase finalizada;
- realizar grandes refatorações;
- subir alterações para a VM;
- validar correções críticas.

---

## 2. Ambientes de teste

Testar preferencialmente em:

- ambiente local;
- VM/produção;
- navegador principal usado na Prefeitura;
- navegador alternativo;
- mini PC conectado à TV, quando aplicável.

Navegadores recomendados:

- Google Chrome;
- Microsoft Edge.

---

## 3. Checklist rápido antes dos testes

Antes de iniciar:

- [ ] Confirmar branch atual.
- [ ] Confirmar `git status`.
- [ ] Confirmar que o servidor local está rodando.
- [ ] Confirmar que o `.env` local está com valores corretos.
- [ ] Confirmar ausência de alterações pendentes não intencionais.
- [ ] Abrir console do navegador.
- [ ] Fazer hard refresh com `Ctrl + F5`.

Comandos úteis:

```bash
git branch
git status
git --no-pager log --oneline -5
```

---

# TESTES GERAIS

## 4. Testes de acesso

- [ ] Acessar `/admin`.
- [ ] Confirmar redirecionamento para login quando não logado.
- [ ] Fazer login com usuário válido.
- [ ] Tentar login com senha incorreta.
- [ ] Confirmar mensagem de erro.
- [ ] Fazer logout.
- [ ] Confirmar encerramento da sessão.
- [ ] Atualizar página após logout e confirmar proteção.
- [ ] Confirmar foco automático no campo de login.

---

## 5. Testes da dashboard

- [ ] Confirmar carregamento do cabeçalho.
- [ ] Confirmar exibição do usuário logado.
- [ ] Confirmar carregamento dos cards de resumo.
- [ ] Confirmar ausência de erro vermelho no console.
- [ ] Confirmar botão de abrir player.
- [ ] Confirmar botão de logout.
- [ ] Confirmar menu do usuário.
- [ ] Confirmar que o menu do usuário fecha ao clicar fora.

---

## 6. Testes dos cards de resumo

- [ ] Confirmar total de mídias cadastradas.
- [ ] Confirmar mídias ativas/inativas.
- [ ] Confirmar mídias dentro da validade.
- [ ] Confirmar mídias agendadas/vencidas.
- [ ] Confirmar prioridades.
- [ ] Confirmar recorrências.
- [ ] Confirmar itens publicados na playlist.
- [ ] Confirmar última atualização da playlist.
- [ ] Confirmar card de armazenamento, quando disponível.
- [ ] Confirmar que os valores são atualizados após upload, exclusão ou alteração.

---

# TESTES DE UPLOAD

## 7. Testes de upload básico

- [ ] Enviar imagem pequena.
- [ ] Enviar vídeo pequeno.
- [ ] Enviar arquivo maior usando chunks.
- [ ] Confirmar barra/progresso de upload.
- [ ] Confirmar mensagem de sucesso.
- [ ] Confirmar mídia na biblioteca.
- [ ] Confirmar atualização da playlist.
- [ ] Confirmar log de upload.
- [ ] Confirmar que o card de armazenamento atualiza após upload.

---

## 8. Testes de upload em partes/chunks

- [ ] Enviar vídeo grande.
- [ ] Confirmar envio sequencial dos chunks.
- [ ] Confirmar finalização do upload.
- [ ] Confirmar criação do arquivo final em `midia/`.
- [ ] Confirmar remoção da pasta temporária em `data/upload-chunks/`.
- [ ] Confirmar registro da mídia na biblioteca.
- [ ] Confirmar atualização da playlist.
- [ ] Confirmar log de auditoria.

---

## 9. Testes de bloqueio preventivo por armazenamento

### Preparação

Temporariamente, em ambiente local, ajustar o `.env`:

```env
MEDIA_MAX_STORAGE_GB=1
DISK_MIN_FREE_GB=50
```

Reiniciar o servidor após alterar o `.env`.

### Testes

- [ ] Tentar enviar arquivo que ultrapasse o limite operacional.
- [ ] Confirmar mensagem amigável de bloqueio.
- [ ] Confirmar que o arquivo não entra na biblioteca.
- [ ] Confirmar que o arquivo não fica salvo indevidamente em `midia/`.
- [ ] Confirmar log `midia.upload.bloqueado`.
- [ ] Confirmar que o card de armazenamento indica estado de aviso/crítico quando aplicável.
- [ ] Testar bloqueio em upload simples, se aplicável.
- [ ] Testar bloqueio na finalização de chunks.
- [ ] Confirmar limpeza dos chunks após bloqueio na finalização.

### Restauração

Após o teste, retornar o `.env` para:

```env
MEDIA_MAX_STORAGE_GB=180
DISK_MIN_FREE_GB=50
```

Reiniciar o servidor.

---

# TESTES DA BIBLIOTECA

## 10. Testes de biblioteca

- [ ] Abrir biblioteca.
- [ ] Confirmar listagem de mídias.
- [ ] Confirmar prévias.
- [ ] Confirmar títulos.
- [ ] Confirmar nomes reais dos arquivos.
- [ ] Confirmar status.
- [ ] Confirmar prioridade.
- [ ] Confirmar período.
- [ ] Confirmar recorrência.
- [ ] Confirmar que o botão Detalhes abre o modal de detalhes da mídia.
- [ ] Confirmar que o modal de detalhes exibe dados da mídia.
- [ ] Confirmar que o modal de detalhes fecha pelo X.
- [ ] Confirmar que o modal de detalhes fecha pelo botão Fechar.
- [ ] Confirmar que o modal de detalhes fecha ao clicar fora.
- [ ] Confirmar que o modal de detalhes fecha com ESC.
- [ ] Confirmar que o status Ativo/Inativo exibe ícone visual adequado.
- [ ] Confirmar que o status muda corretamente ao ativar/inativar mídia.

---

## 11. Testes de edição de mídia

- [ ] Alterar título amigável.
- [ ] Confirmar que o botão "Salvar alterações" aparece após alterar o título.
- [ ] Salvar mídia individual.
- [ ] Confirmar mensagem de sucesso.
- [ ] Confirmar atualização da playlist.
- [ ] Alterar prioridade.
- [ ] Alterar recorrência.
- [ ] Alterar período.
- [ ] Confirmar que alterações de configuração exigem salvamento, exceto ações que salvam diretamente.
- [ ] Confirmar log de edição.

---

## 12. Testes de alterações pendentes

- [ ] Alterar título amigável de uma mídia sem salvar.
- [ ] Confirmar que o card fica marcado como alterado.
- [ ] Confirmar que o botão global "Salvar alterações" aparece.
- [ ] Clicar no botão "Sair".
- [ ] Confirmar que aparece modal próprio de alterações pendentes.
- [ ] Clicar em "Continuar editando".
- [ ] Confirmar que permanece na página.
- [ ] Clicar em "Sair" novamente.
- [ ] Clicar em "Sair sem salvar".
- [ ] Confirmar encerramento da sessão.
- [ ] Alterar novamente uma mídia sem salvar.
- [ ] Apertar F5.
- [ ] Confirmar que aparece modal próprio de alterações pendentes.
- [ ] Alterar novamente uma mídia sem salvar.
- [ ] Apertar Ctrl+R.
- [ ] Confirmar que aparece modal próprio de alterações pendentes.
- [ ] Alterar novamente uma mídia sem salvar.
- [ ] Clicar no botão atualizar do navegador.
- [ ] Confirmar que aparece o alerta nativo do navegador.

---

## 13. Testes da TAG Ativo/Inativo

- [ ] Clicar na TAG "Ativo" de uma mídia.
- [ ] Confirmar que a TAG muda imediatamente para "Inativo".
- [ ] Confirmar que o status é salvo automaticamente sem clicar em "Salvar alterações".
- [ ] Confirmar que o botão "Salvar alterações" não aparece apenas por ativar/inativar mídia.
- [ ] Confirmar que a mídia inativa sai da playlist.
- [ ] Confirmar que o card inativo bloqueia edição de nome.
- [ ] Confirmar que o card inativo bloqueia edição de duração.
- [ ] Confirmar que o card inativo bloqueia edição de período.
- [ ] Confirmar que o card inativo bloqueia edição de prioridade.
- [ ] Confirmar que o card inativo bloqueia edição de repetição.
- [ ] Confirmar que o botão Detalhes continua funcionando.
- [ ] Confirmar que o botão Excluir continua disponível e visualmente ativo.
- [ ] Confirmar que a seleção em lote continua funcionando, se o modo seleção estiver ativo.
- [ ] Clicar novamente na TAG "Inativo".
- [ ] Confirmar que a mídia volta para "Ativo".
- [ ] Confirmar que os campos de edição voltam a ficar disponíveis.
- [ ] Confirmar que a playlist é atualizada automaticamente.
- [ ] Confirmar que os filtros são reaplicados após mudança de status.

---

# TESTES DE FILTROS

## 14. Testes dos filtros da biblioteca

- [ ] Abrir filtros.
- [ ] Aplicar filtro por busca textual.
- [ ] Aplicar filtro por status.
- [ ] Aplicar filtro por tipo.
- [ ] Aplicar filtro por período.
- [ ] Aplicar filtro por prioridade.
- [ ] Aplicar filtro por recorrência.
- [ ] Combinar múltiplos filtros.
- [ ] Confirmar contador de filtros aplicados.
- [ ] Confirmar que filtros só são aplicados ao clicar em "Aplicar filtros".
- [ ] Confirmar que "Limpar filtros" remove todos os filtros.
- [ ] Confirmar que clicar fora sem aplicar descarta rascunho.
- [ ] Confirmar que ESC sem aplicar descarta rascunho.
- [ ] Confirmar que selects premium refletem os valores aplicados.
- [ ] Confirmar que selects premium não quebram layout.

---

# TESTES DE PERÍODO, PRIORIDADE E RECORRÊNCIA

## 15. Testes de período de exibição

- [ ] Definir mídia com início futuro.
- [ ] Confirmar que ela aparece como agendada.
- [ ] Confirmar que ela não entra na playlist antes do início.
- [ ] Definir mídia vencida.
- [ ] Confirmar que ela sai da playlist.
- [ ] Definir período indefinido.
- [ ] Confirmar que permanece ativa.
- [ ] Confirmar rotina automática de atualização.
- [ ] Confirmar salvamento direto ao aplicar período no modal.
- [ ] Confirmar validação impedindo data final anterior à inicial.

---

## 16. Testes do modal premium de período

- [ ] Abrir modal de período.
- [ ] Confirmar nome da mídia no modal.
- [ ] Selecionar data inicial.
- [ ] Aplicar início.
- [ ] Selecionar data final.
- [ ] Aplicar fim.
- [ ] Abrir seletor de horário.
- [ ] Alterar hora.
- [ ] Alterar minuto.
- [ ] Confirmar horário.
- [ ] Confirmar que ESC fecha primeiro o seletor de horário.
- [ ] Confirmar que ESC depois fecha o modal principal.
- [ ] Confirmar feedback interno do modal.
- [ ] Salvar período.
- [ ] Confirmar atualização no card.
- [ ] Confirmar atualização da playlist.

---

## 17. Testes de prioridade e repetição

- [ ] Selecionar prioridade Normal em uma imagem.
- [ ] Confirmar que o campo de repetição fica oculto.
- [ ] Selecionar prioridade Alta em uma imagem.
- [ ] Confirmar que o campo de repetição aparece.
- [ ] Confirmar sugestão de repetição "A cada 6 mídias".
- [ ] Selecionar prioridade Urgente em uma imagem.
- [ ] Confirmar sugestão de repetição "A cada 3 mídias".
- [ ] Repetir os mesmos testes em uma mídia do tipo vídeo.
- [ ] Confirmar que vídeo não exibe campo de duração manual.
- [ ] Confirmar que imagem mantém o campo de duração manual.
- [ ] Alterar manualmente o valor de repetição.
- [ ] Salvar a mídia.
- [ ] Recarregar a página.
- [ ] Confirmar que prioridade e repetição permanecem corretas.
- [ ] Confirmar que a playlist é atualizada após salvar.

---

## 18. Testes do select premium de repetição

- [ ] Alterar prioridade de uma mídia para Alta.
- [ ] Confirmar abertura do select premium de repetição.
- [ ] Escolher "A cada 6 mídias".
- [ ] Confirmar valor no select real.
- [ ] Confirmar que o botão salvar aparece.
- [ ] Salvar.
- [ ] Recarregar página.
- [ ] Confirmar valor persistido.
- [ ] Alterar prioridade para Normal.
- [ ] Confirmar que repetição fica oculta/desativada.
- [ ] Confirmar que a playlist não repete mídia Normal.

---

## 19. Testes da recorrência inteligente da playlist

### Objetivo

Validar se a playlist evita mídias repetidas muito próximas da própria posição original.

### Cenário recomendado

Criar ou usar pelo menos duas mídias com recorrência ativa:

```txt
Mídia A — repetir a cada 3 mídias
Mídia B — repetir a cada 3 mídias
```

### Testes

- [ ] Gerar playlist com duas mídias recorrentes.
- [ ] Abrir `playlist.json`.
- [ ] Confirmar que a mesma mídia não aparece colada nela mesma.
- [ ] Confirmar que a mesma mídia não aparece separada por apenas uma posição, quando evitável.
- [ ] Mover uma mídia recorrente para perto do início da lista.
- [ ] Gerar playlist novamente.
- [ ] Confirmar distribuição visual aceitável.
- [ ] Mover uma mídia recorrente para perto do meio da lista.
- [ ] Gerar playlist novamente.
- [ ] Confirmar distribuição visual aceitável.
- [ ] Mover uma mídia recorrente para perto do final da lista.
- [ ] Gerar playlist novamente.
- [ ] Confirmar que a lógica considera o loop da playlist.
- [ ] Confirmar que a contagem não reseta de forma estranha no início de um novo ciclo.
- [ ] Confirmar que, se necessário, o sistema pula uma repetição para evitar duplicação visual incômoda.

### Resultado esperado

A recorrência deve destacar mídias importantes sem gerar sensação de bug visual.

---

# TESTES DE PLAYLIST E PLAYER

## 20. Testes de geração da playlist

- [ ] Gerar playlist manualmente.
- [ ] Confirmar mensagem de sucesso.
- [ ] Confirmar atualização de `playlist.json`.
- [ ] Confirmar que mídias inativas não entram.
- [ ] Confirmar que mídias vencidas não entram.
- [ ] Confirmar que mídias futuras não entram antes da data.
- [ ] Confirmar que prioridade e recorrência são respeitadas.
- [ ] Confirmar que a recorrência inteligente evita duplicações coladas.
- [ ] Confirmar log/auditoria, quando aplicável.

---

## 21. Testes do player

- [ ] Abrir player.
- [ ] Confirmar splash/carregamento inicial.
- [ ] Confirmar reprodução de vídeo.
- [ ] Confirmar exibição de imagem.
- [ ] Confirmar duração configurada para imagens.
- [ ] Confirmar troca automática de mídia.
- [ ] Confirmar loop da playlist.
- [ ] Confirmar atualização automática após nova playlist.
- [ ] Confirmar relógio.
- [ ] Confirmar sidebar/visual premium.
- [ ] Confirmar ausência de erro vermelho no console.
- [ ] Confirmar áudio no mini PC, quando aplicável.
- [ ] Confirmar comportamento em tela cheia/quiosque.

---

# TESTES DE USUÁRIOS E PERMISSÕES

## 22. Testes de usuários

- [ ] Acessar área de usuários como superadmin.
- [ ] Criar novo usuário.
- [ ] Editar usuário.
- [ ] Alterar role.
- [ ] Ativar/desativar usuário.
- [ ] Resetar senha.
- [ ] Excluir usuário.
- [ ] Confirmar que superadmin não consegue excluir a si mesmo.
- [ ] Confirmar que usuário não consegue desativar a si mesmo.
- [ ] Confirmar proteção contra admin comum alterar superadmin.
- [ ] Confirmar proteção contra admin comum promover usuário para superadmin.
- [ ] Confirmar logs das ações.

---

## 23. Testes por perfil

### Superadmin

- [ ] Acessa usuários.
- [ ] Acessa auditoria.
- [ ] Acessa backups.
- [ ] Acessa diagnóstico.
- [ ] Gera backup do banco.
- [ ] Executa ações administrativas sensíveis.

### Admin

- [ ] Acessa funções permitidas.
- [ ] Não acessa funções exclusivas de superadmin.
- [ ] Não altera superadmin.
- [ ] Não promove usuário para superadmin.

### Editor

- [ ] Pode operar mídias conforme permissão definida.
- [ ] Não acessa gerenciamento sensível de usuários.
- [ ] Não acessa backups/diagnóstico, se restrito.

### Viewer

- [ ] Não realiza ações de edição.
- [ ] Visualiza apenas o que for permitido.

---

# TESTES DE AUDITORIA

## 24. Testes de logs de auditoria

- [ ] Confirmar carregamento da seção Auditoria para superadmin.
- [ ] Confirmar que a seção fica oculta para usuários sem permissão.
- [ ] Confirmar log de login.
- [ ] Confirmar log de logout.
- [ ] Confirmar log de upload.
- [ ] Confirmar log de upload bloqueado.
- [ ] Confirmar log de edição de mídia.
- [ ] Confirmar log de exclusão de mídia.
- [ ] Confirmar log de exclusão em lote.
- [ ] Confirmar log de criação de usuário.
- [ ] Confirmar log de edição de usuário.
- [ ] Confirmar log de reset de senha.
- [ ] Confirmar log de exclusão de usuário.
- [ ] Confirmar log de backup JSON automático.
- [ ] Confirmar log de backup SQLite manual.
- [ ] Confirmar log de limpeza automática de chunks.
- [ ] Confirmar títulos amigáveis dos logs.
- [ ] Confirmar resumos humanos.
- [ ] Confirmar detalhes técnicos expansíveis.
- [ ] Confirmar rolagem interna da lista.

---

# TESTES DA FASE 3 — ROBUSTEZ OPERACIONAL

## 25. Testes de armazenamento

- [ ] Acessar `/api/admin/resumo`.
- [ ] Confirmar bloco `armazenamento`.
- [ ] Confirmar `midiasFormatado`.
- [ ] Confirmar `limiteMidiasFormatado`.
- [ ] Confirmar `midiasUsoPercentual`.
- [ ] Confirmar `discoLivreFormatado`.
- [ ] Confirmar `status`.
- [ ] Confirmar card visual de armazenamento na dashboard.
- [ ] Confirmar barra visual de progresso.
- [ ] Confirmar texto de usado/limite/livre.
- [ ] Confirmar mudança visual quando limite temporário é reduzido no `.env`.

---

## 26. Testes de limpeza automática de chunks

### Preparação

Criar uma pasta temporária de teste em:

```txt
data/upload-chunks/
```

Quando necessário, usar tempo reduzido temporariamente no código apenas para teste.

### Testes

- [ ] Confirmar que a rotina detecta chunks antigos.
- [ ] Confirmar que pastas antigas são removidas.
- [ ] Confirmar que uploads recentes não são removidos.
- [ ] Confirmar log/auditoria `sistema.chunks.limpeza`.
- [ ] Confirmar detalhes técnicos do log.
- [ ] Restaurar tempo normal de 24 horas após o teste.

---

## 27. Testes de backups

- [ ] Abrir seção Backups como superadmin.
- [ ] Confirmar que a seção fica oculta para usuários sem permissão.
- [ ] Confirmar listagem de backups.
- [ ] Confirmar contagem total.
- [ ] Confirmar contagem de `midia-config`.
- [ ] Confirmar contagem de `playlist`.
- [ ] Confirmar contagem de banco SQLite.
- [ ] Confirmar rolagem interna.
- [ ] Confirmar cards de backup.
- [ ] Confirmar tamanho do arquivo.
- [ ] Confirmar data/hora local.
- [ ] Gerar backup manual do banco SQLite.
- [ ] Confirmar criação de arquivo `.db` em `backups/`.
- [ ] Confirmar log `sistema.backup.database`.
- [ ] Confirmar atualização da listagem após gerar backup.
- [ ] Confirmar atualização do diagnóstico após gerar backup.

---

## 28. Testes de diagnóstico operacional

- [ ] Abrir seção Diagnóstico como superadmin.
- [ ] Confirmar que a seção fica oculta para usuários sem permissão.
- [ ] Confirmar que o dropdown inicia recolhido.
- [ ] Clicar para expandir.
- [ ] Confirmar status geral.
- [ ] Confirmar Banco SQLite.
- [ ] Confirmar Armazenamento.
- [ ] Confirmar Backups.
- [ ] Confirmar Mídias.
- [ ] Confirmar Arquivos essenciais.
- [ ] Confirmar Avisos, quando existirem.
- [ ] Confirmar Problemas críticos, quando existirem.
- [ ] Confirmar que avisos mostram texto detalhado.
- [ ] Clicar em atualizar diagnóstico.
- [ ] Confirmar atualização sem erro.
- [ ] Confirmar ausência de erro vermelho no console.

---

## 29. Testes das rotas operacionais

### Health público

```txt
/api/health
```

- [ ] Confirmar `ok: true`.
- [ ] Confirmar nome do sistema.
- [ ] Confirmar uptime.
- [ ] Confirmar ambiente.
- [ ] Confirmar data/hora UTC.

---

### Resumo admin

```txt
/api/admin/resumo
```

- [ ] Confirmar retorno autenticado.
- [ ] Confirmar resumo de mídias.
- [ ] Confirmar resumo da playlist.
- [ ] Confirmar resumo de armazenamento.
- [ ] Confirmar servidor/data/hora.

---

### Backups

```txt
/api/admin/backups
```

- [ ] Confirmar retorno autenticado.
- [ ] Confirmar backups JSON.
- [ ] Confirmar backups SQLite.
- [ ] Confirmar tipos de backup.
- [ ] Confirmar total por tipo.

---

### Diagnóstico

```txt
/api/admin/diagnostico
```

- [ ] Confirmar acesso apenas permitido conforme regra definida.
- [ ] Confirmar status geral.
- [ ] Confirmar banco.
- [ ] Confirmar armazenamento.
- [ ] Confirmar backups.
- [ ] Confirmar mídias.
- [ ] Confirmar arquivos essenciais.

---

# TESTES DE DEPLOY NA VM

## 30. Checklist pós-deploy na VM

Após deploy:

- [ ] Confirmar `git status` limpo na VM.
- [ ] Confirmar branch `fix-admin-funcionalidades`.
- [ ] Executar `git pull origin fix-admin-funcionalidades`.
- [ ] Reiniciar PM2 com `--update-env`.
- [ ] Confirmar `pm2 status`.
- [ ] Confirmar `pm2 save`.
- [ ] Acessar painel em produção.
- [ ] Fazer login.
- [ ] Confirmar dashboard.
- [ ] Confirmar player.
- [ ] Confirmar upload.
- [ ] Confirmar playlist.
- [ ] Confirmar backups.
- [ ] Confirmar diagnóstico.
- [ ] Confirmar auditoria.
- [ ] Confirmar ausência de erro no console.

Comandos:

```powershell
cd c:\tv-v2\tv
git status
git pull origin fix-admin-funcionalidades
pm2 restart painel-tv-v2 --update-env
pm2 status
pm2 save
```

---

## 31. Teste do primeiro backup SQLite na VM

Após deploy da funcionalidade de backup SQLite:

- [ ] Abrir seção Backups na VM.
- [ ] Gerar primeiro backup do banco.
- [ ] Confirmar novo arquivo `.db`.
- [ ] Atualizar diagnóstico.
- [ ] Confirmar que o aviso de backup SQLite ausente desapareceu.
- [ ] Confirmar log de auditoria.

---

# TESTES DE RESPONSIVIDADE

## 32. Testes mobile/tablet

- [ ] Testar login em tela pequena.
- [ ] Testar dashboard em tela pequena.
- [ ] Testar cards de resumo.
- [ ] Testar biblioteca.
- [ ] Testar filtros.
- [ ] Testar modal de detalhes.
- [ ] Testar modal de período.
- [ ] Testar mini modal de horário.
- [ ] Testar seção Backups.
- [ ] Testar seção Diagnóstico.
- [ ] Verificar rolagem interna dos dropdowns.
- [ ] Verificar botões em largura total quando necessário.

---

# TESTES DE REGRESSÃO

## 33. Regressão obrigatória após mexer no backend

- [ ] Login.
- [ ] Sessão.
- [ ] Upload.
- [ ] Upload em chunks.
- [ ] Listagem de mídias.
- [ ] Salvamento de mídia.
- [ ] Geração de playlist.
- [ ] Player.
- [ ] Logs.
- [ ] Usuários.
- [ ] Backups.
- [ ] Diagnóstico.
- [ ] Console sem erro.

---

## 34. Regressão obrigatória após mexer no admin.js

- [ ] Dashboard carrega.
- [ ] Upload funciona.
- [ ] Biblioteca renderiza.
- [ ] Filtros funcionam.
- [ ] Modais abrem e fecham.
- [ ] Salvar mídia funciona.
- [ ] Ativar/Inativar funciona.
- [ ] Usuários funcionam.
- [ ] Auditoria carrega.
- [ ] Backups carrega.
- [ ] Diagnóstico carrega.
- [ ] Console sem erro.

---

## 35. Regressão obrigatória após mexer no admin.css

- [ ] Login visualmente correto.
- [ ] Header correto.
- [ ] Cards de resumo corretos.
- [ ] Upload correto.
- [ ] Biblioteca correta.
- [ ] Cards de mídia corretos.
- [ ] Modais corretos.
- [ ] Auditoria correta.
- [ ] Backups correto.
- [ ] Diagnóstico correto.
- [ ] Responsivo aceitável.
- [ ] Sem quebras visuais graves.

---

# 36. Critérios gerais de aprovação

Uma alteração só deve ser considerada aprovada quando:

- [ ] não houver erro vermelho no console;
- [ ] não houver erro no terminal do Node;
- [ ] o fluxo principal continuar funcionando;
- [ ] o comportamento novo estiver testado;
- [ ] o comportamento antigo não tiver quebrado;
- [ ] a playlist for gerada corretamente;
- [ ] o player continuar exibindo conteúdo;
- [ ] o `git status` estiver limpo após commit;
- [ ] o push tiver sido realizado;
- [ ] a VM tiver sido atualizada, quando aplicável.

---

# 37. Observação final

Este guia deve ser atualizado sempre que novas funcionalidades forem adicionadas.

Ele não substitui testes automatizados, mas organiza a validação manual necessária para manter o Painel Ribas confiável em uso real.