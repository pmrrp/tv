# Backlog — Fase 3 e Fase 4 do Painel Ribas

## 1. Objetivo deste documento

Este documento organiza o backlog das próximas etapas do Painel Ribas após o fechamento funcional da Fase 2.

Ele serve para:

- registrar melhorias futuras;
- separar prioridades técnicas, operacionais e comerciais;
- orientar o desenvolvimento da Fase 3 e da Fase 4;
- evitar perda de ideias levantadas durante testes reais;
- apoiar a evolução do sistema para uso contínuo na Prefeitura;
- preparar uma possível versão comercial/whitelabel no futuro.

---

## 2. Estado atual do sistema

O Painel Ribas encontra-se com a Fase 2 funcionalmente consolidada e com o primeiro bloco da Fase 3 já implementado em produção/VM.

O sistema já possui:

- player institucional funcional;
- dashboard administrativa;
- login e controle de sessão;
- upload de imagens e vídeos;
- upload em partes/chunks;
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
- controle de armazenamento;
- bloqueio preventivo de uploads por limite operacional;
- limpeza automática de chunks antigos;
- deploy em VM;
- acesso via domínio;
- player com visual premium;
- modo quiosque com áudio em mini PC;
- documentação técnica e executiva inicial.

---

## 3. Direção geral das próximas fases

### Fase 3 — Robustez, operação real e manutenção

A Fase 3 prioriza a estabilidade do sistema em uso real.

O foco principal é garantir que o Painel Ribas funcione de forma previsível, fácil de manter, fácil de diagnosticar e seguro para operação contínua.

Temas principais:

- implantação assistida;
- operação em mini PCs;
- diagnóstico de rede;
- otimização de vídeos;
- limpeza de arquivos temporários;
- validação de espaço em disco;
- backups;
- logs;
- segurança;
- melhorias de upload;
- responsividade;
- usabilidade do operador;
- documentação operacional.

---

### Fase 4 — Produto comercial / whitelabel

A Fase 4 deve preparar o sistema para uma possível versão comercial ou personalizada para outros clientes.

O foco principal é transformar o sistema em um produto vendável, personalizável e replicável.

Temas principais:

- identidade visual por cliente;
- modo comercial sem identidade da Prefeitura;
- configuração de marca;
- templates de conteúdo;
- planos comerciais;
- suporte;
- múltiplas telas;
- status online/offline;
- relatórios;
- futura arquitetura multiempresa.

---

# FASE 3 — OPERAÇÃO REAL, ROBUSTEZ E MANUTENÇÃO

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
- [x] Validar deploy em produção/VM após merge.
- [x] Gerar primeiro backup SQLite no ambiente real da VM.
- [x] Revalidar diagnóstico operacional em produção.
- [x] Adicionar dicas nativas/hover nos principais controles do painel administrativo.
- [x] Padronizar estratégia de ajuda contextual, usando `title` nativo em microcontroles e ícone de ajuda apenas em seções principais.

### Observação

Este bloco já foi implementado, testado localmente, integrado na branch `fix-admin-funcionalidades`, publicado na VM e validado em produção.

---

## 5. Implantação assistida dos pontos de exibição

### Objetivo

Padronizar o processo de instalação e configuração dos computadores conectados às TVs.

### Itens

- [x] Documentar configuração inicial do mini PC.
- [x] Documentar criação de conta local do Windows.
- [x] Documentar login automático.
- [x] Documentar atalho do Chrome em modo quiosque.
- [x] Documentar configuração de áudio automático.
- [x] Documentar configuração do AnyDesk.
- [x] Documentar acesso remoto não supervisionado.
- [x] Documentar configurações de energia.
- [x] Documentar BIOS para ligar após queda de energia.
- [ ] Criar checklist oficial de implantação por ponto.
- [ ] Documentar teste de resolução e escala da TV.
- [ ] Documentar teste de saída de áudio HDMI.
- [ ] Criar ficha técnica por ponto instalado.

### Prioridade

Alta.

---

## 6. Diagnóstico de rede e travamentos

### Objetivo

Evitar que problemas de rede local sejam confundidos com falha do sistema.

### Contexto

Durante testes reais, foi observado que a qualidade da internet influencia diretamente a fluidez do player, especialmente em vídeos maiores.

Em um teste real, o player rodou corretamente no 4G, enquanto a rede local apresentou travamentos até em serviços simples, indicando gargalo de conexão.

### Itens

