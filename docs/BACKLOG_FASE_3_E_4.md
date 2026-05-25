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

O Painel Ribas encontra-se com a Fase 2 funcionalmente consolidada.

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
- gerenciamento de usuários;
- perfis de acesso;
- logs de auditoria;
- backups automáticos;
- deploy em VM;
- acesso via domínio;
- player com visual premium;
- modo quiosque com áudio em mini PC;
- documentação técnica e executiva inicial.

---

## 3. Direção geral das próximas fases

## Fase 3 — Robustez, operação real e manutenção

A Fase 3 deve priorizar a estabilidade do sistema em uso real.

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
- documentação operacional.

---

## Fase 4 — Produto comercial / whitelabel

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

## 4. Implantação assistida dos pontos de exibição

### Objetivo

Padronizar o processo de instalação e configuração dos computadores conectados às TVs.

### Itens

- [ ] Criar checklist oficial de implantação por ponto.
- [ ] Documentar configuração inicial do mini PC.
- [ ] Documentar criação de conta local do Windows.
- [ ] Documentar login automático.
- [ ] Documentar atalho do Chrome em modo quiosque.
- [ ] Documentar configuração de áudio automático.
- [ ] Documentar configuração do AnyDesk.
- [ ] Documentar acesso remoto não supervisionado.
- [ ] Documentar configurações de energia.
- [ ] Documentar BIOS para ligar após queda de energia.
- [ ] Documentar teste de resolução e escala da TV.
- [ ] Documentar teste de saída de áudio HDMI.
- [ ] Criar ficha técnica por ponto instalado.

### Prioridade

Alta.

---

## 5. Diagnóstico de rede e travamentos

### Objetivo

Evitar que problemas de rede local sejam confundidos com falha do sistema.

### Contexto

Durante testes reais, foi observado que a qualidade da internet influencia diretamente a fluidez do player, especialmente em vídeos maiores. Em um teste, o painel rodou corretamente no 4G, enquanto a rede local apresentava lentidão até para baixar arquivos no WhatsApp.

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

## 6. Otimização de vídeos

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

## 7. Melhorias no player

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

## 8. Cache/offline do player

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

## 9. Limpeza de arquivos temporários

### Objetivo

Evitar acúmulo de arquivos temporários, especialmente chunks de upload.

### Itens

- [ ] Revisar funcionamento da pasta `data/upload-chunks/`.
- [ ] Criar rotina para limpar chunks antigos.
- [ ] Definir tempo máximo de retenção de chunks incompletos.
- [ ] Registrar limpeza em log.
- [ ] Criar função administrativa de limpeza segura.
- [ ] Evitar remoção de arquivos ainda em upload.
- [ ] Documentar política de limpeza.

### Prioridade

Alta.

---

## 10. Validação de espaço em disco

### Objetivo

Evitar falhas causadas por falta de espaço no servidor/VM.

### Itens

- [ ] Exibir espaço total usado pela pasta `midia/`.
- [ ] Exibir espaço disponível no disco.
- [ ] Exibir tamanho total da biblioteca.
- [ ] Alertar quando o espaço livre estiver baixo.
- [ ] Bloquear upload se não houver espaço suficiente.
- [ ] Registrar falha por espaço insuficiente.
- [ ] Criar indicador visual na dashboard.

### Prioridade

Alta.

---

## 11. Backups

### Objetivo

Aumentar a segurança operacional dos dados e configurações.

### Itens

- [ ] Revisar rotina atual de backups.
- [ ] Garantir backup de `midia-config.json`.
- [ ] Garantir backup de `playlist.json`.
- [ ] Garantir backup do banco SQLite.
- [ ] Criar opção para baixar backup pela dashboard.
- [ ] Criar tela/listagem de backups.
- [ ] Criar restauração manual controlada.
- [ ] Registrar criação de backup em log.
- [ ] Registrar restauração de backup em log.
- [ ] Definir política de retenção.

### Prioridade

Alta.

---

## 12. Logs e auditoria

### Objetivo

Melhorar a rastreabilidade das ações administrativas.

### Itens

- [ ] Revisar eventos já registrados.
- [ ] Registrar geração de playlist.
- [ ] Registrar alteração de período.
- [ ] Registrar alteração de prioridade.
- [ ] Registrar alteração de recorrência.
- [ ] Registrar ativação/inativação automática.
- [ ] Registrar falhas relevantes de upload.
- [ ] Melhorar filtros da tela de logs.
- [ ] Criar exportação de logs.
- [ ] Avaliar logs técnicos separados dos logs administrativos.

### Prioridade

Média/Alta.

---

## 13. Segurança

### Objetivo

Reforçar proteções básicas antes de ampliar o uso do sistema.

### Itens

- [ ] Revisar variáveis sensíveis no `.env`.
- [ ] Garantir que senhas não fiquem hardcoded.
- [ ] Revisar timeout de sessão.
- [ ] Avaliar logout automático por inatividade.
- [ ] Avaliar limite de sessões simultâneas.
- [ ] Validar extensão dos arquivos enviados.
- [ ] Validar MIME type dos arquivos enviados.
- [ ] Limitar tamanho máximo de upload.
- [ ] Bloquear arquivos potencialmente perigosos.
- [ ] Revisar permissões por perfil no backend.
- [ ] Revisar proteções de rotas administrativas.

### Prioridade

Alta.

---

## 14. Melhorias no upload

### Objetivo

Reduzir erro do usuário e melhorar feedback durante envio de arquivos.

