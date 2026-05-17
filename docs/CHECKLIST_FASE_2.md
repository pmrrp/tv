# Checklist — Fase 2 do Painel Ribas

## 1. Objetivo deste checklist

Este checklist registra o estado da Fase 2 do sistema Painel Ribas.

Ele serve para:

- acompanhar o que já foi concluído;
- registrar bugs e ajustes pendentes;
- organizar melhorias futuras;
- apoiar a documentação do projeto;
- preparar a apresentação para chefia/prefeitura;
- evitar perda de contexto durante o desenvolvimento.

---

## 2. Legenda

```txt
[OK]       Implementado e funcionando.
[BUG]      Problema identificado.
[AJUSTE]   Melhoria pequena ou refinamento.
[IDEIA]    Ideia interessante, mas não obrigatória.
[BACKLOG]  Melhoria futura.
[URGENTE]  Precisa resolver antes da apresentação.
```

---

## 3. Login

- [OK] Login administrativo funcionando.
- [OK] Autenticação integrada ao backend.
- [OK] Sessão administrativa funcionando.
- [OK] Redirecionamento para `/admin` após login.
- [OK] Botão de mostrar/ocultar senha.
- [OK] Visual do login ajustado para estilo mais limpo.
- [OK] Card/modal de login com padrão arredondado.
- [OK] Faixa superior animada com as cores da identidade visual.
- [OK] Logo institucional aplicado.
- [OK] Mensagens de erro no login.
- [OK] Ao entrar na página de login, posicionar automaticamente o cursor no campo de usuário/e-mail.
- [BACKLOG] Implementar recuperação de senha por e-mail.
- [BACKLOG] Implementar logout automático após determinado tempo de inatividade.
- [BACKLOG] Avaliar limite de sessões/instâncias simultâneas por usuário.
- [BACKLOG] Caso o limite de sessões seja atingido, exibir acessos ativos e permitir desconectar sessões antigas.

---

## 4. Header / Cabeçalho administrativo

- [OK] Cabeçalho com identidade visual da Prefeitura.
- [OK] Logo institucional exibido.
- [OK] Texto do sistema exibido.
- [OK] Botão de abrir player.
- [OK] Botão de logout.
- [OK] Saudação do usuário logado.
- [OK] Menu do usuário funcionando.
- [OK] Menu do usuário fecha ao clicar fora.

---

## 5. Cards de resumo

- [OK] Cards carregam dados do backend.
- [OK] Total de mídias cadastradas.
- [OK] Total de mídias ativas.
- [OK] Mídias dentro da validade.
- [OK] Mídias agendadas.
- [OK] Prioridades.
- [OK] Recorrências.
- [OK] Itens publicados na playlist.
- [OK] Última atualização da playlist.
- [OK] Padronização visual dos cards.

---

## 6. Upload de mídias

- [OK] Upload de imagens funcionando.
- [OK] Upload de vídeos funcionando.
- [OK] Upload em partes/chunks implementado.
- [OK] Suporte a arquivos grandes.
- [OK] Tipos de vídeo aceitos indicados na interface.
- [OK] Tipos de imagem aceitos indicados na interface.
- [OK] Drag and drop básico no campo de upload.
- [OK] Nome do arquivo selecionado aparece na interface.
- [OK] Feedback visual durante envio.
- [OK] Upload registra mídia no final da lista.
- [OK] Upload atualiza playlist automaticamente.
- [OK] Upload registra log de auditoria.
- [IDEIA] Implementar drag and drop de upload em tela inteira, com efeito visual semelhante a serviços como Convertio.
- [IDEIA] Permitir soltar arquivos em qualquer ponto da tela quando o modo de upload estiver ativo.

---

## 7. Biblioteca de mídias

