# Backlog — Fase 3 e Fase 4 do Painel Ribas

## 1. Objetivo deste documento

Este documento organiza o backlog atualizado do Painel Ribas após a consolidação da Fase 2 e o avanço significativo da Fase 3.

Ele serve para:

- registrar o que já foi concluído;
- separar o que ainda falta para fechar a Fase 3;
- evitar retrabalho e sensação de patinação;
- remover da pressão imediata itens que são importantes, mas não bloqueiam a entrega;
- orientar a evolução para uma versão comercial/whitelabel;
- manter uma visão clara do caminho entre o sistema institucional atual e um produto vendável.

---

## 2. Estado atual do sistema

O Painel Ribas está com a Fase 2 funcionalmente consolidada e com grande parte da Fase 3 já implementada, testada, commitada e enviada para a branch principal de desenvolvimento.

O sistema já possui:

- player institucional funcional;
- dashboard administrativa;
- login;
- controle de sessão;
- logout automático por inatividade;
- controle de sessões simultâneas por usuário;
- revogação automática de sessão antiga ao realizar novo login;
- painel de sessões ativas para superadmin;
- revogação manual de sessões pelo superadmin;
- recuperação de senha por e-mail;
- tela de solicitação de recuperação de senha;
- tela de redefinição de senha por token;
- limpeza automática de tokens antigos;
- auditoria visual das ações de recuperação de senha;
- upload de imagens e vídeos;
- upload em partes/chunks;
- validação de extensão;
- validação de MIME type;
- validação básica de assinatura/magic bytes;
- bloqueio de arquivos perigosos;
- bloqueio de arquivos renomeados indevidamente;
- mensagens de upload mais amigáveis;
- cancelamento manual de upload em andamento;
- remoção de chunks após cancelamento;
- auditoria de uploads bloqueados e cancelados;
- biblioteca de mídias;
- filtros avançados;
- agendamento por período;
- prioridade e recorrência;
- geração automática da playlist;
- lógica aprimorada de recorrência para evitar mídias repetidas muito próximas;
- gerenciamento de usuários;
- perfis de acesso;
- logs de auditoria;
- visualização refinada dos logs;
- backups automáticos JSON;
- backup manual/auditado do banco SQLite;
- painel visual de backups;
- diagnóstico operacional protegido;
- painel visual de diagnóstico;
- exportação do diagnóstico operacional em `.txt`;
- controle de armazenamento;
- limite operacional da pasta `midia/` via `.env`;
- reserva mínima de disco livre via `.env`;
- bloqueio preventivo de uploads por limite operacional;
- limpeza automática de chunks antigos;
- deploy em VM;
- acesso via domínio;
- player com visual premium;
- modo quiosque com áudio em mini PC;
- documentação técnica, executiva e operacional inicial;
- documentos de preparação/configuração dos pontos de TV.

---

## 3. Direção geral das próximas fases

### Fase 3 — Fechamento da robustez operacional

A Fase 3 deve ser encerrada com foco em estabilidade, operação real e manutenção.

Neste momento, a Fase 3 não deve crescer indefinidamente com novas ideias. O foco passa a ser finalizar apenas o que realmente fecha o ciclo operacional.

Prioridades reais para fechamento:

1. permitir download seguro de backups pelo admin;
2. melhorar fallback básico do player para cenários sem playlist, sem mídia válida ou falha de mídia;
3. implementar a cereja do bolo da Fase 3: Fallback Local do Player com agente local em Node.js nos PCs das TVs;
4. tratar SMTP institucional como pendência externa documentada, sem travar o fechamento;
5. revisar documentação essencial;
6. validar em produção/VM;
7. fechar a Fase 3.

### Fase 4 — Produto comercial / whitelabel

A Fase 4 deve preparar o sistema para uma possível versão comercial, personalizada e vendável para clientes externos.

O foco principal será transformar a base atual em um produto:

- estável;
- bonito;
- personalizável;
- fácil de instalar;
- fácil de explicar;
- fácil de manter;
- vendável para pequenos negócios locais.

---

# FASE 3 — STATUS ATUALIZADO

## 4. Bloco de robustez operacional — concluído

### Objetivo

Fortalecer a base operacional do sistema para uso contínuo em produção.

### Itens concluídos

- [x] Implementar limpeza automática de uploads em partes/chunks antigos.
- [x] Registrar auditoria da limpeza automática de chunks.
- [x] Adicionar resumo de armazenamento no backend.
- [x] Configurar limite operacional da pasta `midia/` via `.env`.
- [x] Configurar reserva mínima de disco livre via `.env`.
- [x] Bloquear uploads quando ultrapassarem limite operacional de armazenamento.
- [x] Bloquear finalização de uploads em chunks quando houver risco de armazenamento.
- [x] Registrar auditoria de uploads bloqueados por armazenamento.
- [x] Criar card visual de armazenamento na dashboard.
- [x] Refinar visualização dos logs de auditoria no admin.
- [x] Auditar backups automáticos JSON.
- [x] Implementar backup seguro/auditado do banco SQLite.
- [x] Incluir backups `.db` na listagem administrativa de backups.
- [x] Criar painel visual de Backups no admin.
- [x] Criar rota protegida de diagnóstico operacional.
- [x] Criar painel visual de Diagnóstico no admin.
- [x] Exportar diagnóstico operacional em `.txt`.
- [x] Validar deploy em produção/VM após merge.
- [x] Gerar primeiro backup SQLite no ambiente real da VM.
- [x] Revalidar diagnóstico operacional em produção.
- [x] Adicionar dicas nativas/hover nos principais controles do painel administrativo.
- [x] Padronizar estratégia de ajuda contextual, usando `title` nativo em microcontroles e ícone de ajuda apenas em seções principais.

### Status

Concluído.

---

## 5. Implantação assistida dos pontos de exibição — concluída/documentada

