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
- tipo de alteração;
- resumo;
- impacto no sistema.

---

## 2026-05 — Fase 1: Player institucional

### Implementado

- Criação do player web inicial.
- Reprodução de vídeos em tela cheia.
- Interface leve para navegador.
- Controles laterais básicos.
- Leitura de playlist.
- Estilização inicial com identidade visual da Prefeitura.
- Testes em navegador de computador e Smart TVs.

### Contexto

A primeira versão foi pensada para rodar diretamente no navegador das Smart TVs, com foco em simplicidade e leveza.

### Limitação identificada

Durante os testes, navegadores de Smart TVs, especialmente LG, passaram a apresentar bloqueios de autoplay, inviabilizando a operação automática sem intervenção manual.

---

## 2026-05 — Decisão de infraestrutura

### Implementado

- Criação de VM para hospedar o sistema.
- Publicação do sistema em ambiente próprio.
- Uso de PM2 para manter o backend Node.js em execução.
- Configuração de Cloudflare Tunnel.
- Uso inicial do domínio `painelribas.com.br`.

### Impacto

A solução deixou de depender de hospedagem estática e passou a rodar em ambiente controlado, com backend próprio, suporte a uploads e maior estabilidade.

---

## 2026-05 — Fase 2: Dashboard administrativa

### Implementado

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

### Impacto

O sistema passou a permitir gerenciamento dos conteúdos sem edição manual de arquivos.

---

## 2026-05 — Agendamento, prioridade e recorrência

### Implementado

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

### Impacto

A programação das mídias passou a ser mais inteligente, permitindo campanhas temporárias, conteúdos urgentes e repetição controlada.

---

## 2026-05 — Upload em partes/chunks

### Implementado

- Upload de arquivos grandes em partes.
- Envio sequencial de chunks.
- Junção dos chunks no backend.
- Feedback visual de progresso.
- Registro da mídia após finalização.
- Atualização automática da playlist após upload.

### Contexto

A implementação foi necessária devido a limitações de upload em ambiente com Cloudflare gratuito e ao tamanho variável dos vídeos institucionais.

### Impacto

O sistema passou a suportar vídeos maiores com mais estabilidade.

---

## 2026-05 — Backups automáticos

### Implementado

- Backup automático de `midia-config.json`.
- Backup automático de `playlist.json`.
- Comparação para evitar backups desnecessários.
- Limite de backups por tipo.
- Limpeza automática de backups antigos.
- Listagem de backups na dashboard administrativa.

### Impacto

A configuração das mídias e a playlist passaram a ter proteção contra perdas acidentais.

---

## 2026-05 — Usuários e permissões

### Implementado

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

### Impacto

O sistema passou a ter controle administrativo mais seguro e preparado para múltiplos operadores.

---

## 2026-05 — Logs de auditoria

### Implementado

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

### Impacto

O sistema passou a registrar ações sensíveis, trazendo rastreabilidade e mais governança.

---

## 2026-05 — Melhorias visuais e de usabilidade

### Implementado

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

### Impacto

A dashboard passou a ter aparência mais profissional, consistente e amigável.

---

## 2026-05 — Filtros avançados da biblioteca

### Implementado

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

### Impacto

A biblioteca ficou mais previsível e profissional, evitando filtros aplicados acidentalmente.

---

## 2026-05 — Deploy e operação na VM

### Estado atual

- Sistema rodando na VM em `C:\tv-v2\tv`.
- Processo PM2 chamado `painel-tv-v2`.
- Branch em produção: `fix-admin-funcionalidades`.
- Script principal: `server.js`.
- Node.js em execução via PM2.
- Cloudflare Tunnel ativo.
- Domínio em uso: `painelribas.com.br`.

### Fluxo operacional

```powershell
cd c:\tv-v2\tv
git pull
pm2 restart painel-tv-v2
pm2 status
pm2 save
```

---

## 2026-05 — Documentação do projeto

### Implementado

Criação da pasta `docs/` com documentação inicial:

- `CONTEXTO_PROJETO.md`;
- `DEPLOY_VM.md`;
- `CHECKLIST_FASE_2.md`;
- `ARQUITETURA.md`;
- `DECISOES_TECNICAS.md`;
- `ROADMAP.md`;
- `HISTORICO_PROJETO.md`;
- `CHANGELOG.md`.

### Impacto

A documentação passou a registrar contexto, arquitetura, decisões, histórico, deploy e evolução do sistema, reduzindo dependência do histórico de conversa.

---

---

## 2026-05 — Integração entre prioridade e repetição

### Implementado

- Ajuste conceitual entre prioridade e recorrência das mídias.
- Prioridade Normal passa a manter a mídia sem repetição.
- Prioridade Alta libera o seletor de repetição e sugere repetição a cada 6 mídias.
- Prioridade Urgente libera o seletor de repetição e sugere repetição a cada 3 mídias.
- O controle de repetição passou a ser exibido apenas quando fizer sentido operacional.
- O comportamento foi aplicado tanto para imagens quanto para vídeos.
- O badge de prioridade passou a atualizar visualmente junto com a configuração da mídia.

### Impacto

A interface ficou mais lógica para o usuário, reduzindo a confusão entre “prioridade” e “repetição”.

A prioridade agora orienta a frequência de exibição, enquanto o campo de repetição permite ajuste fino quando a mídia for marcada como Alta ou Urgente.

---

## 2026-05 — Refinamento de prioridade e recorrência

### Ajustes implementados

- Removida a opção "Não repetir" para mídias com prioridade Alta ou Urgente.
- Prioridades Alta/Urgente agora obrigam uma recorrência válida.
- Prioridade Normal mantém recorrência desativada.
- Campo de repetição passou a respeitar melhor o conceito de prioridade.
- Sugestões automáticas de recorrência foram refinadas:
  - Alta → "A cada 6 mídias"
  - Urgente → "A cada 3 mídias"
- Ajustada largura visual do select de repetição.
- Melhorado comportamento visual do campo de recorrência.

### Resultado

A interface ficou mais coerente conceitualmente, reduzindo ambiguidades entre prioridade e repetição.

Agora a prioridade influencia diretamente a frequência operacional da mídia na playlist.

## Próximos registros esperados

Próximas entradas deste changelog deverão registrar:

- criação do documento executivo;
- criação do manual administrativo;
- criação do guia de testes;
- refinamentos visuais finais;
- responsividade/mobile;
- refatoração futura;
- merge da documentação na branch funcional;
- fechamento oficial da Fase 2.

---

## 2026-05 — Refinamento do status Ativo/Inativo

### Implementado

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

### Impacto

A operação ficou mais simples e intuitiva para o usuário administrativo.

Como Ativo/Inativo é uma ação de alternância simples, o próprio clique passou a persistir a mudança, evitando a necessidade de um botão adicional de salvamento para uma ação reversível.

Isso reduz confusão na interface, melhora a velocidade de operação e mantém o botão "Salvar alterações" focado apenas em edições que exigem mais atenção.

---

## 2026-05 — Sincronização rápida da playlist

### Implementado

- Backend passou a revalidar/publicar a playlist automaticamente a cada 5 segundos.
- Player passou a sincronizar silenciosamente a playlist a cada 5 segundos.
- Mídias agendadas passam a entrar na programação com atraso reduzido após atingir o horário configurado.
- Alterações feitas no painel administrativo são refletidas no player com menor tempo de espera.

### Impacto

A atualização da programação ficou mais ágil.

Essa decisão melhora principalmente o uso de mídias com período de exibição, campanhas agendadas e conteúdos que precisam entrar ou sair da playlist em horário próximo ao definido no painel.