# Changelog — Painel Ribas

## Objetivo

Este arquivo registra a evolução do projeto Painel Ribas ao longo do desenvolvimento.

Ele serve para:

- documentar marcos importantes;
- registrar funcionalidades implementadas;
- facilitar acompanhamento da evolução;
- apoiar apresentações técnicas e executivas;
- evitar perda de contexto histórico.

---

## Formato adotado

Cada entrada pode conter:

- data aproximada;
- fase ou tema;
- tipo de alteração;
- resumo;
- impacto no sistema.

---

# 2026-04 — Fase 1: Player institucional

## Implementado

- Criação do player web inicial.
- Reprodução de vídeos em tela cheia.
- Interface leve para navegador.
- Controles laterais básicos.
- Leitura de playlist.
- Estilização inicial com identidade visual da Prefeitura.
- Testes em navegador de computador e Smart TVs.

## Contexto

A primeira versão foi pensada para rodar diretamente no navegador das Smart TVs, com foco em simplicidade e leveza.

## Limitação identificada

Durante os testes, navegadores de Smart TVs, especialmente LG, passaram a apresentar bloqueios de autoplay, inviabilizando a operação automática sem intervenção manual.

---

# 2026-05 — Decisão de infraestrutura

## Implementado

- Criação de VM para hospedar o sistema.
- Publicação do sistema em ambiente próprio.
- Uso de PM2 para manter o backend Node.js em execução.
- Configuração de Cloudflare Tunnel.
- Uso inicial do domínio `painelribas.com.br`.

## Impacto

A solução deixou de depender de hospedagem estática e passou a rodar em ambiente controlado, com backend próprio, suporte a uploads e maior estabilidade.

---

# 2026-05 — Fase 2: Dashboard administrativa

## Implementado

- Criação da dashboard administrativa.
- Criação da tela de login.
- Controle de sessão.
- Upload de imagens.
- Upload de vídeos.
- Listagem de mídias.
- Edição de título amigável.
- Ativação/desativação de mídias.
- Ordenação de mídias.
- Exclusão individual de mídias.
- Exclusão em lote.
- Geração automática de playlist.

## Impacto

O sistema passou a permitir gerenciamento dos conteúdos sem edição manual de arquivos.

---

# 2026-05 — Agendamento, prioridade e recorrência

## Implementado

- Período de exibição por mídia.
- Data/hora inicial.
- Data/hora final.
- Opção de período indefinido.
- Filtro de mídias vencidas/agendadas.
- Prioridade normal.
- Prioridade alta.
- Prioridade urgente.
- Recorrência/repetição de mídias.
- Atualização automática da playlist conforme validade.

## Impacto

A programação das mídias passou a ser mais inteligente, permitindo campanhas temporárias, conteúdos urgentes e repetição controlada.

---

# 2026-05 — Upload em partes/chunks

## Implementado

- Upload de arquivos grandes em partes.
- Envio sequencial de chunks.
- Junção dos chunks no backend.
- Feedback visual de progresso.
- Registro da mídia após finalização.
- Atualização automática da playlist após upload.

## Contexto

A implementação foi necessária devido a limitações de upload em ambiente com Cloudflare gratuito e ao tamanho variável dos vídeos institucionais.

## Impacto

O sistema passou a suportar vídeos maiores com mais estabilidade.

---

# 2026-05 — Backups automáticos iniciais

## Implementado

- Backup automático de `midia-config.json`.
- Backup automático de `playlist.json`.
- Comparação para evitar backups desnecessários.
- Limite de backups por tipo.
- Limpeza automática de backups antigos.
- Listagem inicial de backups na dashboard administrativa.

## Impacto

A configuração das mídias e a playlist passaram a ter proteção contra perdas acidentais.

---

# 2026-05 — Usuários e permissões

## Implementado

- Banco SQLite para usuários.
- Criação de usuários.
- Edição de usuários.
- Perfis de acesso:
  - superadmin;
  - admin;
  - editor;
  - viewer.
- Ativação/desativação de usuários.
- Reset de senha.
- Proteção contra autodesativação.
- Proteção contra admin comum alterar superadmin.
- Proteção contra promoção indevida para superadmin.
- Exclusão de usuário por superadmin.
- Proteção contra autoexclusão.