- [OK] Biblioteca recolhida/carregada corretamente.
- [OK] Biblioteca aberta funcionando.
- [OK] Listagem de mídias funcionando.
- [OK] Cards de mídia renderizados corretamente.
- [OK] Mídias exibem título amigável.
- [OK] Mídias exibem nome real do arquivo.
- [OK] Mídias exibem tipo.
- [OK] Mídias exibem status.
- [OK] Mídias exibem prioridade.
- [OK] Mídias exibem período de exibição.
- [OK] Mídias exibem recorrência.
- [OK] Mídias exibem detalhes.
- [OK] Mídias podem ser ativadas/desativadas.
- [OK] Mídias podem ser renomeadas por título amigável.
- [OK] Mídias podem ser salvas individualmente.
- [OK] Mídias podem ser salvas em lote.
- [OK] Mídias podem ser excluídas individualmente.
- [OK] Mídias podem ser excluídas em lote.
- [OK] Mídias podem ser reordenadas.
- [OK] Alça de arraste/reordenação funcionando.
- [OK] Substituir popover de detalhes da mídia por modal no padrão visual do sistema.
- [OK] Corrigir problema de detalhes da mídia cortando em telas pequenas ou próximo às bordas do navegador.
- [OK] Modal de detalhes exibe informações técnicas e operacionais da mídia.
- [OK] Modal de detalhes pode ser fechado pelo botão Fechar, pelo X, por clique fora e pela tecla ESC.
- [OK] Ajustar largura do select de repetição para exibir o texto completo da opção selecionada.
- [OK] Melhorar tratamento visual de mídias inativas.
- [OK] Bloquear edição de configurações em cards de mídias inativas.
- [OK] Manter ações essenciais disponíveis em mídia inativa: Ativar/Inativar, Detalhes, Excluir e seleção em lote.
- [OK] Manter botão Excluir visualmente ativo mesmo quando o card estiver inativo.
- [OK] Fazer a TAG Ativo/Inativo funcionar como switch com salvamento automático.
- [OK] Evitar exibição do botão "Salvar alterações" apenas por ativar/inativar mídia.
- [AJUSTE] Revisar comportamento de alterações não salvas em campos como repetição e período.
- [AJUSTE] Avaliar se, ao clicar fora ou pressionar ESC, alterações em repetição devem ser descartadas como ocorre nos filtros.
- [AJUSTE] Melhorar posicionamento/experiência do modal de detalhes no mobile durante a Fase 3.
- [AJUSTE] Revisar popovers restantes que ficam cortados quando abrem próximos aos limites do navegador.

- [IDEIA] Melhorar visual geral dos selects da dashboard.
- [IDEIA] Melhorar visual de datepicker e timepicker.
- [IDEIA] Padronizar aparência dos campos nativos que ainda parecem crus no navegador.

---

## 8. Filtros da biblioteca

- [OK] Filtro por busca textual.
- [OK] Busca por título amigável.
- [OK] Busca por nome real do arquivo.
- [OK] Busca por tipo de arquivo.
- [OK] Filtro por status.
- [OK] Filtro por tipo.
- [OK] Filtro por período.
- [OK] Filtro por prioridade.
- [OK] Filtro por recorrência/repetição.
- [OK] Combinação de múltiplos filtros.
- [OK] Botão "Aplicar filtros".
- [OK] Botão "Limpar filtros".
- [OK] Contador de filtros aplicados.
- [OK] Filtros não são mais aplicados automaticamente a cada clique.
- [OK] Rascunho de filtro é descartado ao clicar fora sem aplicar.
- [OK] Rascunho de filtro é descartado ao apertar ESC sem aplicar.
- [OK] Popover de filtros fecha após aplicar.
- [OK] Popover de filtros fecha após limpar.
- [OK] Botões aparecem apenas quando necessário.
- [OK] Selects dos filtros da biblioteca convertidos para visual premium.
- [OK] Select premium implementado para filtro de status.
- [OK] Select premium implementado para filtro de tipo.
- [OK] Select premium implementado para filtro de período.
- [OK] Select premium implementado para filtro de prioridade.
- [OK] Select premium implementado para filtro de repetição/recorrência.
- [OK] Selects premium dos filtros preservam o comportamento de rascunho.
- [OK] Selects premium dos filtros respeitam o botão "Aplicar filtros".
- [OK] Selects premium dos filtros respeitam o botão "Limpar filtros".
- [OK] Selects premium dos filtros são sincronizados ao aplicar, limpar ou descartar rascunho.

---

## 9. Agendamento, validade, prioridade e recorrência