- [ ] Documentar recomendação de rede cabeada sempre que possível.
- [ ] Criar checklist de diagnóstico de travamentos.
- [ ] Orientar teste comparativo com 4G/5G.
- [ ] Orientar teste de download de arquivo pesado.
- [ ] Orientar verificação de estabilidade da rede local.
- [ ] Documentar que vídeos grandes dependem de boa conexão.
- [ ] Criar seção “Problemas comuns e possíveis causas” no manual.
- [ ] Criar mensagem interna indicando possível instabilidade de rede.

### Prioridade

Alta.

---

## 7. Otimização de vídeos

### Objetivo

Reduzir travamentos causados por vídeos muito pesados ou exportados em formato inadequado.

### Padrão recomendado inicial

- Formato: MP4.
- Codec de vídeo: H.264.
- Codec de áudio: AAC.
- Resolução recomendada: 1920x1080.
- FPS recomendado: 30.
- Tamanho ideal: manter vídeos o mais otimizados possível.

### Itens

- [ ] Criar guia de exportação de vídeos.
- [ ] Definir tamanho máximo recomendado por arquivo.
- [ ] Alertar quando o vídeo for muito pesado.
- [ ] Alertar quando o formato não for ideal.
- [ ] Avaliar compressão manual orientada.
- [ ] Avaliar compressão automática futura.
- [ ] Documentar boas práticas para vídeos institucionais.

### Prioridade

Alta.

---

## 8. Melhorias no player

### Objetivo

Tornar o player mais resiliente em uso contínuo.

### Itens

- [ ] Melhorar fallback visual quando uma mídia falhar.
- [ ] Exibir mensagem amigável quando não houver playlist.
- [ ] Exibir mensagem amigável quando não houver mídia válida.
- [ ] Melhorar tratamento de vídeo indisponível.
- [ ] Criar tentativa automática de recarregar a playlist.
- [ ] Criar reconexão automática em caso de falha temporária.
- [ ] Criar modo “sem conexão” informativo.
- [ ] Registrar falhas de reprodução no console/debug.
- [ ] Avaliar registro de falhas no backend.
- [ ] Avaliar cache local/offline.

### Prioridade

Média/Alta.

---

## 9. Cache/offline do player

### Objetivo

Permitir que o player continue exibindo o último conteúdo válido mesmo com instabilidade temporária de internet.

### Ideia inicial

O player poderia:

1. baixar a playlist;
2. guardar a última playlist válida;
3. tentar continuar exibindo mídias já carregadas;
4. informar quando estiver usando conteúdo salvo;
5. sincronizar novamente quando a conexão voltar.

### Itens

- [ ] Estudar uso de Service Worker.
- [ ] Avaliar cache de `playlist.json`.
- [ ] Avaliar cache de imagens.
- [ ] Avaliar cache de vídeos recentes.
- [ ] Evitar cache infinito ocupando disco.
- [ ] Criar política de limpeza de cache.
- [ ] Criar mensagem “usando conteúdo salvo”.
- [ ] Criar teste controlado de queda de conexão.

### Prioridade

Média.

---

## 10. Limpeza de arquivos temporários

### Objetivo

Evitar acúmulo de arquivos temporários, especialmente chunks de upload.

### Itens

- [x] Revisar funcionamento da pasta `data/upload-chunks/`.
- [x] Criar rotina para limpar chunks antigos.
- [x] Definir tempo máximo de retenção de chunks incompletos.
- [x] Registrar limpeza em log/auditoria.
- [x] Evitar remoção de arquivos ainda em upload.
- [x] Documentar política de limpeza.
- [ ] Criar função administrativa manual de limpeza segura, se necessário.

### Prioridade

Alta.

---

## 11. Validação de espaço em disco

### Objetivo

Evitar falhas causadas por falta de espaço no servidor/VM.

### Itens

- [x] Exibir espaço total usado pela pasta `midia/`.
- [x] Exibir tamanho total da biblioteca.
- [x] Alertar quando o espaço livre estiver baixo.
- [x] Bloquear upload se não houver espaço suficiente.
- [x] Registrar falha por espaço insuficiente.
- [x] Criar indicador visual na dashboard.
- [x] Configurar limite operacional da pasta de mídias.
- [x] Configurar reserva mínima de disco livre.
- [ ] Refinar mensagens preventivas para o operador, se necessário.
- [ ] Avaliar alerta visual persistente quando armazenamento estiver em aviso/crítico.

### Prioridade

Alta.

---

## 12. Backups

### Objetivo

Aumentar a segurança operacional dos dados e configurações.

### Itens

