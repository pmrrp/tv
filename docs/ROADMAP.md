# Roadmap — Painel Ribas

## 1. Objetivo deste documento

Este documento registra a evolução planejada do Painel Ribas.

Ele serve para organizar:

- estado atual do sistema;
- fases concluídas;
- melhorias em andamento;
- próximas prioridades;
- ideias levantadas durante o desenvolvimento;
- itens que não são urgentes, mas agregam valor;
- caminho futuro para uma possível versão comercial/whitelabel.

---

## 2. Estado atual

O Painel Ribas encontra-se com a Fase 2 funcionalmente consolidada e com o primeiro grande bloco da Fase 3 já implementado, testado, integrado e publicado na VM de produção.

O sistema já possui:

- player institucional funcional;
- dashboard administrativa;
- login;
- controle de sessão;
- upload de imagens e vídeos;
- upload em partes/chunks;
- biblioteca de mídias;
- filtros refinados;
- agendamento por período;
- prioridade;
- recorrência;
- recorrência inteligente para evitar mídias repetidas muito próximas;
- playlist automática;
- backups automáticos JSON;
- backup manual/auditado do banco SQLite;
- painel visual de backups;
- usuários;
- permissões;
- logs de auditoria;
- visualização refinada dos logs;
- controle de armazenamento;
- bloqueio preventivo de upload por limite operacional;
- limpeza automática de chunks antigos;
- diagnóstico operacional protegido;
- painel visual de diagnóstico;
- deploy na VM;
- acesso via domínio;
- documentação técnica e operacional.

---

## 3. Prioridade atual

A prioridade atual é consolidar a Fase 3 em uso real.

Ordem recomendada:

1. manter a versão em produção estável;
2. validar periodicamente armazenamento, backups e diagnóstico;
3. concluir documentação operacional;
4. criar ajuda contextual/tooltips para operadores;
5. melhorar orientações de uso e implantação;
6. avançar em segurança complementar;
7. somente depois iniciar refatorações maiores;
8. preparar gradualmente uma possível versão comercial/whitelabel.

---

# 4. Fase 1 — Player institucional inicial

## Objetivo

Validar a ideia de exibição automatizada de vídeos e imagens institucionais em TVs.

## Itens concluídos

- [x] Criar player web inicial.
- [x] Reproduzir vídeos em tela cheia.
- [x] Consumir `playlist.json`.
- [x] Testar em navegador de computador.
- [x] Testar em Smart TVs.
- [x] Aplicar identidade visual institucional inicial.

## Resultado

A Fase 1 validou o conceito, mas revelou limitações importantes dos navegadores internos de Smart TVs, especialmente relacionadas a autoplay e controle de mídia.

## Decisão tomada

Migrar a operação para computadores/mini PCs conectados às TVs, garantindo mais estabilidade, compatibilidade e controle.

---

# 5. Fase 2 — Dashboard administrativa e operação inicial

## Objetivo

Criar uma dashboard administrativa para permitir que usuários autorizados gerenciem conteúdos sem editar arquivos manualmente.

## Itens concluídos

- [x] Login administrativo.
- [x] Controle de sessão.
- [x] Dashboard administrativa.
- [x] Upload de mídias.
- [x] Upload em partes/chunks.
- [x] Biblioteca de mídias.
- [x] Filtros com aplicação manual.
- [x] Agendamento de exibição.
- [x] Prioridade.
- [x] Recorrência.
- [x] Playlist automática.
- [x] Usuários.
- [x] Perfis de acesso.
- [x] Logs de auditoria.
- [x] Exclusão de usuário por superadmin.
- [x] Modal de detalhes da mídia.
- [x] Modal premium de período.
- [x] Mini modal premium de horário.
- [x] Proteção contra perda de alterações.
- [x] Deploy na VM.
- [x] Documentação inicial.

## Resultado

A Fase 2 transformou o projeto de um player simples em um sistema administrativo funcional, com gerenciamento de mídias, usuários, playlist, filtros, auditoria e operação em produção.

