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

## 5.1 Testes de dicas contextuais / tooltips nativos

- [ ] Confirmar dicas nativas nos cards de resumo operacional.
- [ ] Confirmar dicas nativas na área de upload.
- [ ] Confirmar dicas nativas na biblioteca de mídias.
- [ ] Confirmar dicas nativas nos filtros da biblioteca.
- [ ] Confirmar dicas nativas nos cards de mídia.
- [ ] Confirmar dicas nativas nos controles de duração, período, prioridade, recorrência, detalhes, exclusão e salvamento.
- [ ] Confirmar dicas nativas na seção de usuários.
- [ ] Confirmar dicas nativas nos botões de criar, editar, ativar/desativar, resetar senha e excluir usuário.
- [ ] Confirmar dicas nativas na auditoria/logs.
- [ ] Confirmar dicas nativas na seção de backups.
- [ ] Confirmar dicas nativas na seção de diagnóstico operacional.
- [ ] Confirmar que os ícones de ajuda aparecem apenas nos títulos principais das seções.
- [ ] Confirmar que não há excesso visual de interrogações dentro dos cards.
- [ ] Confirmar que os tooltips/dicas não impedem cliques, abertura de dropdowns, modais ou botões.
- [ ] Confirmar que não há erro vermelho no console.

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

### Objetivo

Validar se o painel envia mídias válidas, atualiza a biblioteca, publica a playlist e registra auditoria corretamente.

### Testes

- [ ] Enviar imagem pequena válida (`.jpg`, `.jpeg`, `.png`, `.webp` ou `.gif`).
- [ ] Enviar vídeo pequeno válido (`.mp4`, `.webm`, `.ogg` ou `.mov`).
- [ ] Confirmar barra/progresso de upload.
- [ ] Confirmar mensagem de sucesso.
- [ ] Confirmar mídia na biblioteca.
- [ ] Confirmar título amigável da mídia.
- [ ] Confirmar tipo correto da mídia.
- [ ] Confirmar atualização da playlist.
- [ ] Confirmar log de upload.
- [ ] Confirmar que o card de armazenamento atualiza após upload.
- [ ] Confirmar ausência de erro vermelho no console.
- [ ] Confirmar ausência de erro no terminal do Node.

### Resultado esperado

- A mídia válida deve ser enviada com sucesso.
- A mídia deve aparecer na biblioteca.
- A playlist deve ser atualizada automaticamente.
- O log `midia.upload` deve ser registrado.
- O card de armazenamento deve refletir o novo uso.

---

## 8. Testes de upload em partes/chunks

### Objetivo

Validar se arquivos grandes são enviados em partes, montados corretamente no backend e limpos após a finalização.

### Testes

- [ ] Enviar vídeo grande.
- [ ] Confirmar envio sequencial dos chunks.
- [ ] Confirmar atualização da barra de progresso.
- [ ] Confirmar mensagem de envio em andamento.
- [ ] Confirmar finalização do upload.
- [ ] Confirmar criação do arquivo final em `midia/`.
- [ ] Confirmar remoção da pasta temporária em `data/upload-chunks/`.
- [ ] Confirmar registro da mídia na biblioteca.
- [ ] Confirmar atualização da playlist.
- [ ] Confirmar log de auditoria.
- [ ] Confirmar ausência de erro vermelho no console.
- [ ] Confirmar ausência de erro no terminal do Node.

### Resultado esperado

- O arquivo grande deve ser dividido em chunks.
- O backend deve montar o arquivo final corretamente.
- A pasta temporária do upload deve ser removida após a finalização.
- A mídia deve ser cadastrada e publicada normalmente.

---

## 9. Testes de bloqueio preventivo por armazenamento

### Objetivo

Validar se o sistema impede uploads que ultrapassem o limite operacional da pasta de mídias ou comprometam a reserva mínima de disco.

### Preparação

Temporariamente, em ambiente local, ajustar o `.env`:

    MEDIA_MAX_STORAGE_GB=1
    DISK_MIN_FREE_GB=50

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
- [ ] Confirmar atualização do card de armazenamento após o bloqueio.
- [ ] Confirmar ausência de erro vermelho no console.
- [ ] Confirmar ausência de erro no terminal do Node.