### Itens

- [ ] Mostrar progresso mais detalhado.
- [ ] Mostrar tamanho enviado e tamanho total.
- [ ] Mostrar velocidade estimada de upload.
- [ ] Tratar queda de conexão durante upload.
- [ ] Tratar cancelamento de upload.
- [ ] Alertar sobre formato não recomendado.
- [ ] Alertar sobre arquivo muito pesado.
- [ ] Melhorar mensagem de erro em upload falho.
- [ ] Avaliar drag and drop em tela inteira.
- [ ] Permitir soltar arquivos em qualquer ponto da tela quando upload estiver ativo.

### Prioridade

Média.

---

## 15. Responsividade e experiência mobile

### Objetivo

Melhorar a experiência da dashboard em telas menores.

### Itens

- [ ] Refinar modal de detalhes no mobile.
- [ ] Refinar modal de período no mobile.
- [ ] Revisar modais em telas pequenas.
- [ ] Revisar popovers restantes próximos às bordas.
- [ ] Revisar cards de mídia em telas estreitas.
- [ ] Melhorar filtros em mobile.
- [ ] Avaliar experiência em tablet.
- [ ] Avaliar experiência em notebook pequeno.

### Prioridade

Média.

---

## 16. Font Awesome local

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

## 17. Detalhes da mídia

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

## 18. Organização técnica do código

### Objetivo

Preparar o sistema para manutenção de longo prazo.

### Itens

#### CSS

- [ ] Refatorar `admin.css`.
- [ ] Agrupar estilos por componente.
- [ ] Remover duplicidades.
- [ ] Reduzir uso de `!important`.
- [ ] Padronizar espaçamentos.
- [ ] Padronizar botões.
- [ ] Padronizar modais.
- [ ] Separar estilos por área, se necessário.

#### JavaScript do admin

- [ ] Modularizar `admin.js`.
- [ ] Separar lógica de mídias.
- [ ] Separar lógica de usuários.
- [ ] Separar lógica de filtros.
- [ ] Separar lógica de upload.
- [ ] Separar lógica de logs.
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

### Prioridade

Média.

---

# FASE 4 — VERSÃO COMERCIAL / WHITELABEL

## 19. Separar versão institucional da versão comercial

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

## 20. Whitelabel básico

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

## 21. Tela de configuração da marca

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

## 22. Modelos de player

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

## 23. Templates de conteúdo

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

## 24. Pacote de conteúdo opcional

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

## 25. Multi-cliente / multiempresa

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

## 26. Status das telas

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

## 27. Playlists por unidade ou tela

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

## 28. Modo comunicado urgente

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

## 29. Relatórios

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

## 30. Manual do cliente

### Objetivo

Reduzir suporte repetitivo e facilitar adoção.

### Itens

- [ ] Como acessar o painel.
- [ ] Como enviar mídia.
- [ ] Como ativar/inativar.
- [ ] Como ordenar playlist.
- [ ] Como agendar período.
- [ ] Como usar prioridade.
- [ ] Como excluir mídia.
- [ ] Como trocar senha.
- [ ] Formatos recomendados.
- [ ] O que fazer se o player travar.
- [ ] O que fazer se a TV estiver sem som.
- [ ] O que fazer se a internet estiver ruim.

### Prioridade

Alta.

---

## 31. Proposta comercial

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

# 32. Priorização geral

## Fazer primeiro

- [ ] Checklist de implantação.
- [ ] Diagnóstico de rede/travamentos.
- [ ] Limpeza de chunks.
- [ ] Validação de espaço em disco.
- [ ] Backups.
- [ ] Segurança de upload.
- [ ] Logs complementares.
- [ ] Manual de operação.
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
- [ ] Painel de saúde do sistema.
- [ ] Alertas automáticos por e-mail/WhatsApp.
- [ ] Dashboard comercial com métricas.
- [ ] Tema claro/escuro no admin.
- [ ] Assistente de configuração inicial.

---

# 33. Sprints sugeridas

## Sprint 1 — Operação e robustez

- [ ] Limpeza de chunks.
- [ ] Validação de espaço em disco.
- [ ] Backup melhorado.
- [ ] Logs complementares.
- [ ] Diagnóstico de rede documentado.

---

## Sprint 2 — Segurança e manutenção

- [ ] Revisar upload.
- [ ] Validar extensão e MIME type.
- [ ] Limitar tamanho máximo.
- [ ] Melhorar mensagens de erro.
- [ ] Font Awesome local.

---

## Sprint 3 — Whitelabel básico

- [ ] Configurar nome do cliente.
- [ ] Configurar logo.
- [ ] Configurar favicon.
- [ ] Configurar wallpaper.
- [ ] Configurar cores.
- [ ] Aplicar marca no player, login e dashboard.

---

## Sprint 4 — Documentação e venda

- [ ] Manual do cliente.
- [ ] Guia de implantação comercial.
- [ ] Proposta comercial.
- [ ] Pacotes e planos.
- [ ] Checklist de suporte.

---

## Sprint 5 — Escala

- [ ] Status das telas.
- [ ] Playlists por tela.
- [ ] Cache/offline.
- [ ] Multiempresa.
- [ ] Relatórios.

---

# 34. Observações estratégicas

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

# 35. Regra de ouro

Antes de transformar uma ideia em desenvolvimento, classificar:

```txt
1. É essencial para estabilidade?
2. É importante para uso real?
3. É importante para venda?
4. É apenas melhoria visual?
5. É ideia futura?