## Situação

Fase 2 considerada funcionalmente consolidada.

---

# 6. Fase 3 — Robustez operacional, manutenção e uso real

## Objetivo

Fortalecer o sistema para operação contínua em ambiente real.

A Fase 3 tem como foco:

- estabilidade;
- manutenção preventiva;
- diagnóstico;
- proteção contra falhas operacionais;
- controle de armazenamento;
- backups;
- auditoria;
- melhoria da experiência do operador;
- documentação de operação.

---

## 6.1 Bloco concluído — Robustez operacional

### Itens concluídos

- [x] Limpeza automática de chunks antigos.
- [x] Auditoria da limpeza automática de chunks.
- [x] Resumo operacional de armazenamento no backend.
- [x] Configuração de limite da pasta `midia/` via `.env`.
- [x] Configuração de reserva mínima de disco via `.env`.
- [x] Bloqueio preventivo de uploads por armazenamento.
- [x] Bloqueio preventivo na finalização de chunks.
- [x] Auditoria de uploads bloqueados.
- [x] Card visual de armazenamento na dashboard.
- [x] Refinamento visual dos logs de auditoria.
- [x] Auditoria de backups automáticos JSON.
- [x] Backup seguro/auditado do banco SQLite.
- [x] Painel visual de backups.
- [x] Rota protegida de diagnóstico operacional.
- [x] Painel visual de diagnóstico operacional.
- [x] Deploy das melhorias na VM.
- [x] Primeiro backup SQLite gerado em produção.
- [x] Diagnóstico operacional validado em produção.

### Resultado

O sistema passou a contar com mecanismos de proteção e manutenção mais maduros.

Agora ele consegue:

- monitorar armazenamento;
- bloquear uploads arriscados;
- registrar eventos técnicos importantes;
- gerar backups JSON e SQLite;
- listar backups no admin;
- verificar a saúde operacional;
- avisar o superadmin sobre pontos de atenção.

---

## 6.2 Bloco concluído — Recorrência inteligente da playlist

### Itens concluídos

- [x] Melhorar algoritmo de recorrência da playlist.
- [x] Evitar mídia repetida colada nela mesma.
- [x] Criar regra de distância mínima entre aparições da mesma mídia.
- [x] Considerar a posição original da mídia.
- [x] Considerar o loop da playlist.
- [x] Testar cenários com múltiplas mídias recorrentes.
- [x] Validar comportamento visual da playlist gerada.

### Resultado

A playlist ficou mais agradável visualmente e menos propensa a parecer “bugada” por repetir a mesma mídia muito próxima dela mesma.

---

## 6.3 Próximo bloco recomendado — Usabilidade do operador

### Objetivo

Reduzir dúvidas de usuários administrativos e tornar o painel mais autoexplicativo.

### Itens planejados

- [x] Criar sistema de tooltips/ajuda contextual.
- [ ] Adicionar ajuda para prioridade.
- [ ] Adicionar ajuda para recorrência.
- [ ] Adicionar ajuda para período de exibição.
- [ ] Adicionar ajuda para tempo indeterminado.
- [ ] Adicionar ajuda para ativo/inativo.
- [ ] Adicionar ajuda para armazenamento.
- [ ] Adicionar ajuda para backups.
- [ ] Adicionar ajuda para diagnóstico.
- [x] Criar padrão visual discreto para ícones de informação.
- [x] Evitar poluição visual da interface.

### Prioridade

Média/Alta.

---

## 6.4 Próximo bloco recomendado — Implantação assistida

### Objetivo

Padronizar instalação e operação dos pontos de exibição.

### Itens planejados

- [ ] Criar checklist oficial de implantação por ponto.
- [ ] Validar documentação de login automático.
- [ ] Validar documentação de modo quiosque.
- [ ] Validar documentação de AnyDesk.
- [ ] Validar documentação de BIOS para religar após queda de energia.
- [ ] Documentar teste de resolução e escala da TV.
- [ ] Documentar teste de áudio HDMI.
- [ ] Criar ficha técnica por ponto instalado.