### Resultado esperado

- O upload deve ser bloqueado antes de comprometer o armazenamento.
- A mensagem deve explicar o motivo do bloqueio.
- O arquivo não deve permanecer salvo indevidamente.
- A tentativa deve aparecer nos logs de auditoria.

### Restauração

Após o teste, retornar o `.env` para:

    MEDIA_MAX_STORAGE_GB=180
    DISK_MIN_FREE_GB=50

Reiniciar o servidor.

---

## 9.1 Testes de bloqueio por tipo de arquivo

### Objetivo

Validar se o backend bloqueia arquivos perigosos ou não permitidos antes que eles sejam cadastrados na biblioteca.

### Arquivos sugeridos para teste

- `.txt`
- `.bat`
- `.cmd`
- `.ps1`
- `.js`
- `.html`
- `.exe`, se houver arquivo seguro apenas para teste controlado
- `.zip`
- `.rar`

### Testes

- [ ] Tentar enviar arquivo `.txt`.
- [ ] Tentar enviar arquivo `.bat`.
- [ ] Tentar enviar arquivo `.js`.
- [ ] Tentar enviar arquivo `.html`.
- [ ] Tentar enviar arquivo compactado, como `.zip` ou `.rar`.
- [ ] Confirmar mensagem amigável de bloqueio.
- [ ] Confirmar que o arquivo não entra na biblioteca.
- [ ] Confirmar que o arquivo não fica salvo em `midia/`.
- [ ] Confirmar log `midia.upload.bloqueado`.
- [ ] Confirmar resumo amigável do bloqueio nos logs.
- [ ] Confirmar detalhes técnicos expansíveis nos logs.
- [ ] Confirmar ausência de erro vermelho no console.
- [ ] Confirmar ausência de erro no terminal do Node.

### Resultado esperado

- O sistema deve bloquear arquivos não permitidos.
- A mensagem deve indicar que o arquivo foi bloqueado por segurança.
- O arquivo não deve ser cadastrado nem publicado.
- A tentativa deve ser auditada.

---

## 9.2 Testes de bloqueio por MIME type e assinatura/magic bytes

### Objetivo

Validar se o sistema não confia apenas na extensão do arquivo e bloqueia arquivos renomeados indevidamente.

### Preparação

Criar um arquivo de texto simples e renomear para uma extensão permitida, por exemplo:

    fake.png
    fake.mp4

Também pode ser criado um arquivo grande de texto e renomeado para `.mp4` para forçar upload em chunks.

### Testes

- [ ] Criar arquivo de texto comum.
- [ ] Renomear o arquivo para `.png`.
- [ ] Tentar enviar pelo painel.
- [ ] Confirmar bloqueio por conteúdo incompatível.
- [ ] Confirmar que o arquivo não entra na biblioteca.
- [ ] Confirmar que o arquivo não fica salvo em `midia/`.
- [ ] Confirmar log `midia.upload.bloqueado`.
- [ ] Criar arquivo de texto grande.
- [ ] Renomear o arquivo grande para `.mp4`.
- [ ] Enviar pelo painel para forçar upload em chunks.
- [ ] Confirmar que os chunks podem até ser recebidos, mas a finalização bloqueia o arquivo.
- [ ] Confirmar remoção do arquivo final inválido.
- [ ] Confirmar remoção da pasta temporária em `data/upload-chunks/`.
- [ ] Confirmar auditoria do bloqueio.
- [ ] Confirmar ausência de erro vermelho no console.
- [ ] Confirmar ausência de erro no terminal do Node.

### Resultado esperado

- Arquivos com extensão permitida, mas conteúdo incompatível, devem ser bloqueados.
- O sistema deve impedir que texto/script disfarçado de imagem ou vídeo seja cadastrado.
- Uploads inválidos em chunks devem ser bloqueados na finalização.
- Arquivos finais inválidos e chunks temporários devem ser removidos.

---

## 9.3 Testes de cancelamento de upload

### Objetivo

Validar se o operador consegue cancelar um upload em andamento e se o sistema remove os chunks temporários quando possível.

### Testes