## Impacto

O sistema passou a ter controle administrativo mais seguro e preparado para múltiplos operadores.

---

# 2026-05 — Logs de auditoria

## Implementado

- Criação da tabela `audit_logs`.
- Registro de login.
- Registro de logout.
- Registro de upload.
- Registro de edição de mídia.
- Registro de exclusão de mídia.
- Registro de exclusão em lote.
- Registro de movimentação/reordenação.
- Registro de criação de usuário.
- Registro de edição de usuário.
- Registro de alteração de status.
- Registro de reset de senha.
- Registro de exclusão de usuário.
- Tela de auditoria na dashboard.

## Impacto

O sistema passou a registrar ações sensíveis, trazendo rastreabilidade e mais governança.

---

# 2026-05 — Melhorias visuais e de usabilidade

## Implementado

- Padronização visual da dashboard.
- Melhorias no cabeçalho.
- Cards de resumo.
- Modal de usuário.
- Modal de reset de senha.
- Modal de alteração de status.
- Modal genérico de confirmação.
- Faixa animada no login.
- Melhorias em botões e estados visuais.
- Melhorias em cards de mídia.
- Melhorias nos filtros da biblioteca.

## Impacto

A dashboard passou a ter aparência mais profissional, consistente e amigável.

---

# 2026-05 — Filtros avançados da biblioteca

## Implementado

- Filtro por busca textual.
- Filtro por status.
- Filtro por tipo.
- Filtro por período.
- Filtro por prioridade.
- Filtro por recorrência.
- Combinação de múltiplos filtros.
- Botão “Aplicar filtros”.
- Botão “Limpar filtros”.
- Contador de filtros aplicados.
- Rascunho descartado ao clicar fora sem aplicar.
- Rascunho descartado ao pressionar ESC sem aplicar.

## Impacto

A biblioteca ficou mais previsível e profissional, evitando filtros aplicados acidentalmente.

---

# 2026-05 — Integração entre prioridade e repetição

## Implementado

- Ajuste conceitual entre prioridade e recorrência das mídias.
- Prioridade Normal passa a manter a mídia sem repetição.
- Prioridade Alta libera o seletor de repetição e sugere repetição a cada 6 mídias.
- Prioridade Urgente libera o seletor de repetição e sugere repetição a cada 3 mídias.
- O controle de repetição passou a ser exibido apenas quando fizer sentido operacional.
- O comportamento foi aplicado tanto para imagens quanto para vídeos.
- O badge de prioridade passou a atualizar visualmente junto com a configuração da mídia.

## Impacto

A interface ficou mais lógica para o usuário, reduzindo a confusão entre “prioridade” e “repetição”.

A prioridade agora orienta a frequência de exibição, enquanto o campo de repetição permite ajuste fino quando a mídia for marcada como Alta ou Urgente.

---

# 2026-05 — Refinamento de prioridade e recorrência

## Ajustes implementados

- Removida a opção "Não repetir" para mídias com prioridade Alta ou Urgente.
- Prioridades Alta/Urgente agora obrigam uma recorrência válida.
- Prioridade Normal mantém recorrência desativada.
- Campo de repetição passou a respeitar melhor o conceito de prioridade.
- Sugestões automáticas de recorrência foram refinadas:
  - Alta → "A cada 6 mídias";
  - Urgente → "A cada 3 mídias".
- Ajustada largura visual do select de repetição.
- Melhorado comportamento visual do campo de recorrência.

## Resultado

A interface ficou mais coerente conceitualmente, reduzindo ambiguidades entre prioridade e repetição.

Agora a prioridade influencia diretamente a frequência operacional da mídia na playlist.

---

# 2026-05 — Refinamento do status Ativo/Inativo

## Implementado

- A TAG Ativo/Inativo passou a funcionar como um switch de ação imediata.
- O clique na TAG agora salva automaticamente o novo estado no backend.
- A alteração de status não exige mais o botão "Salvar alterações".
- O botão "Salvar alterações" continua reservado para mudanças reais de configuração, como nome, duração, período, prioridade e repetição.
- Mídias inativas passaram a bloquear edição de configurações sensíveis:
  - nome;
  - duração;
  - período de exibição;
  - prioridade;
  - repetição.