- [x] Revisar rotina atual de backups.
- [x] Garantir backup de `midia-config.json`.
- [x] Garantir backup de `playlist.json`.
- [x] Garantir backup do banco SQLite.
- [x] Criar tela/listagem de backups.
- [x] Registrar criação de backup em log/auditoria.
- [x] Definir política de retenção por tipo.
- [x] Exibir backups JSON e SQLite no painel admin.
- [x] Criar botão para backup manual do banco SQLite.
- [ ] Criar opção para baixar backup pela dashboard.
- [ ] Criar restauração manual controlada.
- [ ] Registrar restauração de backup em log.
- [ ] Criar filtros por tipo na listagem de backups.

### Prioridade

Alta.

---

## 13. Logs e auditoria

### Objetivo

Melhorar a rastreabilidade das ações administrativas.

### Itens

- [x] Revisar eventos já registrados.
- [x] Refinar visualização dos logs no admin.
- [x] Criar títulos amigáveis para eventos técnicos.
- [x] Criar resumos humanos para logs.
- [x] Criar detalhes técnicos expansíveis.
- [x] Registrar falhas relevantes de upload por armazenamento.
- [x] Registrar backup automático JSON.
- [x] Registrar backup manual do banco SQLite.
- [x] Registrar limpeza automática de chunks.
- [ ] Registrar geração de playlist de forma mais explícita, se necessário.
- [ ] Registrar alteração de período.
- [ ] Registrar alteração de prioridade.
- [ ] Registrar alteração de recorrência.
- [ ] Registrar ativação/inativação automática.
- [ ] Melhorar filtros da tela de logs.
- [ ] Criar exportação de logs.
- [ ] Avaliar logs técnicos separados dos logs administrativos.

### Prioridade

Média/Alta.

---

## 14. Diagnóstico operacional

### Objetivo

Permitir que o superadmin visualize rapidamente a saúde operacional do sistema.

### Itens

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
- [ ] Criar modal detalhado para diagnóstico operacional completo.
- [ ] Melhorar responsividade mobile do card de diagnóstico.
- [ ] Avaliar exportação ou cópia rápida do diagnóstico para suporte.

### Prioridade

Alta.

---

## 15. Segurança

### Objetivo

Reforçar proteções básicas antes de ampliar o uso do sistema.

### Itens

- [x] Revisar variáveis sensíveis no `.env`.
- [x] Garantir que senhas não fiquem hardcoded.
- [x] Revisar permissões por perfil no backend para áreas críticas.
- [x] Proteger backups e diagnóstico para superadmin.
- [x] Validar extensão dos arquivos enviados.
- [x] Limitar tamanho máximo de upload.
- [x] Bloquear uploads que ameacem armazenamento.
- [ ] Revisar timeout de sessão.
- [ ] Avaliar logout automático por inatividade.
- [ ] Avaliar limite de sessões simultâneas.
- [ ] Validar MIME type dos arquivos enviados.
- [ ] Bloquear arquivos potencialmente perigosos.
- [ ] Revisar proteções de rotas administrativas restantes.

### Prioridade

Alta.

---

## 16. Melhorias no upload

### Objetivo

Reduzir erro do usuário e melhorar feedback durante envio de arquivos.

### Itens

- [x] Upload em partes/chunks.
- [x] Progresso básico do upload.
- [x] Tratamento de queda de conexão durante upload.
- [x] Mensagem amigável em bloqueio por armazenamento.
- [x] Auditoria de upload bloqueado.
- [ ] Mostrar progresso mais detalhado.
- [ ] Mostrar tamanho enviado e tamanho total.
- [ ] Mostrar velocidade estimada de upload.
- [ ] Tratar cancelamento manual de upload.
- [ ] Alertar sobre formato não recomendado.
- [ ] Alertar sobre arquivo muito pesado.
- [ ] Melhorar mensagem de erro em upload falho.
- [ ] Avaliar drag and drop em tela inteira.
- [ ] Permitir soltar arquivos em qualquer ponto da tela quando upload estiver ativo.

### Prioridade

Média.

---

## 17. Melhorias de usabilidade e experiência do operador

### Objetivo

Reduzir dúvidas do usuário e tornar o painel mais autoexplicativo.

### Itens

- [x] Criar sistema de tooltips/ajuda contextual no admin.
- [x] Adicionar textos explicativos para prioridade.
- [x] Adicionar textos explicativos para recorrência.
- [x] Adicionar textos explicativos para período de exibição.
- [x] Adicionar textos explicativos para tempo indeterminado.
- [x] Adicionar textos explicativos para ativo/inativo.
- [x] Adicionar textos explicativos para armazenamento.
- [x] Adicionar textos explicativos para backups.
- [x] Adicionar textos explicativos para diagnóstico.
- [ ] Evoluir futuramente os ícones de ajuda das seções para abrir modais explicativos ou vídeos tutoriais.
- [ ] Criar textos tutoriais mais completos por seção do painel.
- [ ] Avaliar criação de uma central de ajuda interna no admin.