- [ ] Selecionar arquivo grande.
- [ ] Iniciar o envio.
- [ ] Confirmar que a barra de progresso aparece.
- [ ] Confirmar que o botão “Cancelar envio” aparece.
- [ ] Confirmar que o botão “Enviar mídia” fica desabilitado durante o envio.
- [ ] Clicar em “Cancelar envio”.
- [ ] Confirmar que o botão muda para estado de cancelamento.
- [ ] Confirmar que o envio é interrompido.
- [ ] Confirmar que a barra de progresso para.
- [ ] Confirmar mensagem de cancelamento no card de upload.
- [ ] Confirmar que a mensagem de cancelamento usa visual de aviso.
- [ ] Confirmar que o botão “Enviar mídia” volta ao estado normal.
- [ ] Confirmar que o input de arquivo volta a ficar disponível.
- [ ] Confirmar log `midia.upload.cancelado`.
- [ ] Confirmar nos detalhes técnicos do log o tamanho temporário removido.
- [ ] Confirmar remoção da pasta temporária em `data/upload-chunks/`, quando aplicável.
- [ ] Confirmar ausência de erro vermelho no console.
- [ ] Confirmar ausência de erro no terminal do Node.

### Resultado esperado

- O upload deve ser cancelado sem travar a tela.
- O botão de envio deve voltar ao estado normal.
- O sistema deve tentar remover os chunks temporários imediatamente.
- A auditoria `midia.upload.cancelado` deve ser registrada.
- A rotina automática de limpeza de chunks continua como segunda camada de segurança.

---

## 9.4 Testes de upload após cancelamento

### Objetivo

Garantir que cancelar um upload não quebra o próximo envio.

### Testes

- [ ] Cancelar um upload grande.
- [ ] Selecionar uma imagem válida.
- [ ] Enviar normalmente.
- [ ] Confirmar sucesso do upload.
- [ ] Confirmar mídia na biblioteca.
- [ ] Confirmar playlist atualizada.
- [ ] Selecionar um vídeo válido.
- [ ] Enviar normalmente.
- [ ] Confirmar sucesso do upload.
- [ ] Confirmar ausência de travamento no botão.
- [ ] Confirmar ausência de progresso antigo preso na tela.
- [ ] Confirmar ausência de mensagem antiga no card de upload.
- [ ] Confirmar ausência de erro vermelho no console.

### Resultado esperado

- O sistema deve continuar aceitando novos uploads após um cancelamento.
- Nenhum estado visual antigo deve permanecer travado.
- O fluxo normal de upload deve continuar funcionando.

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
- [ ] Fazer hard reload ou testar em aba anônima após alterações de CSS/JS.
- [ ] Confirmar que os estilos dos ícones de ajuda foram carregados corretamente.
- [ ] Confirmar que as dicas nativas aparecem nos principais controles.
- [ ] Abrir DevTools > Network e confirmar headers anti-cache em `admin.css` e `admin.js`.
- [ ] Confirmar que `Cache-Control` aparece como `no-cache, no-store, must-revalidate` nos assets do admin.
- [ ] Confirmar que o admin carrega corretamente após deploy sem inconsistência visual.

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

## 32. Testes de cache do frontend administrativo

- [ ] Abrir o painel administrativo.
- [ ] Abrir DevTools > Network.
- [ ] Recarregar a página.
- [ ] Conferir `admin.css`.
- [ ] Conferir `admin.js`.
- [ ] Confirmar header `Cache-Control: no-cache, no-store, must-revalidate`.
- [ ] Confirmar que mídias/vídeos/imagens não foram afetados pela regra anti-cache.
- [ ] Confirmar dashboard sem erro visual.
- [ ] Confirmar console sem erro.

---

# TESTES DE RESPONSIVIDADE

## 33. Testes mobile/tablet

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

## 34. Regressão obrigatória após mexer no backend

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

## 35. Regressão obrigatória após mexer no admin.js

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

## 36. Regressão obrigatória após mexer no admin.css

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

# 37. Critérios gerais de aprovação

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

# 38. Observação final

Este guia deve ser atualizado sempre que novas funcionalidades forem adicionadas.

Ele não substitui testes automatizados, mas organiza a validação manual necessária para manter o Painel Ribas confiável em uso real.