- [OK] Período de exibição implementado.
- [OK] Data/hora inicial implementada.
- [OK] Data/hora final implementada.
- [OK] Opção de período indefinido.
- [OK] Mídias futuras ficam agendadas.
- [OK] Mídias vencidas saem automaticamente da playlist.
- [OK] Rotina automática verifica validade.
- [OK] Prioridade normal.
- [OK] Prioridade alta.
- [OK] Prioridade urgente.
- [OK] Recorrência/repetição configurável.
- [OK] Playlist respeita validade.
- [OK] Playlist respeita prioridade.
- [OK] Playlist respeita recorrência.
- [OK] Prioridade integrada visualmente ao controle de repetição.
- [OK] Prioridade Normal oculta repetição e mantém a mídia sem recorrência.
- [OK] Prioridade Alta libera repetição e sugere "A cada 6 mídias".
- [OK] Prioridade Urgente libera repetição e sugere "A cada 3 mídias".
- [OK] Repetição funciona para imagens e vídeos.
- [OK] Opção "Não repetir" removida para prioridades Alta e Urgente.
- [OK] Prioridades Alta/Urgente agora exigem recorrência válida.
- [OK] Prioridade Normal mantém repetição oculta e recorrência zerada.
- [OK] Sugestões automáticas de recorrência ajustadas conforme prioridade.
- [OK] Botões "Cancelar" e "Aplicar período" aparecem apenas quando há alteração real no período.
- [OK] Rascunho do período de exibição é descartado ao clicar fora sem aplicar.
- [OK] Rascunho do período de exibição é descartado ao pressionar ESC sem aplicar.
- [OK] Repetição permanece como alteração pendente normal, protegida pelos modais de saída/sincronização.
- [OK] Select de repetição convertido para componente premium.
- [OK] Select premium de repetição usa portal global para evitar conflito visual com cards.
- [OK] Prioridade Alta sugere automaticamente repetição "A cada 6 mídias".
- [OK] Prioridade Urgente sugere automaticamente repetição "A cada 3 mídias".
---

## 10. Playlist

- [OK] Playlist é gerada automaticamente.
- [OK] Playlist é atualizada após upload.
- [OK] Playlist é atualizada após edição.
- [OK] Playlist é atualizada após exclusão.
- [OK] Playlist é atualizada após reordenação.
- [OK] Playlist ignora mídias inativas.
- [OK] Playlist ignora mídias fora da validade.
- [OK] Playlist usa título amigável.
- [OK] Playlist diferencia vídeo e imagem.
- [OK] Duração de imagens é respeitada.
- [OK] Vídeos usam duração original no player.
- [OK] Arquivo `playlist.json` é publicado para o player.
- [OK] Backend revalida automaticamente a playlist a cada 5 segundos.
- [OK] Player sincroniza silenciosamente a playlist a cada 5 segundos.
- [OK] Mídias agendadas entram na playlist com atraso reduzido em relação ao horário configurado.
- [OK] Sincronização manual da biblioteca é bloqueada quando existem alterações pendentes.
- [OK] O usuário precisa salvar as alterações antes de sincronizar manualmente.
- [OK] O botão Sincronizar preserva o estado da tela quando há rascunhos não salvos.

---

## 10.1 Status Ativo/Inativo das mídias

- [OK] TAG Ativo/Inativo funciona como controle de alternância imediata.
- [OK] Clique na TAG salva automaticamente o novo estado no backend.
- [OK] Alteração de Ativo/Inativo não exige botão "Salvar alterações".
- [OK] Ao inativar uma mídia, ela é removida automaticamente da playlist.
- [OK] Ao reativar uma mídia, ela volta a poder entrar na playlist conforme validade, prioridade e ordem.
- [OK] Mídia inativa bloqueia edição de nome, duração, período, prioridade e repetição.
- [OK] Mídia inativa permite reativação.
- [OK] Mídia inativa permite exclusão.
- [OK] Mídia inativa permite visualização de detalhes.
- [OK] Mídia inativa permite seleção em lote.
- [OK] Botão Excluir permanece visualmente ativo em card inativo.
- [OK] Filtros são reaplicados após alteração de status.
- [OK] Card retorna ao estado anterior caso ocorra erro ao salvar o status.

---

## 11. Backups

- [OK] Backup automático de `midia-config.json`.
- [OK] Backup automático de `playlist.json`.
- [OK] Limite de backups por tipo.
- [OK] Limpeza automática de backups antigos.
- [OK] Backups são criados somente quando há alteração.
- [OK] Dashboard lista backups administrativos.

---

## 12. Usuários do sistema