### Prioridade

Média/Alta.

---

## 18. Melhorias na geração da playlist

### Objetivo

Tornar a distribuição das mídias mais agradável e evitar repetições visualmente incômodas.

### Itens

- [x] Melhorar algoritmo de recorrência da playlist para evitar que uma mídia repetida apareça muito próxima da sua posição original.
- [x] Criar regra de distância mínima entre aparições da mesma mídia.
- [x] Evitar repetições coladas no início/fim do ciclo da playlist.
- [x] Considerar o loop da playlist na contagem de recorrência.
- [x] Testar cenários com poucas mídias e mídias configuradas como alta/urgente.
- [ ] Avaliar interface para explicar melhor como a recorrência funciona.
- [ ] Avaliar prévia da playlist gerada no admin.
- [ ] Avaliar alerta quando muitas mídias tiverem recorrência ativa.
- [ ] Avaliar pesos mais inteligentes para alta/urgente no futuro.

### Prioridade

Alta.

---

## 19. Responsividade e experiência mobile

### Objetivo

Melhorar a experiência da dashboard em telas menores.

### Itens

- [ ] Refinar modal de detalhes no mobile.
- [ ] Refinar modal de período no mobile.
- [ ] Revisar modais em telas pequenas.
- [ ] Revisar popovers restantes próximos às bordas.
- [ ] Revisar cards de mídia em telas estreitas.
- [ ] Melhorar filtros em mobile.
- [ ] Melhorar responsividade dos cards de Backups e Diagnóstico.
- [ ] Avaliar experiência em tablet.
- [ ] Avaliar experiência em notebook pequeno.

### Prioridade

Média.

---

## 20. Font Awesome local

### Objetivo

Remover dependência externa de CDN para os ícones.

### Itens

- [ ] Baixar Font Awesome localmente.
- [ ] Criar pasta `assets/vendor/fontawesome/`.
- [ ] Ajustar referências nos HTMLs.
- [ ] Testar dashboard.
- [ ] Testar login.
- [ ] Testar player.
- [ ] Remover dependência externa do CDN.
- [ ] Documentar decisão técnica.

### Prioridade

Média.

---

## 21. Detalhes da mídia

### Objetivo

Melhorar clareza do modal de detalhes.

### Itens

- [ ] Revisar exibição de período.
- [ ] Evitar redundância entre datas agrupadas e separadas.
- [ ] Melhorar bloco de status operacional.
- [ ] Exibir claramente se está livre, agendada, vencida ou ativa.
- [ ] Exibir tamanho do arquivo.
- [ ] Exibir duração do vídeo.
- [ ] Exibir data de cadastro, se disponível.
- [ ] Exibir última alteração, se disponível.

### Prioridade

Baixa/Média.

---

## 22. Organização técnica do código

### Objetivo

Preparar o sistema para manutenção de longo prazo.

### CSS

- [ ] Refatorar `admin.css`.
- [ ] Agrupar estilos por componente.
- [ ] Remover duplicidades.
- [ ] Reduzir uso de `!important`.
- [ ] Padronizar espaçamentos.
- [ ] Padronizar botões.
- [ ] Padronizar cards.
- [ ] Padronizar modais.
- [ ] Separar estilos por área, se necessário.

### JavaScript do admin

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

### Backend

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

### Prioridade

Média.

---

# FASE 4 — VERSÃO COMERCIAL / WHITELABEL

## 23. Separar versão institucional da versão comercial

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

## 24. Whitelabel básico

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

## 25. Tela de configuração da marca

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

## 26. Modelos de player

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

## 27. Templates de conteúdo

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

## 28. Pacote de conteúdo opcional

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

## 29. Multi-cliente / multiempresa

### Objetivo

Permitir atender múltiplos clientes com organização e segurança.

### Possíveis modelos

- Uma instalação separada por cliente.
- Uma instalação central com separação por cliente.
- Subdomínio por cliente.

### Itens

- [ ] Definir modelo inicial.
- [ ] Criar estrutura de cliente.
- [ ] Separar usuários por cliente.
- [ ] Separar mídias por cliente.
- [ ] Separar playlists por cliente.
- [ ] Separar configurações por cliente.
- [ ] Criar permissões por cliente.
- [ ] Avaliar domínio/subdomínio por cliente.