### Prioridade

Alta.

---

## 6.5 Próximo bloco recomendado — Diagnóstico de rede e travamentos

### Objetivo

Evitar que problemas de internet/rede local sejam confundidos com falhas do sistema.

### Itens planejados

- [ ] Documentar recomendação de rede cabeada sempre que possível.
- [ ] Criar checklist de diagnóstico de travamentos.
- [ ] Orientar teste comparativo com 4G/5G.
- [ ] Orientar teste de download de arquivo pesado.
- [ ] Orientar verificação de estabilidade da rede local.
- [ ] Documentar impacto de vídeos grandes em redes instáveis.
- [ ] Criar seção “Problemas comuns e possíveis causas” no manual.

### Prioridade

Alta.

---

## 6.6 Melhorias futuras da Fase 3

### Operação e manutenção

- [ ] Criar download seguro de backups pela interface.
- [ ] Criar filtros por tipo na listagem de backups.
- [ ] Avaliar restauração manual controlada.
- [ ] Criar modal detalhado para diagnóstico operacional.
- [ ] Avaliar exportação/cópia rápida do diagnóstico para suporte.

### Upload

- [ ] Mostrar tamanho enviado e total durante upload.
- [ ] Mostrar velocidade estimada de upload.
- [ ] Alertar sobre formato não recomendado.
- [ ] Alertar sobre arquivo muito pesado.
- [ ] Melhorar mensagem de upload falho.
- [ ] Avaliar drag and drop em tela inteira.

### Segurança

- [ ] Validar MIME type dos arquivos enviados.
- [ ] Avaliar logout automático por inatividade.
- [ ] Avaliar limite de sessões simultâneas.
- [ ] Revisar timeout de sessão.
- [ ] Revisar proteções administrativas restantes.

### Responsividade

- [ ] Melhorar cards de Backups e Diagnóstico no mobile.
- [ ] Refinar modal de detalhes no mobile.
- [ ] Refinar modal de período no mobile.
- [ ] Revisar modais em telas pequenas.
- [ ] Avaliar experiência em tablet.

## Kit Ponto TV — automação de preparação dos computadores

### Objetivo

Criar um pacote de preparação semi-automatizada para os computadores conectados às TVs, reduzindo etapas manuais e padronizando a implantação dos pontos de exibição.

### Itens planejados

- [ ] Criar pasta `ponto-tv/`.
- [ ] Criar configuração do Kit Ponto TV.
- [ ] Criar script PowerShell em modo diagnóstico.
- [ ] Criar relatório local de instalação/preparação.
- [ ] Automatizar validação de Node.js.
- [ ] Automatizar validação de Google Chrome.
- [ ] Automatizar instalação/validação do Player Agent.
- [ ] Automatizar tarefa do agente no Windows.
- [ ] Automatizar configuração de energia.
- [ ] Automatizar criação de modo quiosque.
- [ ] Orientar instalação/configuração do AnyDesk.
- [ ] Listar pendências manuais ao final da preparação.
- [ ] Testar em PC dedicado real antes de instalar em TV definitiva.

### Prioridade

Alta para fechamento operacional da Fase 3.

---

# 7. Fase 4 — Versão comercial / whitelabel

## Objetivo

Preparar o sistema para uma possível versão comercial ou personalizada para outros clientes.

A evolução comercial deve acontecer sem comprometer a versão institucional da Prefeitura.

---

## 7.1 Whitelabel básico

### Itens planejados

- [ ] Criar modo institucional Prefeitura.
- [ ] Criar modo comercial genérico.
- [ ] Separar assets institucionais dos assets do cliente.
- [ ] Configurar nome do cliente.
- [ ] Configurar logo.
- [ ] Configurar favicon.
- [ ] Configurar wallpaper/splash.
- [ ] Configurar cores principais.
- [ ] Aplicar marca no player.
- [ ] Aplicar marca no login.
- [ ] Aplicar marca na dashboard.