### Objetivo

Padronizar o processo de instalação e configuração dos computadores conectados às TVs.

### Itens concluídos/documentados

- [x] Documentar configuração inicial do mini PC.
- [x] Documentar criação de conta local do Windows.
- [x] Documentar login automático.
- [x] Documentar atalho do Chrome em modo quiosque.
- [x] Documentar configuração de áudio automático.
- [x] Documentar configuração do AnyDesk.
- [x] Documentar acesso remoto não supervisionado.
- [x] Documentar configurações de energia.
- [x] Documentar BIOS para ligar após queda de energia.
- [x] Criar guia/checklist de preparação do PC da TV.
- [x] Criar documento/guia de configuração do mini PC do Painel Ribas.

### Itens que podem ser refinados depois, sem travar Fase 3

- [ ] Criar ficha técnica individual por ponto instalado, se a Prefeitura desejar controle formal por local.
- [ ] Documentar medições reais de resolução/escala por TV instalada, se necessário.
- [ ] Documentar teste de saída de áudio HDMI por ponto instalado, se necessário.

### Status

Suficiente para fechamento da Fase 3.

## Implantação automatizada dos pontos de TV — concluída operacionalmente

### Objetivo

Evoluir a preparação dos computadores conectados às TVs de um processo manual assistido para um processo semi-automatizado, reduzindo o tempo de configuração, diminuindo risco de esquecimento de etapas e padronizando a instalação dos pontos de exibição.

A proposta é criar um **Kit Ponto TV** contendo scripts, configurações e verificações para preparar o Windows, iniciar o Player Agent local, configurar o Chrome em modo quiosque e validar o funcionamento básico do ponto.

### Direção técnica

O Kit Ponto TV deve automatizar, sempre que possível:

- verificação de permissões administrativas;
- criação/validação de estrutura local do Painel Ribas;
- instalação/validação do Player Agent local;
- criação de tarefa agendada para iniciar o Player Agent com o Windows;
- validação do endpoint local `http://localhost:3579/health`;
- configuração de energia para evitar suspensão/hibernação;
- criação de atalho ou tarefa para Chrome em modo quiosque;
- abertura automática do player;
- geração de relatório local de preparação;
- checklist final de validação do ponto.

### Itens que permanecem manuais ou assistidos

Algumas etapas não devem ser automatizadas completamente por segurança ou por dependerem do equipamento:

- configuração da BIOS para ligar após queda de energia;
- ajuste de BIOS para não travar sem teclado/mouse, quando existir;
- instalação ou configuração final de senha do AnyDesk;
- definição de senha da conta local do Windows;
- conexão física HDMI/energia/rede;
- validação visual e sonora na TV definitiva;
- registro de senhas apenas em controle interno restrito da TI.

### Itens planejados

- [ ] Criar estrutura `ponto-tv/` para scripts de preparação do ponto.
- [ ] Criar arquivo de configuração do Kit Ponto TV.
- [ ] Criar script PowerShell em modo diagnóstico/simulação.
- [ ] Gerar relatório local de preparação.
- [ ] Automatizar configurações de energia do Windows.
- [ ] Automatizar criação do modo quiosque do Chrome.
- [ ] Integrar instalação/validação do Player Agent local.
- [ ] Integrar teste do endpoint `http://localhost:3579/health`.
- [ ] Criar checklist final automatizado de validação.
- [ ] Documentar o uso do Kit Ponto TV no guia de preparação.

### Status

Concluído operacionalmente para a Fase 3.

O Kit Ponto TV foi validado com:

- preparação do Windows;
- instalação em PC formatado;
- reinstalação por cima;
- limpeza de tarefas antigas;
- Player Agent local;
- playlist local;
- cache local de mídias;
- Chrome em modo quiosque;
- launcher anti-duplicidade;
- relatório final inteligente.

Pendência futura não bloqueante:

- aplicar avatar/imagem de perfil institucional no usuário local `Painel`.

---

## 6. Diagnóstico de rede e travamentos — documentação operacional

### Objetivo

Evitar que problemas de rede local sejam confundidos com falha do sistema.

### Contexto

Durante testes reais, foi observado que a qualidade da internet/rede local influencia diretamente a fluidez do player, especialmente em vídeos maiores.

Em teste real, o player rodou corretamente no 4G, enquanto a rede local apresentou travamentos até em serviços simples, indicando gargalo de conexão.

### Itens essenciais para fechamento

- [x] Registrar em documentação que a qualidade da rede influencia o player.
- [x] Documentar recomendação de conexão estável, preferencialmente cabeada.
- [x] Documentar que vídeos grandes dependem de boa conexão.
- [ ] Revisar se essa orientação já aparece nos documentos operacionais finais.
- [ ] Complementar o manual, se necessário, com seção curta de problemas comuns.

### Itens futuros

- [ ] Criar diagnóstico automático de rede no admin.
- [ ] Criar alerta interno indicando possível instabilidade de rede.
- [ ] Registrar falhas de rede no backend.
- [ ] Criar teste automático de download/latência.

### Status

Não deve travar a Fase 3 se a recomendação operacional já estiver documentada.

---

## 7. Otimização de vídeos — orientação operacional

### Objetivo

Reduzir travamentos causados por vídeos muito pesados ou exportados em formato inadequado.

### Padrão recomendado

- Formato: MP4.
- Codec de vídeo: H.264.
- Codec de áudio: AAC.
- Resolução recomendada: 1920x1080.
- FPS recomendado: 30.
- Tamanho ideal: manter vídeos o mais otimizados possível.

### Itens essenciais para fechamento

- [ ] Criar ou revisar guia curto de exportação de vídeos.
- [ ] Documentar formato recomendado: MP4, H.264, AAC, 1080p, 30fps.
- [ ] Definir recomendação prática de tamanho/peso por vídeo.
- [ ] Documentar que vídeos grandes podem exigir rede melhor.