- Mídias inativas continuam permitindo ações essenciais:
  - reativar;
  - excluir;
  - visualizar detalhes;
  - selecionar em lote.
- O botão Excluir permanece visualmente ativo mesmo quando o card está inativo.
- O status visual do card é atualizado imediatamente após o clique.
- Em caso de erro ao salvar o status, o card retorna ao estado anterior.
- Os filtros da biblioteca são reaplicados após a mudança de status.

## Impacto

A operação ficou mais simples e intuitiva para o usuário administrativo.

Como Ativo/Inativo é uma ação de alternância simples, o próprio clique passou a persistir a mudança, evitando a necessidade de um botão adicional de salvamento para uma ação reversível.

Isso reduz confusão na interface, melhora a velocidade de operação e mantém o botão "Salvar alterações" focado apenas em edições que exigem mais atenção.

---

# 2026-05 — Sincronização rápida da playlist

## Implementado

- Backend passou a revalidar/publicar a playlist automaticamente a cada 5 segundos.
- Player passou a sincronizar silenciosamente a playlist a cada 5 segundos.
- Mídias agendadas passam a entrar na programação com atraso reduzido após atingir o horário configurado.
- Alterações feitas no painel administrativo são refletidas no player com menor tempo de espera.

## Impacto

A atualização da programação ficou mais ágil.

Essa decisão melhora principalmente o uso de mídias com período de exibição, campanhas agendadas e conteúdos que precisam entrar ou sair da playlist em horário próximo ao definido no painel.

---

# 2026-05 — Modais, detalhes da mídia e proteção contra perda de alterações

## Implementado

- Substituição do popover de detalhes da mídia por modal no padrão visual do sistema.
- Modal de detalhes passou a exibir informações técnicas e operacionais da mídia, incluindo:
  - título amigável;
  - nome real do arquivo;
  - tipo;
  - extensão;
  - caminho;
  - tamanho, quando disponível;
  - ordem;
  - duração;
  - período;
  - início;
  - fim;
  - repetição;
  - status;
  - prioridade.
- Desativação do popover antigo de detalhes para evitar cortes em telas pequenas.
- Implementação de modal próprio para saída com alterações pendentes.
- Botão "Sair" passou a exibir modal de confirmação quando existem alterações não salvas.
- Atalhos F5 e Ctrl+R passaram a exibir modal próprio quando existem alterações não salvas.
- Aviso nativo do navegador foi mantido como fallback para ações que não permitem modal customizado, como fechar aba, usar o botão atualizar do navegador ou navegar pela barra de endereço.
- Implementação de modal de aviso ao tentar sincronizar a biblioteca com alterações pendentes.
- Botão Sincronizar passou a ser bloqueado quando há rascunhos não salvos na tela.
- Modal de sincronização permite continuar editando ou salvar as alterações antes de atualizar a biblioteca.
- Modal de sincronização foi ajustado visualmente para tons de aviso/atenção.

## Impacto

A dashboard ficou mais previsível e segura contra perda acidental de alterações.

O modal de detalhes melhora a leitura das informações da mídia e evita problemas de popover cortando em telas pequenas ou próximo às bordas do navegador.

O bloqueio da sincronização manual com alterações pendentes evita estados inconsistentes, em que a biblioteca é recarregada a partir do backend enquanto a tela ainda indica alterações não salvas.

## Observação

O modal de detalhes já está funcional, mas seu posicionamento e experiência em telas pequenas deverão ser refinados na Fase 3, junto com os ajustes gerais de responsividade/mobile.

---

# 2026-05 — Selects premium, status visual e refinamentos finais da biblioteca

## Implementado

- Select de repetição convertido para componente premium.
- Select de repetição passou a usar menu em portal global, evitando conflito visual com os cards abaixo.
- Select de repetição mantém o select real como fonte de valor, preservando a lógica existente de salvamento.
- Prioridade Alta passou a sugerir automaticamente repetição "A cada 6 mídias".
- Prioridade Urgente passou a sugerir automaticamente repetição "A cada 3 mídias".
- Selects dos filtros da biblioteca foram convertidos para componentes premium:
  - status;
  - tipo;
  - período;
  - prioridade;
  - repetição.