### Prioridade

Baixa no começo, alta para escala.

---

## 30. Status das telas

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

## 31. Playlists por unidade ou tela

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

## 32. Modo comunicado urgente

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

## 33. Relatórios

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

## 34. Manual do cliente

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

## 35. Proposta comercial

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

# 36. Priorização geral

## Fazer primeiro

- [x] Limpeza de chunks.
- [x] Validação de espaço em disco.
- [x] Backup melhorado.
- [x] Logs complementares.
- [x] Diagnóstico operacional.
- [x] Painel de backups.
- [x] Painel de diagnóstico.
- [x] Melhoria da recorrência da playlist.
- [ ] Checklist final de implantação por ponto.
- [ ] Diagnóstico de rede/travamentos documentado.
- [x] Tooltips/ajuda contextual.
- [ ] Manual de operação.
- [ ] Segurança de upload complementar.
- [ ] Whitelabel básico.
- [ ] Configuração de marca.

---

## Fazer depois

- [ ] Cache/offline avançado.
- [ ] Status online/offline das telas.
- [ ] Playlists por tela/unidade.
- [ ] Relatórios.
- [ ] Multiempresa.
- [ ] Templates de conteúdo.

---

## Ideias futuras

- [ ] Upload direto pelo celular.
- [ ] QR Code para redes sociais.
- [ ] Integração com Instagram.
- [ ] Templates automáticos de promoção.
- [ ] Agendamento por calendário visual.
- [ ] Alertas automáticos por e-mail/WhatsApp.
- [ ] Dashboard comercial com métricas.
- [ ] Tema claro/escuro no admin.
- [ ] Assistente de configuração inicial.

---

# 37. Sprints sugeridas

## Sprint 1 — Operação e robustez

Status: concluída em grande parte.

- [x] Limpeza de chunks.
- [x] Validação de espaço em disco.
- [x] Backup melhorado.
- [x] Logs complementares.
- [x] Diagnóstico operacional.
- [x] Painel de backups.
- [x] Painel de diagnóstico.
- [x] Recorrência inteligente da playlist.
- [ ] Diagnóstico de rede documentado.
- [ ] Checklist final de implantação por ponto.

---

## Sprint 2 — Usabilidade e operação assistida

- [x] Criar sistema de tooltips/ajuda contextual.
- [x] Melhorar textos explicativos da recorrência.
- [x] Melhorar orientações de armazenamento.
- [x] Melhorar orientações de backups e diagnóstico.
- [ ] Revisar manual administrativo.
- [ ] Revisar manual de operação dos pontos instalados.

---

## Sprint 3 — Segurança e manutenção

- [ ] Revisar upload.
- [ ] Validar extensão e MIME type.
- [ ] Limitar tamanho máximo, se necessário.
- [ ] Melhorar mensagens de erro.
- [ ] Font Awesome local.
- [ ] Avaliar timeout de sessão.
- [ ] Avaliar logout automático por inatividade.

---

## Sprint 4 — Whitelabel básico

- [ ] Configurar nome do cliente.
- [ ] Configurar logo.
- [ ] Configurar favicon.
- [ ] Configurar wallpaper.
- [ ] Configurar cores.
- [ ] Aplicar marca no player, login e dashboard.

---

## Sprint 5 — Documentação e venda

- [ ] Manual do cliente.
- [ ] Guia de implantação comercial.
- [ ] Proposta comercial.
- [ ] Pacotes e planos.
- [ ] Checklist de suporte.

---

## Sprint 6 — Escala

- [ ] Status das telas.
- [ ] Playlists por tela.
- [ ] Cache/offline.
- [ ] Multiempresa.
- [ ] Relatórios.

---

# 38. Observações estratégicas

A evolução comercial do sistema deve ocorrer sem comprometer a versão institucional da Prefeitura.

A versão atual do Painel Ribas deve continuar como base estável e documentada.

A versão comercial deve nascer somente após:

- estabilização operacional;
- definição de escopo;
- definição de responsabilidade sobre hardware;
- definição de suporte mensal;
- definição de criação de conteúdo;
- definição de limites técnicos;
- definição de política de implantação.

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

# 39. Regra de ouro

Antes de transformar uma ideia em desenvolvimento, classificar:

1. É essencial para estabilidade?
2. É importante para uso real?
3. É importante para venda?
4. É apenas melhoria visual?
5. É ideia futura?

Essa classificação deve orientar a prioridade real do backlog.