### Itens futuros

- [ ] Alertar automaticamente quando o vídeo for muito pesado.
- [ ] Alertar automaticamente quando o formato não for ideal.
- [ ] Avaliar compressão manual orientada.
- [ ] Avaliar compressão automática futura.

### Status

Importante, mas preferencialmente tratado como documentação simples, não como nova grande funcionalidade.

---

## 8. Melhorias no player — implementado / em validação prolongada

### Objetivo

Tornar o player mais resiliente em uso contínuo, evitando tela preta, splash presa ou travamentos silenciosos em operação real.

### Itens implementados

- [x] Exibir fallback visual quando não houver playlist.
- [x] Exibir fallback visual quando não houver mídia válida.
- [x] Exibir fallback visual quando uma mídia falhar.
- [x] Tratar falha de vídeo, imagem indisponível e erro de reprodução.
- [x] Criar tentativa automática de recarregar conteúdo após falha operacional.
- [x] Criar indicador visual de conexão/fallback.
- [x] Manter última playlist válida no `localStorage`.
- [x] Registrar eventos recentes do player no `localStorage`.
- [x] Exibir eventos persistidos no modo `?debug=1`.
- [x] Criar watchdog operacional do player.
- [x] Detectar vídeo sem progresso, vídeo pausado indevidamente, transição presa, imagem sem timer e ausência de atividade geral.
- [x] Recarregar automaticamente a página quando o player entrar em estado travado.
- [x] Limitar quantidade de reloads automáticos para evitar loop infinito.
- [x] Validar localmente o registro persistente de eventos.
- [x] Publicar atualização em produção/VM e validar HTTP 200.

### Em validação

- [ ] Manter o PAINEL-TV-02 rodando por 24h ou mais sem intervenção manual.
- [ ] Verificar se o watchdog recupera automaticamente eventual travamento.
- [ ] Consultar `?debug=1` em caso de falha para analisar os eventos persistidos.
- [ ] Confirmar ausência de erro crítico no console após teste prolongado.

### Status

```
Implementado e publicado. Em validação prolongada no PAINEL-TV-02.
```

---

## 9. Cache/offline do player — reclassificado

### Objetivo

Permitir que o player continue exibindo conteúdo em caso de instabilidade ou queda da rede.

### Decisão atual

O cache/offline básico por Service Worker e navegador foi avaliado, mas o caminho mais robusto e estratégico para a Fase 3 será o Fallback Local do Player com agente local em Node.js nos PCs das TVs.

### Status

Reclassificado para a cereja do bolo da Fase 3.

---

## 10. Cereja do bolo da Fase 3 — Fallback Local do Player com agente Node.js

### Objetivo

Criar uma camada local de sobrevivência para os players das TVs, permitindo que continuem exibindo conteúdo mesmo quando a rede local ou o acesso ao servidor principal ficar instável.

### Conceito

O servidor principal continua sendo a fonte oficial da playlist e das mídias.

Nos PCs das TVs, um pequeno agente local em Node.js roda em segundo plano e mantém uma cópia local da playlist e das mídias necessárias.

Quando o servidor principal estiver acessível, o player usa o fluxo normal.

Quando houver falha de rede, o player tenta usar o conteúdo local/cacheado servido por `localhost`.

### Itens implementados

- [x] Criar agente local Node.js para rodar no PC da TV.
- [x] Criar configuração local do agente em `config.agent.json`.
- [x] Criar pasta local de cache do player.
- [x] Sincronizar `playlist.json` do servidor principal para o PC local.
- [x] Baixar mídias referenciadas pela playlist para o cache local.
- [x] Evitar baixar novamente arquivos já existentes.
- [x] Servir playlist e mídias locais via `localhost`.
- [x] Integrar o player com o agente local.
- [x] Permitir fallback para o agente local quando o servidor principal falhar.
- [x] Manter fallback adicional por `localStorage` quando agente e servidor estiverem indisponíveis.
- [x] Criar logs locais simples do agente.
- [x] Criar scripts de preparação do ponto de TV.
- [x] Criar pacote `PainelRibas-PontoTV.zip`.
- [x] Criar `instalacao-kit-painel.bat` para instalação assistida em Windows limpo.
- [x] Adicionar assets essenciais ao pacote sem copiar a pasta `assets` inteira.
- [x] Configurar política do Chrome para tentativa de evitar prompt de acesso local.
- [x] Configurar fuso horário do Windows para `Central Brazilian Standard Time`.
- [x] Configurar wallpaper institucional no ponto de TV.
- [x] Preparar instalação automática do AnyDesk via `winget` e fallback por instalador oficial.
- [x] Validar instalação e funcionamento inicial no PAINEL-TV-02.

### Validação operacional concluída

- [x] Testar o kit completo após formatação limpa do ponto de TV.
- [x] Validar se o `instalacao-kit-painel.bat` executa o fluxo inteiro.
- [x] Validar instalação automática do AnyDesk em Windows limpo.
- [x] Validar política do Chrome contra pop-up de acesso local.
- [x] Validar funcionamento do player após reboot completo.
- [x] Validar limpeza/reinstalação por cima.
- [x] Validar recriação das tarefas agendadas do Player Agent e Chrome Quiosque.
- [x] Validar endpoint local `http://localhost:3579/health`.
- [x] Validar playlist local `http://localhost:3579/playlist.json`.
- [x] Validar cache local de mídias.
- [x] Testar queda e retorno de rede de forma controlada.

### Fora do escopo inicial

- [ ] Painel central de status das TVs.
- [ ] Autoatualização do agente.
- [ ] Métricas avançadas.
- [ ] Sincronização bidirecional.
- [ ] Controle remoto das TVs.
- [ ] Multiempresa.

### Status

```
Concluído operacionalmente para a Fase 3.
```

---

## 11. Limpeza de arquivos temporários — concluída