- Selects premium dos filtros preservam o comportamento de rascunho.
- Selects premium dos filtros respeitam os botões "Aplicar filtros" e "Limpar filtros".
- Status Ativo/Inativo recebeu refinamento visual, substituindo o marcador circular simples por ícones mais claros.
- Ajuste pontual no layout dos cards de mídia para melhorar acomodação de textos maiores.
- Ajustes visuais foram feitos sem refatoração ampla do CSS.

## Impacto

A biblioteca de mídias passou a ter aparência mais consistente e profissional.

Os componentes de seleção mais visíveis deixaram de depender do visual nativo do navegador, reduzindo a aparência de formulário padrão e aproximando o painel de uma interface mais polida.

A lógica funcional foi preservada: os selects reais continuam existindo como fonte de valor, enquanto os componentes premium atuam como camada visual e interativa.

## Observação

A refatoração geral do `admin.css` continua planejada para momento futuro, após estabilização, testes e apresentação da Fase 2.

---

# 2026-05 — Modal premium de período e seletor de horário

## Implementado

- Substituição do popover de período de exibição por modal premium.
- Modal de período passou a seguir o padrão visual dos demais modais da dashboard.
- Modal exibe o nome amigável da mídia em edição.
- Calendário premium implementado dentro do modal de período.
- Campo de horário substituído por seletor premium em mini modal.
- Mini modal de horário permite ajustar hora e minuto por setas.
- O fluxo de período passou a trabalhar com etapas mais claras:
  - escolher início;
  - aplicar início;
  - escolher fim;
  - aplicar fim;
  - aplicar período.
- Ao escolher uma data, o sistema desmarca automaticamente "Tempo indeterminado".
- Botões "Limpar campo selecionado" e "Aplicar início/fim" aparecem apenas quando há alteração real no campo ativo.
- Feedbacks do fluxo de período passaram a aparecer dentro do próprio modal.
- "Aplicar período" salva diretamente no backend, sem exigir clique posterior no botão Salvar do card.
- Validação impede salvar período com data final anterior à data inicial.
- ESC foi ajustado para fechar primeiro o mini modal de horário e somente depois o modal principal de período.

## Impacto

A configuração de período de exibição ficou mais clara, previsível e profissional.

O uso de modal elimina problemas anteriores de popover cortado, conflito de bordas, `z-index`, clique fora e limitação de espaço dentro dos cards.

O seletor premium de horário evita o uso de campos nativos inconsistentes entre navegadores e impede horários inválidos por seleção visual controlada.

## Observação

O período de exibição agora é tratado como fluxo completo dentro de modal. Por isso, ao clicar em "Aplicar período", o sistema já salva a configuração da mídia diretamente no backend.

Melhorias futuras podem incluir exibição resumida do período no card e simplificação das informações redundantes no modal de detalhes.

---

# 2026-05 — Fechamento da Fase 2 em produção

## Validado

- Validação local completa realizada.
- Deploy realizado na VM de produção.
- Testes pós-deploy executados em produção.
- Dashboard administrativa validada.
- Biblioteca de mídias validada.
- Filtros premium validados.
- Select premium de repetição validado.
- Modal premium de período de exibição validado.
- Mini modal premium de horário validado.
- Fluxo de ativação/inativação validado.
- Fluxo de alterações pendentes validado.
- Fluxo de sincronização com alterações pendentes validado.
- Player validado em produção.
- Console revisado durante os testes.

## Impacto

A Fase 2 passou a ser considerada pronta para apresentação institucional.

O sistema encontra-se funcional em produção, com dashboard administrativa, player, gerenciamento de mídias, usuários, logs, filtros, agendamento, prioridade, recorrência, upload em partes, modais premium e validações principais operando corretamente.

## Observação

Os próximos ajustes foram classificados como Fase 3/backlog, incluindo refatoração de CSS/JavaScript, melhorias mobile, refinamentos no modal de detalhes, exibição resumida de período no card, Font Awesome local e melhorias futuras de documentação/manual.

---

# 2026-05 — Deploy e operação na VM

## Estado atual