### Prioridade

Alta para versão comercial.

---

## 7.2 Tela de configuração da marca

### Itens planejados

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

## 7.3 Modelos de player

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

## 7.4 Templates de conteúdo

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

Média/Alta.

---

## 7.5 Pacotes comerciais e suporte

### Itens planejados

- [ ] Criar proposta modelo.
- [ ] Criar tabela de planos.
- [ ] Definir valor de implantação.
- [ ] Definir mensalidade.
- [ ] Definir o que está incluso na implantação.
- [ ] Definir o que está incluso na mensalidade.
- [ ] Definir criação de conteúdo opcional.
- [ ] Definir responsabilidade sobre hardware.
- [ ] Definir responsabilidade sobre internet.
- [ ] Definir política de suporte.
- [ ] Criar checklist pré-instalação.

### Prioridade

Alta antes da venda.

---

# 8. Fase 5 — Organização técnica e refatoração

## Objetivo

Organizar melhor o código após estabilização funcional e operacional.

Essa fase deve ser feita com cautela, pois o sistema já está em produção.

---

## 8.1 CSS

### Itens planejados

- [ ] Refatorar `admin.css`.
- [ ] Agrupar estilos por componente.
- [ ] Remover duplicidades.
- [ ] Reduzir uso de `!important`.
- [ ] Padronizar espaçamentos.
- [ ] Padronizar botões.
- [ ] Padronizar cards.
- [ ] Padronizar modais.
- [ ] Separar estilos por área, se necessário.

---

## 8.2 JavaScript do admin

### Itens planejados

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

---

## 8.3 Backend

### Itens planejados

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

---

# 9. Fase 6 — Monitoramento de players

## Objetivo

Permitir acompanhar se as TVs/players estão online e funcionando.

## Ideias

- [ ] Criar identificação por player.
- [ ] Criar rota de heartbeat.
- [ ] Registrar última comunicação do player.
- [ ] Exibir status online/offline.
- [ ] Exibir última sincronização.
- [ ] Exibir versão do player.
- [ ] Exibir navegador/sistema do player.
- [ ] Exibir mídia atual.
- [ ] Alertar se uma tela ficar muito tempo offline.

## Prioridade

Alta para produto comercial maduro.

---

# 10. Fase 7 — Playlists por tela/unidade

## Objetivo

Permitir conteúdos diferentes para locais diferentes.

## Itens planejados

- [ ] Criar cadastro de telas.
- [ ] Criar cadastro de unidades.
- [ ] Criar grupos de telas.
- [ ] Criar playlist por unidade.
- [ ] Criar playlist por tela.
- [ ] Criar mídia global.
- [ ] Criar mídia específica.
- [ ] Permitir publicar conteúdo em todas as telas.

## Prioridade

Média/Alta.

---

# 11. Fase 8 — Cache/offline avançado

## Objetivo

Permitir que o player continue exibindo o último conteúdo válido mesmo com instabilidade temporária de internet.

## Ideia inicial

O player poderia:

1. baixar a playlist;
2. guardar a última playlist válida;
3. tentar continuar exibindo mídias já carregadas;
4. informar quando estiver usando conteúdo salvo;
5. sincronizar novamente quando a conexão voltar.

## Itens planejados

- [ ] Estudar uso de Service Worker.
- [ ] Avaliar cache de `playlist.json`.
- [ ] Avaliar cache de imagens.
- [ ] Avaliar cache de vídeos recentes.
- [ ] Evitar cache infinito ocupando disco.
- [ ] Criar política de limpeza de cache.
- [ ] Criar mensagem “usando conteúdo salvo”.
- [ ] Criar teste controlado de queda de conexão.

## Prioridade

Média.

---

# 12. Ideias futuras