### Itens concluídos

- [x] Revisar funcionamento da pasta `data/upload-chunks/`.
- [x] Criar rotina para limpar chunks antigos.
- [x] Definir tempo máximo de retenção de chunks incompletos.
- [x] Registrar limpeza em log/auditoria.
- [x] Evitar remoção de arquivos ainda em upload.
- [x] Documentar política de limpeza.
- [x] Remover chunks temporários após cancelamento manual de upload.

### Itens futuros

- [ ] Criar função administrativa manual de limpeza segura, se necessário.

### Status

Concluído para Fase 3.

---

## 12. Validação de espaço em disco — concluída

### Itens concluídos

- [x] Exibir espaço total usado pela pasta `midia/`.
- [x] Exibir tamanho total da biblioteca.
- [x] Alertar quando o espaço livre estiver baixo.
- [x] Bloquear upload se não houver espaço suficiente.
- [x] Registrar falha por espaço insuficiente.
- [x] Criar indicador visual na dashboard.
- [x] Configurar limite operacional da pasta de mídias.
- [x] Configurar reserva mínima de disco livre.
- [x] Refinar mensagens preventivas principais para o operador.

### Itens futuros

- [ ] Avaliar alerta visual persistente quando armazenamento estiver em aviso/crítico.

### Status

Concluído para Fase 3.

---

## 13. Backups — quase concluído

### Objetivo

Aumentar a segurança operacional dos dados e configurações.

### Itens concluídos

- [x] Revisar rotina atual de backups.
- [x] Garantir backup de `midia-config.json`.
- [x] Garantir backup de `playlist.json`.
- [x] Garantir backup do banco SQLite.
- [x] Criar tela/listagem de backups.
- [x] Registrar criação de backup em log/auditoria.
- [x] Definir política de retenção por tipo.
- [x] Exibir backups JSON e SQLite no painel admin.
- [x] Criar botão para backup manual do banco SQLite.

### Item reclassificado para Fase 3.5

- [ ] Criar opção para baixar backup pela dashboard.

### Decisão

O download de backups pela dashboard foi reclassificado para Fase 3.5.

Na Fase 3, o sistema já conta com backups automáticos JSON, backup manual/auditado do banco SQLite, listagem administrativa de backups e auditoria dos eventos relacionados.

A ausência do botão de download pela interface não bloqueia a operação inicial, pois o acesso direto à VM permanece restrito à TI e pode ser usado em caso de necessidade administrativa.

### Status

Suficiente para fechamento da Fase 3, com melhoria reclassificada para Fase 3.5.

---

## 14. Logs e auditoria — suficiente para Fase 3

### Itens concluídos

- [x] Revisar eventos já registrados.
- [x] Refinar visualização dos logs no admin.
- [x] Criar títulos amigáveis para eventos técnicos.
- [x] Criar resumos humanos para logs.
- [x] Criar detalhes técnicos expansíveis.
- [x] Registrar falhas relevantes de upload por armazenamento.
- [x] Registrar backup automático JSON.
- [x] Registrar backup manual do banco SQLite.
- [x] Registrar limpeza automática de chunks.
- [x] Registrar uploads bloqueados por segurança.
- [x] Registrar uploads cancelados pelo usuário.
- [x] Registrar eventos de sessão.
- [x] Registrar eventos de recuperação de senha.

### Itens futuros

- [ ] Registrar geração de playlist de forma mais explícita, se necessário.
- [ ] Registrar alteração de período.
- [ ] Registrar alteração de prioridade.
- [ ] Registrar alteração de recorrência.
- [ ] Registrar ativação/inativação automática.
- [ ] Melhorar filtros da tela de logs.
- [ ] Criar exportação de logs.
- [ ] Avaliar logs técnicos separados dos logs administrativos.

### Status

Suficiente para fechamento da Fase 3.

---

## 15. Diagnóstico operacional — concluído para Fase 3

### Itens concluídos

- [x] Criar rota protegida `/api/admin/diagnostico`.
- [x] Verificar pastas principais.
- [x] Verificar arquivos essenciais.
- [x] Verificar banco SQLite.
- [x] Verificar armazenamento.
- [x] Verificar backups.
- [x] Verificar resumo de mídias.
- [x] Criar painel visual de Diagnóstico no admin.
- [x] Exibir avisos detalhados.
- [x] Validar diagnóstico na VM.
- [x] Exportar diagnóstico operacional em `.txt`.
- [x] Manter função interna de cópia do diagnóstico, com botão ocultado/comentado para reduzir poluição visual.

### Itens futuros

- [ ] Criar modal detalhado para diagnóstico operacional completo, se necessário.
- [ ] Melhorar responsividade mobile do card de diagnóstico.
- [ ] Criar indicadores adicionais de ambiente/versão, se necessário.

### Status

Concluído para Fase 3.

---

## 16. Segurança — quase concluída

### Itens concluídos