- [OK] Listagem de usuários.
- [OK] Criação de usuários.
- [OK] Edição de usuários.
- [OK] Reset de senha.
- [OK] Ativar/desativar usuário.
- [OK] Exclusão de usuário por SUPERADMIN.
- [OK] Proteção contra autoexclusão.
- [OK] Proteção contra autodesativação.
- [OK] Proteção contra admin comum alterar superadmin.
- [OK] Proteção contra admin comum promover usuário para superadmin.
- [OK] Perfis implementados: superadmin, admin, editor, viewer.
- [OK] Botões aparecem conforme permissão visual.
- [OK] Backend valida permissões reais.
- [OK] Exclusão de usuário registra log de auditoria.
- [OK] Modal padrão reaproveitado para confirmação de exclusão.

---

## 13. Modais

- [OK] Modal de usuário.
- [OK] Modal de reset de senha.
- [OK] Modal de alteração de status.
- [OK] Modal genérico de confirmação.
- [OK] Modal padrão reaproveitado para exclusão de usuário.
- [OK] Modais fecham por botão.
- [OK] Modais fecham ao clicar fora.
- [OK] Modais fecham com ESC.
- [OK] Modais seguem padrão visual da dashboard.

---

## 13.1 Modais e alterações pendentes

- [OK] Modal de detalhes da mídia implementado.
- [OK] Popover antigo de detalhes foi desativado para evitar cortes em telas pequenas.
- [OK] Modal de saída com alterações pendentes implementado para ações controláveis pelo sistema.
- [OK] Ao tentar sair pelo botão "Sair" com alterações pendentes, o sistema exibe modal próprio.
- [OK] Ao tentar atualizar com F5 ou Ctrl+R com alterações pendentes, o sistema exibe modal próprio.
- [OK] Alerta nativo do navegador mantido como fallback para fechar aba, botão atualizar do navegador, barra de endereço e navegação externa.
- [OK] Modal de sincronização bloqueia atualização manual da biblioteca quando há alterações pendentes.
- [OK] Botão Sincronizar não recarrega a biblioteca enquanto houver rascunhos não salvos.
- [OK] Modal de sincronização permite continuar editando ou salvar alterações.
- [OK] Modal de sincronização usa estilo visual de aviso/atenção.
- [OK] Modal de sincronização evita estado visual inconsistente entre rascunho da tela e dados salvos no backend.

---

## 14. Logs de auditoria

- [OK] Estrutura de logs criada no banco.
- [OK] Registro de login.
- [OK] Registro de logout.
- [OK] Registro de upload.
- [OK] Registro de edição de mídia.
- [OK] Registro de exclusão de mídia.
- [OK] Registro de exclusão em lote.
- [OK] Registro de movimentação/reordenação.
- [OK] Registro de criação de usuário.
- [OK] Registro de edição de usuário.
- [OK] Registro de alteração de status.
- [OK] Registro de reset de senha.
- [OK] Registro de exclusão de usuário.
- [OK] Tela de logs no admin.
- [OK] Logs visíveis para superadmin.

---

## 15. Player

- [OK] Player funcionando.
- [OK] Player roda via navegador.
- [OK] Player carrega `playlist.json`.
- [OK] Player exibe vídeos.
- [OK] Player exibe imagens.
- [OK] Player faz loop.
- [OK] Player troca automaticamente entre mídias.
- [OK] Player possui splash inicial.
- [OK] Player possui relógio.
- [OK] Player possui controles temporários.
- [OK] Player possui fade/transição.
- [OK] Player sincroniza alterações da playlist.
- [OK] Player funciona nos PCs conectados às TVs.
- [OK] Favicon do player atualizado.

---

## 16. Deploy / VM

- [OK] Sistema rodando na VM.
- [OK] Projeto localizado em `c:\tv-v2\tv`.
- [OK] Processo PM2 configurado como `painel-tv-v2`.
- [OK] Deploy via `git pull`.
- [OK] Restart via `pm2 restart painel-tv-v2`.
- [OK] Status conferido via `pm2 status`.
- [OK] PM2 salvo via `pm2 save`.
- [OK] Sistema acessível via `painelribas.com.br`.
- [OK] Cloudflare Tunnel em uso.

---

## 17. Pendências recomendadas antes da apresentação