- Sistema rodando na VM em `C:\tv-v2\tv`.
- Processo PM2 chamado `painel-tv-v2`.
- Branch em produção: `fix-admin-funcionalidades`.
- Script principal: `server.js`.
- Node.js em execução via PM2.
- Cloudflare Tunnel ativo.
- Domínio em uso: `painelribas.com.br`.

## Fluxo operacional

```powershell
cd c:\tv-v2\tv
git pull
pm2 restart painel-tv-v2 --update-env
pm2 status
pm2 save
```

## Impacto

O fluxo de atualização da VM ficou padronizado para deploys e correções futuras.

---

# 2026-05 — Documentação do projeto

## Implementado

Criação e organização da pasta `docs/` com documentação inicial e complementar:

- `CONTEXTO_PROJETO.md`;
- `DEPLOY_VM.md`;
- `CHECKLIST_FASE_2.md`;
- `ARQUITETURA.md`;
- `DECISOES_TECNICAS.md`;
- `ROADMAP.md`;
- `HISTORICO_PROJETO.md`;
- `CHANGELOG.md`;
- `BACKLOG_FASE_3_E_4.md`;
- `FASE_3_ROBUSTEZ_OPERACIONAL.md`.

## Impacto

A documentação passou a registrar contexto, arquitetura, decisões, histórico, deploy, backlog e evolução do sistema, reduzindo dependência do histórico de conversa.

---

# 2026-05 — Fase 3: Robustez operacional

## Adicionado

- Implementada limpeza automática de uploads temporários antigos em `data/upload-chunks/`.
- Adicionada auditoria da limpeza automática de chunks com a ação `sistema.chunks.limpeza`.
- Adicionado resumo operacional de armazenamento no backend.
- Adicionadas configurações de limite operacional via `.env`:
  - `MEDIA_MAX_STORAGE_GB`;
  - `DISK_MIN_FREE_GB`.
- Implementado bloqueio preventivo de uploads quando o arquivo ultrapassa o limite da pasta `midia/` ou ameaça a reserva mínima de disco.
- Adicionada auditoria de uploads bloqueados com a ação `midia.upload.bloqueado`.
- Adicionado card visual de armazenamento na dashboard administrativa.
- Refinada a seção de logs/auditoria no admin com cards, ícones, estados visuais e detalhes técnicos expansíveis.
- Adicionada auditoria de backups automáticos JSON com a ação `sistema.backup.json`.
- Implementado backup seguro e auditado do banco SQLite usando `db.backup()`.
- Adicionado painel visual de Backups no admin, visível apenas para superadmin.
- Adicionada rota protegida `/api/admin/diagnostico` para diagnóstico operacional completo.
- Adicionado painel visual de Diagnóstico no admin, visível apenas para superadmin.

## Alterado

- A rota `/api/admin/resumo` passou a retornar informações de armazenamento.
- A listagem `/api/admin/backups` passou a incluir backups `.db` do banco SQLite.
- O nome dos backups passou a usar horário local no timestamp.
- O painel de backups passou a exibir resumo por tipo de backup.
- O diagnóstico visual passou a exibir avisos detalhados em vez de apenas informar que há pontos de atenção.
- A visualização de auditoria passou a exibir títulos e resumos amigáveis para eventos técnicos.

## Segurança operacional

- O backend passou a proteger o servidor contra crescimento descontrolado da pasta de mídias.
- O sistema passou a preservar reserva mínima de disco configurável.
- Backups JSON e SQLite passaram a ter rastreabilidade por auditoria.
- A manutenção automática de chunks passou a ser auditável.

## Validação

- Funcionalidades testadas localmente.
- Merge realizado na branch `fix-admin-funcionalidades`.
- Deploy realizado na VM.
- PM2 reiniciado.
- Primeiro backup SQLite gerado no ambiente real da VM.
- Diagnóstico operacional validado em produção.

## Impacto

A Fase 3 fortaleceu o sistema para operação contínua, reduzindo riscos de falhas por armazenamento, perda de dados, uploads incompletos e ausência de diagnóstico.

O painel passou a contar com recursos de manutenção, rastreabilidade e suporte operacional mais maduros.

---

# 2026-05 — Recorrência inteligente da playlist

## Corrigido