- [x] Revisar variáveis sensíveis no `.env`.
- [x] Garantir que senhas não fiquem hardcoded.
- [x] Revisar permissões por perfil no backend para áreas críticas.
- [x] Proteger backups e diagnóstico para superadmin.
- [x] Validar extensão dos arquivos enviados.
- [x] Limitar tamanho máximo de upload.
- [x] Bloquear uploads que ameacem armazenamento.
- [x] Implementar logout automático por inatividade.
- [x] Implementar controle de sessões simultâneas por usuário.
- [x] Revogar sessão antiga ao realizar novo login com o mesmo usuário.
- [x] Criar painel administrativo de sessões ativas para superadmin.
- [x] Permitir revogação manual de sessões pelo superadmin.
- [x] Detectar sessão revogada automaticamente via verificação periódica no admin.
- [x] Corrigir rota duplicada de status de autenticação.
- [x] Implementar recuperação de senha por e-mail.
- [x] Criar tela visual de solicitação de recuperação de senha.
- [x] Criar tela visual de redefinição de senha por token.
- [x] Validar token de recuperação antes de liberar formulário.
- [x] Bloquear formulário quando token for ausente, expirado, inválido ou já utilizado.
- [x] Remover token da URL após redefinição bem-sucedida.
- [x] Revogar sessões abertas do usuário após redefinição de senha.
- [x] Criar limpeza automática de tokens antigos de recuperação de senha.
- [x] Registrar auditoria visual das ações de recuperação de senha.
- [x] Criar rota administrativa de teste de envio SMTP.
- [x] Testar envio SMTP com conta Gmail em ambiente local.
- [x] Ajustar recuperação de senha para orientar uso do e-mail cadastrado.
- [x] Validar MIME type dos arquivos enviados.
- [x] Bloquear arquivos potencialmente perigosos.
- [x] Validar assinatura básica/magic bytes dos arquivos enviados.
- [x] Bloquear arquivos renomeados indevidamente, como script/texto fingindo ser imagem ou vídeo.
- [x] Auditar uploads bloqueados por tipo inválido, MIME incompatível ou assinatura inválida.

### Pendência externa

- [ ] Configurar SMTP institucional definitivo com conta exclusiva do Painel TV.
- [ ] Validar envio real com `painel-tv@ribasdoriopardo.ms.gov.br`.

### Observação

A pendência de SMTP institucional depende de configuração/validação externa do ambiente de e-mail institucional e não deve travar o fechamento técnico da Fase 3.

### Itens futuros / não prioritários agora

- [ ] Revisar proteções de rotas administrativas restantes, se necessário.
- [ ] Avaliar confirmação de e-mail de usuário antes de liberar login.
- [ ] Avaliar política futura de múltiplas sessões permitidas por usuário.
- [ ] Criar fluxo de confirmação de e-mail para novos usuários.
- [ ] Permitir reenvio de confirmação de e-mail pelo superadmin.
- [ ] Exibir badge de e-mail verificado/pendente na lista de usuários.
- [ ] Exigir confirmação de e-mail antes de liberar login, se a regra for adotada futuramente.

### Status

Concluído para Fase 3, com pendência externa de SMTP institucional.

---

## 17. Melhorias no upload — concluídas para Fase 3

### Itens concluídos

- [x] Upload em partes/chunks.
- [x] Progresso básico do upload.
- [x] Tratamento de queda de conexão durante upload.
- [x] Mensagem amigável em bloqueio por armazenamento.
- [x] Auditoria de upload bloqueado.
- [x] Melhorar mensagens de erro do upload.
- [x] Permitir cancelamento manual de upload em andamento.
- [x] Remover chunks temporários após cancelamento manual.
- [x] Auditar uploads cancelados pelo usuário.
- [x] Mostrar progresso mais detalhado.
- [x] Tratar cancelamento manual de upload.
- [x] Melhorar mensagem de erro em upload falho.

### Itens futuros

- [ ] Mostrar tamanho enviado e tamanho total.
- [ ] Mostrar velocidade estimada de upload.
- [ ] Alertar sobre formato não recomendado.
- [ ] Alertar sobre arquivo muito pesado.
- [ ] Avaliar drag and drop em tela inteira.
- [ ] Permitir soltar arquivos em qualquer ponto da tela quando upload estiver ativo.

### Status

Concluído para Fase 3.

---

## 18. Melhorias de usabilidade e experiência do operador — concluídas para Fase 3

### Itens concluídos

- [x] Criar sistema de tooltips/ajuda contextual no admin.
- [x] Adicionar textos explicativos para prioridade.
- [x] Adicionar textos explicativos para recorrência.
- [x] Adicionar textos explicativos para período de exibição.
- [x] Adicionar textos explicativos para tempo indeterminado.
- [x] Adicionar textos explicativos para ativo/inativo.
- [x] Adicionar textos explicativos para armazenamento.
- [x] Adicionar textos explicativos para backups.
- [x] Adicionar textos explicativos para diagnóstico.
- [x] Implementar primeira proteção contra cache antigo nos assets do admin usando headers anti-cache para HTML/CSS/JS.

### Itens futuros

- [ ] Avaliar futuramente versionamento por `APP_VERSION` ou hash de commit para cache busting mais controlado.
- [ ] Evoluir futuramente os ícones de ajuda das seções para abrir modais explicativos ou vídeos tutoriais.
- [ ] Criar textos tutoriais mais completos por seção do painel.
- [ ] Avaliar criação de uma central de ajuda interna no admin.

### Status

Concluído para Fase 3.

---

## 19. Melhorias na geração da playlist — concluídas para Fase 3

### Itens concluídos

- [x] Melhorar algoritmo de recorrência da playlist para evitar que uma mídia repetida apareça muito próxima da sua posição original.
- [x] Criar regra de distância mínima entre aparições da mesma mídia.
- [x] Evitar repetições coladas no início/fim do ciclo da playlist.
- [x] Considerar o loop da playlist na contagem de recorrência.
- [x] Testar cenários com poucas mídias e mídias configuradas como alta/urgente.

### Itens futuros

- [ ] Avaliar interface para explicar melhor como a recorrência funciona.
- [ ] Avaliar prévia da playlist gerada no admin.
- [ ] Avaliar alerta quando muitas mídias tiverem recorrência ativa.
- [ ] Avaliar pesos mais inteligentes para alta/urgente no futuro.

### Status

Concluído para Fase 3.

---

## 20. Responsividade e experiência mobile — reclassificado

### Objetivo

Melhorar a experiência da dashboard em telas menores.

### Decisão

A responsividade completa do admin em mobile não deve travar o fechamento da Fase 3.

O uso principal do painel administrativo será em desktop/notebook. Melhorias mobile podem continuar no backlog futuro.

### Itens futuros