- [ ] Testar todas as funcionalidades em produção.
- [ ] Revisar console do navegador.
- [ ] Revisar usabilidade geral da dashboard.
- [ ] Revisar popover de detalhes em tela pequena.
- [ ] Validar se a configuração do player está adequada para apresentação.
- [ ] Confirmar se `config.json` está com opções corretas para produção/apresentação.
- [ ] Atualizar documentação após os últimos ajustes.
- [ ] Criar documento executivo para chefe/prefeito ao final da estabilização.
- [ ] Gerar PDF executivo final após fechamento da Fase 2.

---

## 18. Fase 3 — Polimento, usabilidade e implantação assistida

- [IDEIA] Implementar drag and drop de upload em tela inteira, com efeito visual mais profissional.
- [IDEIA] Melhorar visual de datepicker e timepicker.
- [IDEIA] Refinar datepicker/timepicker com componente mais premium.
- [IDEIA] Padronizar aparência dos campos nativos restantes.
- [IDEIA] Criar área de ajuda/tutoriais dentro do admin.
- [IDEIA] Criar cards de tutorial com texto explicativo.
- [IDEIA] Avaliar uso de vídeos curtos ou mini previews para demonstrar operações do sistema.
- [IDEIA] Criar usuário de treinamento/teste para gravação dos tutoriais.
- [IDEIA] Gravar tutoriais em vídeo usando OBS Studio.
- [IDEIA] Criar manual visual com prints e textos objetivos.
- [IDEIA] Melhorar responsividade/mobile da dashboard.
- [IDEIA] Fazer polimento visual geral da interface administrativa.
- [IDEIA] Refinar experiência de uso para usuários não técnicos.
- [IDEIA] Revisar textos explicativos da interface.
- [IDEIA] Melhorar microinterações e feedbacks visuais.
- [IDEIA] Refinar posicionamento e experiência dos modais no mobile.

---

## 19. Backlog técnico

- [BACKLOG] Hospedar Font Awesome localmente para remover dependência de CDN externo e evitar warnings no Edge.
- [BACKLOG] Refatorar `admin.css` após estabilização.
- [BACKLOG] Modularizar `admin.js` após estabilização.
- [BACKLOG] Refatorar `server.js` futuramente em rotas, serviços e utilitários.
- [BACKLOG] Melhorar responsividade/mobile da dashboard.
- [BACKLOG] Refinar posicionamento e experiência dos modais no mobile.
- [BACKLOG] Criar rotina de limpeza de chunks antigos.
- [BACKLOG] Criar rotina de limpeza de mídias órfãs.
- [BACKLOG] Criar validação de espaço em disco.
- [BACKLOG] Melhorar logs técnicos do servidor.
- [BACKLOG] Criar documentação técnica de APIs.
- [BACKLOG] Melhorar documentação técnica continuamente.

---

## 20. Backlog de produto futuro

- [BACKLOG] Criar tela de status das TVs/players.
- [BACKLOG] Criar monitoramento online/offline dos players.
- [BACKLOG] Criar grupos de telas/unidades.
- [BACKLOG] Criar playlists por unidade ou grupo de telas.
- [BACKLOG] Criar permissões mais refinadas por secretaria.
- [BACKLOG] Criar relatório de exibição.
- [BACKLOG] Criar modo de comunicado urgente.
- [BACKLOG] Criar dashboard gerencial.
- [BACKLOG] Criar analytics de exibição.
- [BACKLOG] Criar cache/offline para players.
- [BACKLOG] Criar manual completo para usuários administrativos.
- [BACKLOG] Avaliar modelo white-label para uso futuro em outros contextos/projetos.

---

## 21. Observação sobre refatoração

A refatoração geral do código deve ser feita somente depois que:

- a Fase 2 estiver estável;
- o sistema tiver sido apresentado;
- os refinos visuais principais estiverem concluídos;
- a responsividade for definida;
- a documentação base estiver pronta.

Neste momento, a prioridade é manter o sistema funcionando, testado e apresentável.

---

## 22. Observação sobre validação do checklist

Este checklist deve ser revisado após uma rodada completa de testes manuais no sistema.

A revisão deve considerar:

- testes no ambiente local;
- testes na VM;
- testes no navegador usado na apresentação;
- testes no player;
- testes com usuário superadmin;
- testes com usuário admin/editor/viewer;
- testes de permissões;
- testes de console do navegador;
- testes de deploy.

Sempre que uma nova melhoria for implementada, este arquivo deve ser atualizado para manter o histórico real da Fase 2.