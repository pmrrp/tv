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
- [AJUSTE] Ao entrar na página de login, posicionar automaticamente o cursor no campo de usuário/e-mail.
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
- [AJUSTE] Revisar popover de detalhes em telas pequenas, pois pode cortar dependendo do tamanho da tela.
- [AJUSTE] Revisar popovers que ficam cortados quando abrem próximos aos limites do navegador.
- [AJUSTE] Ajustar largura do select de repetição para exibir o texto completo da opção selecionada.
- [AJUSTE] Melhorar tratamento visual de mídias inativas.
- [AJUSTE] Avaliar bloqueio de edição em cards de mídias inativas.
- [AJUSTE] Revisar se o botão "Salvar" deve aparecer de forma mais destacada mesmo em card inativo.
- [AJUSTE] Revisar comportamento de alterações não salvas em campos como repetição e período.
- [AJUSTE] Avaliar se, ao clicar fora ou pressionar ESC, alterações em repetição/período devem ser descartadas como ocorre nos filtros.
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
- [AJUSTE] Revisar comportamento dos botões "Cancelar" e "Aplicar período" no popover de período de exibição.
- [AJUSTE] Fazer os botões de período aparecerem apenas quando houver alteração real no período.
- [AJUSTE] Revisar comportamento do período de exibição ao clicar fora ou pressionar ESC sem aplicar.
- [AJUSTE] Revisar comportamento da repetição ao clicar fora ou pressionar ESC sem salvar.

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
- [ ] Revisar popovers que ficam cortados próximos aos limites do navegador.
- [ ] Ajustar largura do select de repetição.
- [ ] Revisar botões "Cancelar" e "Aplicar período" para aparecerem apenas quando houver alteração real.
- [ ] Revisar comportamento de alterações não salvas em repetição/período.
- [ ] Revisar tratamento visual de mídia inativa.
- [ ] Avaliar bloqueio de edição em mídias inativas.
- [ ] Validar se a configuração do player está adequada para apresentação.
- [ ] Confirmar se `config.json` está com opções corretas para produção/apresentação.
- [ ] Atualizar documentação após os últimos ajustes.
- [ ] Criar documento executivo para chefe/prefeito ao final da estabilização.
- [ ] Gerar PDF executivo final após fechamento da Fase 2.

---

## 18. Fase 3 — Polimento, usabilidade e implantação assistida

- [IDEIA] Implementar drag and drop de upload em tela inteira, com efeito visual mais profissional.
- [IDEIA] Melhorar visual geral dos selects da dashboard.
- [IDEIA] Melhorar visual de datepicker e timepicker.
- [IDEIA] Padronizar aparência dos campos nativos.
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

---

## 19. Backlog técnico

- [BACKLOG] Hospedar Font Awesome localmente para remover dependência de CDN externo e evitar warnings no Edge.
- [BACKLOG] Refatorar `admin.css` após estabilização.
- [BACKLOG] Modularizar `admin.js` após estabilização.
- [BACKLOG] Refatorar `server.js` futuramente em rotas, serviços e utilitários.
- [BACKLOG] Melhorar responsividade/mobile da dashboard.
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