- [ ] Refinar modal de detalhes no mobile.
- [ ] Refinar modal de período no mobile.
- [ ] Revisar modais em telas pequenas.
- [ ] Revisar popovers restantes próximos às bordas.
- [ ] Revisar cards de mídia em telas estreitas.
- [ ] Melhorar filtros em mobile.
- [ ] Melhorar responsividade dos cards de Backups e Diagnóstico.
- [ ] Avaliar experiência em tablet.
- [ ] Avaliar experiência em notebook pequeno.

### Status

Não bloqueia Fase 3.

---

## 21. Font Awesome local — reclassificado

### Objetivo

Remover dependência externa de CDN para os ícones.

### Decisão

É uma melhoria válida, mas não deve travar o fechamento da Fase 3.

### Itens futuros

- [ ] Baixar Font Awesome localmente.
- [ ] Criar pasta `assets/vendor/fontawesome/`.
- [ ] Ajustar referências nos HTMLs.
- [ ] Testar dashboard.
- [ ] Testar login.
- [ ] Testar player.
- [ ] Remover dependência externa do CDN.
- [ ] Documentar decisão técnica.

### Status

Futuro.

---

## 22. Detalhes da mídia — reclassificado

### Objetivo

Melhorar clareza do modal de detalhes.

### Decisão

É melhoria útil, mas não bloqueia a Fase 3.

### Itens futuros

- [ ] Revisar exibição de período.
- [ ] Evitar redundância entre datas agrupadas e separadas.
- [ ] Melhorar bloco de status operacional.
- [ ] Exibir claramente se está livre, agendada, vencida ou ativa.
- [ ] Exibir tamanho do arquivo.
- [ ] Exibir duração do vídeo.
- [ ] Exibir data de cadastro, se disponível.
- [ ] Exibir última alteração, se disponível.

### Status

Futuro.

---

## 23. Organização técnica do código — reclassificado

### Objetivo

Preparar o sistema para manutenção de longo prazo.

### Decisão

Refatorações grandes não devem ser feitas no fechamento da Fase 3, pois aumentam risco de regressão.

### Itens futuros

#### CSS

- [ ] Refatorar `admin.css`.
- [ ] Agrupar estilos por componente.
- [ ] Remover duplicidades.
- [ ] Reduzir uso de `!important`.
- [ ] Padronizar espaçamentos.
- [ ] Padronizar botões.
- [ ] Padronizar cards.
- [ ] Padronizar modais.
- [ ] Separar estilos por área, se necessário.

#### JavaScript do admin

- [ ] Modularizar `admin.js`.
- [ ] Separar lógica de mídias.
- [ ] Separar lógica de usuários.
- [ ] Separar lógica de filtros.
- [ ] Separar lógica de upload.
- [ ] Separar lógica de logs.
- [ ] Separar lógica de backups.
- [ ] Separar lógica de diagnóstico.
- [ ] Separar lógica de modais.
- [ ] Separar helpers/utilitários.

#### Backend

- [ ] Avaliar separação do `server.js`.
- [ ] Criar pasta `routes/`.
- [ ] Criar pasta `services/`.
- [ ] Criar pasta `utils/`.
- [ ] Separar rotas de usuários.
- [ ] Separar rotas de mídias.
- [ ] Separar rotas de upload.
- [ ] Separar lógica de playlist.
- [ ] Separar lógica de auditoria.
- [ ] Separar lógica de backups.
- [ ] Separar lógica de diagnóstico.

### Status

Futuro.

---

# FASE 3 — PLANO FINAL DE FECHAMENTO

## 24. Pendências reais para fechar a Fase 3

### 1. Download seguro de backups pelo admin

- [ ] Criar rota protegida para download de backup.
- [ ] Permitir download apenas para superadmin.
- [ ] Impedir path traversal.
- [ ] Permitir download apenas de arquivos dentro da pasta `backups/`.
- [ ] Criar botão “Baixar” nos cards de backup.
- [ ] Auditar download de backup, se necessário.
- [ ] Testar download de backup JSON.
- [ ] Testar download de backup SQLite.

### 2. Fallback básico do player

- [ ] Mensagem amigável quando não houver playlist.
- [ ] Mensagem amigável quando não houver mídia válida.
- [ ] Fallback visual quando uma mídia falhar.
- [ ] Tratamento básico de vídeo indisponível.
- [ ] Tentativa automática simples de recarregar playlist.
- [ ] Mensagem básica de modo sem conexão.

### 3. Fallback Local do Player com agente Node.js

- [ ] Criar agente local Node.js.
- [ ] Criar pasta local de cache.
- [ ] Sincronizar playlist.
- [ ] Baixar mídias da playlist.
- [ ] Servir cache via `localhost`.
- [ ] Permitir fallback local quando servidor principal falhar.
- [ ] Criar logs locais simples.
- [ ] Documentar instalação no mini PC.
- [ ] Testar queda de rede.
- [ ] Testar retorno de rede.

### 4. Revisão final de documentação

- [ ] Atualizar `CHANGELOG.md`.
- [ ] Atualizar `GUIA_TESTES.md`.
- [ ] Atualizar documentação operacional da Fase 3.
- [ ] Registrar SMTP institucional como pendência externa, se ainda não resolvido.
- [ ] Registrar decisões técnicas finais da Fase 3.

### 5. Deploy e validação final

- [ ] Fazer deploy na VM/produção.
- [ ] Validar login.
- [ ] Validar upload.
- [ ] Validar biblioteca.
- [ ] Validar playlist.
- [ ] Validar player.
- [ ] Validar backups.
- [ ] Validar diagnóstico.
- [ ] Validar auditoria.
- [ ] Validar mini PC/TV.
- [ ] Confirmar ausência de erro vermelho no console.
- [ ] Confirmar ausência de erro no terminal/PM2.
- [ ] Commit e push finais.
- [ ] Marcar Fase 3 como concluída.