- [ ] Upload direto pelo celular.
- [ ] QR Code para redes sociais.
- [ ] Integração com Instagram.
- [ ] Templates automáticos de promoção.
- [ ] Agendamento por calendário visual.
- [ ] Alertas automáticos por e-mail/WhatsApp.
- [ ] Dashboard comercial com métricas.
- [ ] Tema claro/escuro no admin.
- [ ] Assistente de configuração inicial.
- [ ] Relatórios por tela/unidade.
- [ ] Estimativa de exibições.
- [ ] Modo comunicado urgente.
- [ ] Multiempresa.

---

# 13. Ordem recomendada de execução

## Curto prazo

- [ ] Tooltips/ajuda contextual.
- [ ] Checklist final de implantação por ponto.
- [ ] Diagnóstico de rede/travamentos documentado.
- [ ] Manual de operação atualizado.
- [ ] Melhorias complementares de segurança de upload.

---

## Médio prazo

- [ ] Font Awesome local.
- [ ] Melhorias mobile.
- [ ] Download seguro de backups.
- [ ] Filtros de backups.
- [ ] Modal detalhado de diagnóstico.
- [ ] Refatoração gradual do CSS.

---

## Longo prazo

- [ ] Whitelabel básico.
- [ ] Configuração visual por cliente.
- [ ] Status online/offline dos players.
- [ ] Playlists por tela/unidade.
- [ ] Cache/offline avançado.
- [ ] Relatórios.
- [ ] Multiempresa.

---

# 14. Regra de ouro

Antes de transformar uma ideia em desenvolvimento, classificar:

1. É essencial para estabilidade?
2. É importante para uso real?
3. É importante para venda?
4. É apenas melhoria visual?
5. É ideia futura?

Essa classificação deve orientar a prioridade real do roadmap.

---

# 15. Observação estratégica

A meta não é transformar o Painel Ribas imediatamente em uma plataforma SaaS complexa.

A meta atual é manter uma solução:

- estável;
- bonita;
- segura;
- documentada;
- fácil de instalar;
- fácil de operar;
- fácil de explicar;
- útil para a Prefeitura;
- com potencial futuro de adaptação comercial.

---

## Pendências pós-estabilização da produção

### Produção / VM

- [x] Recuperar acesso ao `painelribas.com.br`.
- [x] Validar `/admin`.
- [x] Criar tarefa agendada SYSTEM para o Node.js.
- [x] Criar tarefa agendada SYSTEM para o Cloudflared.
- [x] Desativar tarefas antigas dependentes de usuário.
- [x] Testar restart da VM.
- [x] Atualizar código da VM com `git pull`.
- [x] Validar produção após deploy.

### Infraestrutura externa

- [ ] Configurar no host/Hyper-V para que a VM inicie automaticamente junto com o servidor físico.
- [ ] Confirmar com o responsável pelo servidor físico se a ação automática de inicialização da VM está habilitada.
- [ ] Definir atraso sugerido de inicialização da VM, preferencialmente 60 segundos.

### DNS institucional

- [ ] Manter `painelribas.com.br` como domínio operacional provisório.
- [ ] Após migração do portal da Prefeitura, solicitar retorno/centralização da gestão DNS institucional.
- [ ] Solicitar criação/ajuste do registro `tv.ribasdoriopardo.ms.gov.br`.
- [ ] Apontar `tv.ribasdoriopardo.ms.gov.br` para o túnel Cloudflare correto.
- [ ] Validar painel no domínio institucional.
- [ ] Atualizar documentação e configurações que ainda apontarem para `painelribas.com.br`, quando a migração institucional estiver concluída.

### Segurança / manutenção

- [ ] Avaliar o aviso moderado do `npm audit` relacionado ao pacote `qs`.
- [ ] Testar eventual correção em ambiente seguro antes de aplicar em produção.
- [ ] Evitar executar `npm audit fix` diretamente em produção sem validação prévia.

### Kit Ponto TV

- [x] Criar Kit Ponto TV.
- [x] Criar gerador de pacote.
- [x] Criar script de preparação do Windows.
- [ ] Testar o fluxo completo em Windows limpo via pendrive.
- [ ] Validar instalação em equipamento final.
- [ ] Validar fallback local com Player Agent.