- Melhorada a lógica de recorrência da playlist para evitar que mídias repetidas apareçam muito próximas da própria posição original.
- A recorrência agora considera a última aparição real da mídia.
- A recorrência agora considera o loop da playlist, evitando reset incorreto da contagem no início de um novo ciclo.
- Criada regra de distância mínima entre aparições da mesma mídia.
- Evitadas duplicações visuais incômodas, como a mesma mídia aparecendo colada ou próxima demais dela mesma.

## Contexto

Durante teste real, foi identificado que mídias configuradas para repetir a cada N itens poderiam aparecer muito próximas da própria posição original.

Também foi identificado que, ao retornar ao início da playlist, a contagem de recorrência reiniciava, ignorando o fato de que a playlist roda em loop.

## Impacto

A playlist passou a ter distribuição visual mais agradável e comportamento mais coerente em uso real.

A recorrência continua respeitando a intenção de destacar mídias importantes, mas evita sensação de bug ou repetição colada na exibição da TV.

---

# 2026-05 - Usabilidade / Ajuda contextual

- Adicionadas dicas nativas de interface usando `title` nos principais controles do painel administrativo.
- Aplicadas dicas rápidas nos cards de resumo operacional, upload, biblioteca, filtros, cards de mídia, usuários, auditoria, backups e diagnóstico.
- Mantido o ícone de ajuda visual apenas nos títulos principais das seções, evitando excesso de interrogações espalhadas pela interface.
- Padronizada a estratégia de ajuda contextual:
  - microcontroles usam dica nativa no hover;
  - seções principais mantêm ícone de ajuda discreto;
  - a base fica preparada para futura evolução com modais ou vídeos tutoriais por seção.
- Refinada a experiência do operador sem alterar regras de negócio, backend ou fluxo funcional do sistema.

## Impacto

A dashboard administrativa ficou mais autoexplicativa para usuários e operadores, reduzindo dúvidas sobre botões, filtros, status, prioridade, recorrência, backups, diagnóstico e ações sensíveis.

A mudança melhora a usabilidade sem poluir visualmente o painel e sem comprometer o padrão premium adotado na interface.

---

# 2026-05 - Cache do frontend administrativo

- Adicionados headers anti-cache para arquivos leves do frontend administrativo.
- O sistema agora orienta o navegador a revalidar arquivos como HTML, CSS e JavaScript do admin após deploy.
- A melhoria reduz casos em que o HTML novo carrega junto com CSS/JS antigo em cache.
- A regra foi aplicada apenas aos assets leves do admin, sem afetar mídias, vídeos ou imagens da pasta `midia/`.

## Impacto

Reduz a necessidade de hard reload após alterações visuais ou funcionais no painel administrativo e evita inconsistências de interface após deploy.

---

### Fechamento do ciclo atual da Fase 3

- Validado em produção o conjunto atual de melhorias da Fase 3.
- Confirmado funcionamento dos recursos de robustez operacional, incluindo:
  - limpeza automática de chunks antigos;
  - resumo de armazenamento;
  - bloqueio preventivo de uploads por limite operacional;
  - auditoria de uploads bloqueados;
  - auditoria de backups JSON;
  - backup auditado do banco SQLite;
  - painel de backups;
  - diagnóstico operacional;
  - painel visual de diagnóstico;
  - recorrência inteligente da playlist;
  - dicas contextuais no admin;
  - headers anti-cache para assets leves do admin.
- Confirmado funcionamento do painel administrativo após deploy na VM.
- Confirmado funcionamento do player após deploy.
- Documentação técnica e operacional atualizada.

### Impacto

O ciclo atual da Fase 3 foi considerado estável para uso em produção.

O sistema passou a ter melhor proteção operacional, rastreabilidade, diagnóstico, backup, experiência de uso e previsibilidade após deploy.

---

# Próximos registros esperados

Próximas entradas deste changelog deverão registrar:

- refinamentos de usabilidade para o operador;
- diagnóstico de rede/travamentos documentado;
- checklist final de implantação por ponto;
- melhorias mobile;
- refatoração futura do CSS/admin;
- Font Awesome local;
- melhorias futuras para whitelabel/comercial;
- fechamento oficial da Fase 3.