---

# FASE 4 — VERSÃO COMERCIAL / WHITELABEL

## 25. Separar versão institucional da versão comercial

### Objetivo

Permitir que o sistema seja adaptado para clientes externos sem ficar preso à identidade da Prefeitura.

### Itens

- [ ] Criar modo institucional Prefeitura.
- [ ] Criar modo comercial genérico.
- [ ] Separar assets institucionais dos assets do cliente.
- [ ] Remover textos fixos da Prefeitura na versão comercial.
- [ ] Criar nome comercial para o produto.
- [ ] Definir estrutura de configuração por cliente.

### Prioridade

Alta para versão comercial.

---

## 26. Whitelabel básico

### Objetivo

Permitir personalização com a marca do cliente.

### Itens

- [ ] Configurar nome do cliente.
- [ ] Configurar logo principal.
- [ ] Configurar favicon.
- [ ] Configurar wallpaper/splash.
- [ ] Configurar cores principais.
- [ ] Configurar subtítulo/slogan.
- [ ] Aplicar marca no player.
- [ ] Aplicar marca na dashboard.
- [ ] Aplicar marca no login.

### Prioridade

Altíssima para venda.

---

## 27. Tela de configuração da marca

### Objetivo

Permitir alterar a identidade visual sem editar código diretamente.

### Itens

- [ ] Criar menu “Identidade visual”.
- [ ] Campo para nome da empresa.
- [ ] Campo para slogan/subtítulo.
- [ ] Upload de logo.
- [ ] Upload de favicon.
- [ ] Upload de wallpaper.
- [ ] Seleção de cores.
- [ ] Preview do player.
- [ ] Preview da tela de login.
- [ ] Preview da dashboard.

### Prioridade

Alta.

---

## 28. Modelos de player

### Objetivo

Permitir estilos diferentes conforme o tipo de cliente.

### Ideias

- [ ] Modelo institucional.
- [ ] Modelo lanchonete/cardápio.
- [ ] Modelo barbearia.
- [ ] Modelo clínica/recepção.
- [ ] Modelo loja/varejo.
- [ ] Modelo mercado/promoções.
- [ ] Modelo academia.

### Prioridade

Média.

---

## 29. Templates de conteúdo

### Objetivo

Facilitar a criação de conteúdos para clientes que não possuem designer ou equipe de mídia.

### Ideias

- [ ] Template de promoção.
- [ ] Template de cardápio.
- [ ] Template de combo.
- [ ] Template de aviso.
- [ ] Template de horário de funcionamento.
- [ ] Template de redes sociais.
- [ ] Template com QR Code.
- [ ] Template de produto destaque.
- [ ] Template de antes/depois para barbearia.
- [ ] Template de campanha sazonal.

### Prioridade

Média/Alta para versão comercial.

---

## 30. Pacote de conteúdo opcional

### Objetivo

Separar o valor do sistema do valor de criação de conteúdo.

### Itens

- [ ] Definir conteúdo incluso na implantação.
- [ ] Definir conteúdo mensal opcional.
- [ ] Definir tabela de artes estáticas.
- [ ] Definir tabela de vídeos curtos.
- [ ] Definir limite mensal de alterações.
- [ ] Criar fluxo de solicitação de conteúdo.
- [ ] Criar política de prazo para criação de artes/vídeos.

### Prioridade

Alta para precificação.

---

## 31. Status das telas

### Objetivo

Permitir acompanhar se os players estão online.

### Itens

- [ ] Criar identificação por player.
- [ ] Criar rota de heartbeat.
- [ ] Registrar última comunicação do player.
- [ ] Mostrar status online/offline na dashboard.
- [ ] Mostrar última sincronização.
- [ ] Mostrar mídia atual.
- [ ] Mostrar versão do player.
- [ ] Alertar se uma tela ficar muito tempo offline.

### Prioridade

Alta para produto comercial maduro.

---

## 32. Playlists por unidade ou tela

### Objetivo

Permitir conteúdos diferentes para locais diferentes.

### Itens

- [ ] Criar cadastro de telas.
- [ ] Criar cadastro de unidades.
- [ ] Criar grupos de telas.
- [ ] Criar playlist por unidade.
- [ ] Criar playlist por tela.
- [ ] Criar mídia global.
- [ ] Criar mídia específica.
- [ ] Permitir publicar conteúdo em todas as telas.

### Prioridade

Média/Alta.

---

## 33. Modo comunicado urgente

### Objetivo

Permitir publicar uma mídia ou aviso urgente com prioridade máxima.

### Itens

- [ ] Criar recurso de comunicado urgente.
- [ ] Permitir publicar em todas as telas.
- [ ] Permitir definir tempo de exibição.
- [ ] Permitir encerrar comunicado.
- [ ] Registrar ação em log.
- [ ] Exibir status de comunicado ativo.

### Prioridade

Média.

---

## 34. Relatórios

### Objetivo

Gerar informações úteis para gestão e clientes.

### Itens

- [ ] Relatório de mídias cadastradas.
- [ ] Relatório de mídias ativas/inativas.
- [ ] Relatório de mídias vencidas/agendadas.
- [ ] Histórico de uploads.
- [ ] Histórico de alterações.
- [ ] Histórico de geração de playlist.
- [ ] Futuro: estimativa de exibições.
- [ ] Futuro: relatórios por tela/unidade.

### Prioridade

Média.

---

## 35. Manual do cliente

### Objetivo

Reduzir suporte repetitivo e facilitar adoção.

### Itens

- [ ] Como acessar o painel.
- [ ] Como enviar mídia.
- [ ] Como ativar/inativar.
- [ ] Como ordenar playlist.
- [ ] Como agendar período.
- [ ] Como usar prioridade.
- [ ] Como usar recorrência.
- [ ] Como excluir mídia.
- [ ] Como trocar senha.
- [ ] Formatos recomendados.
- [ ] O que fazer se o player travar.
- [ ] O que fazer se a TV estiver sem som.
- [ ] O que fazer se a internet estiver ruim.

### Prioridade

Alta.

---

## 36. Proposta comercial

### Objetivo

Preparar material para apresentar e vender o sistema.

### Itens

- [ ] Criar PDF de apresentação comercial.
- [ ] Criar proposta modelo.
- [ ] Criar tabela de planos.
- [ ] Definir o que está incluso na implantação.
- [ ] Definir o que está incluso na mensalidade.
- [ ] Definir o que é cobrado à parte.
- [ ] Definir política de suporte.
- [ ] Definir responsabilidade sobre hardware.
- [ ] Definir responsabilidade sobre internet do cliente.
- [ ] Criar contrato simples ou termo de prestação.
- [ ] Criar checklist pré-instalação.

### Prioridade

Alta antes da venda.

---

# 37. Sprints finais sugeridas

## Sprint final 3.1 — Backups operacionais

- [ ] Criar download seguro de backups pelo admin.
- [ ] Testar backup JSON.
- [ ] Testar backup SQLite.
- [ ] Auditar download, se necessário.
- [ ] Atualizar documentação.

---

## Sprint final 3.2 — Player resiliente

- [ ] Fallback visual quando não houver playlist.
- [ ] Fallback visual quando não houver mídia válida.
- [ ] Tratamento de mídia indisponível.
- [ ] Tentativa simples de recarregar playlist.
- [ ] Mensagem de conexão instável/offline.

---

## Sprint final 3.3 — Cereja do bolo: agente local

- [ ] Criar agente local Node.js.
- [ ] Sincronizar playlist.
- [ ] Sincronizar mídias.
- [ ] Servir arquivos locais via `localhost`.
- [ ] Integrar fallback local ao player.
- [ ] Documentar instalação.
- [ ] Testar queda e retorno de rede.

---

## Sprint final 3.4 — Fechamento da Fase 3

- [ ] Atualizar documentação final.
- [ ] Validar local.
- [ ] Deploy na VM.
- [ ] Validar produção.
- [ ] Registrar pendência externa do SMTP institucional, se necessário.
- [ ] Marcar Fase 3 como concluída.

---

## Sprint 4.1 — Whitelabel básico

- [ ] Configurar nome do cliente.
- [ ] Configurar logo.
- [ ] Configurar favicon.
- [ ] Configurar wallpaper.
- [ ] Configurar cores.
- [ ] Aplicar marca no player, login e dashboard.

---

## Sprint 4.2 — Venda inicial

- [ ] Manual do cliente.
- [ ] Guia de implantação comercial.
- [ ] Proposta comercial.
- [ ] Pacotes e planos.
- [ ] Checklist de suporte.

---

# 38. Itens removidos da pressão da Fase 3

Estes itens continuam válidos, mas não devem impedir o fechamento da Fase 3:

- restauração manual de backup;
- filtros avançados na listagem de backups;
- exportação de logs;
- modal detalhado de diagnóstico;
- central de ajuda interna;
- preview da playlist gerada;
- Font Awesome local;
- refatoração grande de `admin.css`;
- modularização grande de `admin.js`;
- separação completa do `server.js`;
- melhorias completas de mobile;
- detalhes avançados da mídia;
- cache/offline avançado por Service Worker;
- status online/offline das telas;
- multiempresa;
- relatórios avançados;
- templates de conteúdo.

---

# Regra prática de fechamento da Fase 3

A Fase 3 pode ser considerada concluída quando:

- [x] download de backups estiver disponível ou formalmente reclassificado;
- [x] player tiver fallback básico para ausência/falha de conteúdo;
- [x] agente local/fallback local estiver implementado;
- [x] watchdog do player estiver implementado e publicado;
- [x] documentação essencial estiver atualizada;
- [x] deploy final estiver validado na VM;
- [ ] operação em TV/mini PC estiver validada após observação prolongada;
- [ ] kit de instalação estiver validado em Windows limpo;
- [ ] pendências externas, como SMTP institucional, estiverem documentadas;
- [ ] não houver erro vermelho crítico no console nos fluxos principais;
- [ ] não houver erro crítico no terminal/serviço Node;
- [ ] `git status` estiver limpo;
- [ ] commits e push finais tiverem sido realizados.

---

# 40. Observações estratégicas

A evolução comercial do sistema deve ocorrer sem comprometer a versão institucional da Prefeitura.

A versão atual do Painel Ribas deve continuar como base estável e documentada.

A versão comercial deve nascer após o fechamento da Fase 3 ou após uma versão 3.5 focada no agente local.

A meta não é transformar o sistema imediatamente em uma plataforma SaaS complexa.

A meta inicial deve ser criar um produto:

- estável;
- bonito;
- personalizável;
- fácil de instalar;
- fácil de explicar;
- fácil de manter;
- vendável para pequenos negócios locais.

---

# 41. Regra de ouro

Antes de transformar uma ideia em desenvolvimento, classificar:

1. É essencial para estabilidade?
2. É importante para uso real?
3. É importante para venda?
4. É apenas melhoria visual?
5. É ideia futura?

A partir deste ponto, qualquer item que não ajude a fechar a Fase 3 ou preparar diretamente a versão comercial deve ser mantido no backlog futuro, sem travar a entrega.

### Player Agent local / fallback local do quiosque — concluído

Status: concluído e validado em campo.

Resultado:

- Agent local instalado no PC da TV;
- servidor local ativo em `http://localhost:3579`;
- playlist local sincronizada dinamicamente;
- mídias da playlist baixadas para cache local;
- player capaz de usar cache local em caso de falha de rede;
- suporte a `HEAD` e `Range`/`206 Partial Content` no servidor local;
- teste offline real aprovado com execução completa dos 6 vídeos da playlist.
