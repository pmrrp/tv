# Guia de Testes — Painel Ribas

## 1. Objetivo

Este guia organiza os testes manuais necessários para validar o funcionamento do Painel Ribas.

Ele deve ser usado antes de:

- apresentar o sistema;
- fazer deploy;
- considerar a Fase 2 finalizada;
- realizar grandes refatorações.

---

## 2. Ambiente de teste

Testar preferencialmente em:

- ambiente local;
- VM;
- navegador principal usado na Prefeitura;
- navegador alternativo.

Navegadores recomendados para teste:

- Google Chrome;
- Microsoft Edge.

---

## 3. Testes de acesso

- [ ] Acessar `/admin`.
- [ ] Confirmar redirecionamento para login quando não logado.
- [ ] Fazer login com usuário válido.
- [ ] Tentar login com senha incorreta.
- [ ] Confirmar mensagem de erro.
- [ ] Fazer logout.
- [ ] Confirmar encerramento da sessão.
- [ ] Atualizar página após logout e confirmar proteção.

---

## 4. Testes da dashboard

- [ ] Confirmar carregamento do cabeçalho.
- [ ] Confirmar exibição do usuário logado.
- [ ] Confirmar carregamento dos cards de resumo.
- [ ] Confirmar ausência de erro vermelho no console.
- [ ] Confirmar botão de abrir player.
- [ ] Confirmar botão de logout.

---

## 5. Testes de upload

- [ ] Enviar imagem pequena.
- [ ] Enviar vídeo pequeno.
- [ ] Enviar arquivo maior usando chunks.
- [ ] Confirmar barra/progresso de upload.
- [ ] Confirmar mensagem de sucesso.
- [ ] Confirmar mídia na biblioteca.
- [ ] Confirmar atualização da playlist.
- [ ] Confirmar log de upload.

---

## 6. Testes de biblioteca

- [ ] Abrir biblioteca.
- [ ] Confirmar listagem de mídias.
- [ ] Confirmar prévias.
- [ ] Confirmar títulos.
- [ ] Confirmar nomes reais dos arquivos.
- [ ] Confirmar status.
- [ ] Confirmar prioridade.
- [ ] Confirmar período.
- [ ] Confirmar que o botão Detalhes abre o modal de detalhes da mídia.
- [ ] Confirmar que o modal de detalhes exibe dados da mídia.
- [ ] Confirmar que o modal de detalhes fecha pelo X.
- [ ] Confirmar que o modal de detalhes fecha pelo botão Fechar.
- [ ] Confirmar que o modal de detalhes fecha ao clicar fora.
- [ ] Confirmar que o modal de detalhes fecha com ESC.
- [ ] Confirmar que o status Ativo/Inativo exibe ícone visual adequado.
- [ ] Confirmar que o status muda corretamente ao ativar/inativar mídia.

---

## 7. Testes de edição de mídia

- [ ] Alterar título amigável.
- [ ] Confirmar que o botão "Salvar alterações" aparece após alterar o título.
- [ ] Salvar mídia individual.
- [ ] Confirmar mensagem de sucesso.
- [ ] Confirmar atualização da playlist.
- [ ] Alterar prioridade.
- [ ] Alterar recorrência.
- [ ] Alterar período.
- [ ] Confirmar que alterações de configuração exigem salvamento.
- [ ] Confirmar log de edição.

---

## 7.1 Testes de alterações pendentes

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

## 7.1 Testes da TAG Ativo/Inativo

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

## 8. Testes de período de exibição

- [ ] Definir mídia com início futuro.
- [ ] Confirmar que ela aparece como agendada.
- [ ] Definir mídia vencida.
- [ ] Confirmar que ela sai da playlist.
- [ ] Definir período indefinido.
- [ ] Confirmar que permanece ativa.
- [ ] Confirmar rotina automática de atualização.

---

## 8.1 Testes de prioridade e repetição

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

## 8.2 Testes do select premium de repetição

- [ ] Alterar prioridade de uma mídia para Alta.
- [ ] Confirmar que o campo de repetição aparece.
- [ ] Confirmar sugestão automática "A cada 6 mídias".
- [ ] Abrir o select premium de repetição.
- [ ] Escolher outro valor.
- [ ] Confirmar que o card marca alteração pendente.
- [ ] Salvar a mídia.
- [ ] Recarregar a página.
- [ ] Confirmar que o valor salvo permanece.
- [ ] Alterar prioridade para Urgente.
- [ ] Confirmar sugestão automática "A cada 3 mídias".
- [ ] Alterar prioridade para Normal.
- [ ] Confirmar que o campo de repetição fica oculto/zerado.

---

## 8.2 Testes de sincronização com alterações pendentes

- [ ] Alterar título amigável de uma mídia sem salvar.
- [ ] Clicar em "Sincronizar".
- [ ] Confirmar que a sincronização é bloqueada.
- [ ] Confirmar que aparece modal de aviso em tom de atenção.
- [ ] Clicar em "Continuar editando".
- [ ] Confirmar que o rascunho permanece na tela.
- [ ] Clicar novamente em "Sincronizar".
- [ ] Clicar em "Salvar alterações" dentro do modal.
- [ ] Confirmar que o fluxo de salvamento é acionado.
- [ ] Confirmar que as alterações são salvas.
- [ ] Confirmar que o botão global "Salvar alterações" desaparece após salvar.
- [ ] Clicar em "Sincronizar" sem alterações pendentes.
- [ ] Confirmar que a biblioteca sincroniza normalmente.

---

## 9. Testes de filtros

- [ ] Abrir filtros.
- [ ] Confirmar que botões não aparecem sem alteração.
- [ ] Selecionar filtro.
- [ ] Confirmar que aparece “Aplicar filtros”.
- [ ] Clicar fora sem aplicar.
- [ ] Confirmar que o rascunho foi descartado.
- [ ] Selecionar filtro novamente.
- [ ] Aplicar filtro.
- [ ] Confirmar contador no botão.
- [ ] Abrir filtros com filtro ativo.
- [ ] Confirmar botão “Limpar filtros”.
- [ ] Limpar filtros.
- [ ] Confirmar listagem completa.

---

## 9.1 Testes de selects premium dos filtros

- [ ] Abrir o popover de filtros.
- [ ] Confirmar que os filtros aparecem com visual premium.
- [ ] Abrir filtro de Status.
- [ ] Selecionar uma opção de Status.
- [ ] Confirmar que o botão "Aplicar filtros" aparece.
- [ ] Abrir filtro de Tipo.
- [ ] Selecionar uma opção de Tipo.
- [ ] Abrir filtro de Período.
- [ ] Selecionar uma opção de Período.
- [ ] Abrir filtro de Prioridade.
- [ ] Selecionar uma opção de Prioridade.
- [ ] Abrir filtro de Repetição.
- [ ] Selecionar uma opção de Repetição.
- [ ] Clicar fora sem aplicar.
- [ ] Confirmar que o rascunho é descartado.
- [ ] Abrir filtros novamente.
- [ ] Confirmar que os selects premium voltaram ao estado aplicado anterior.
- [ ] Selecionar filtros e clicar em "Aplicar filtros".
- [ ] Confirmar que a listagem é filtrada corretamente.
- [ ] Confirmar que o contador de filtros aplicados aparece.
- [ ] Clicar em "Limpar filtros".
- [ ] Confirmar que todos os selects premium voltam ao padrão.

---

## 10. Testes de ordenação

- [ ] Mover mídia para cima.
- [ ] Mover mídia para baixo.
- [ ] Arrastar mídia, se disponível.
- [ ] Confirmar nova ordem.
- [ ] Confirmar atualização da playlist.

---

## 11. Testes de exclusão de mídia

- [ ] Excluir mídia individual.
- [ ] Confirmar modal de confirmação.
- [ ] Cancelar exclusão.
- [ ] Confirmar que mídia permanece.
- [ ] Excluir novamente e confirmar.
- [ ] Confirmar remoção da biblioteca.
- [ ] Confirmar atualização da playlist.
- [ ] Confirmar log de exclusão.

---

## 12. Testes de exclusão em lote

- [ ] Ativar modo seleção.
- [ ] Selecionar múltiplas mídias.
- [ ] Cancelar exclusão em lote.
- [ ] Confirmar que mídias permanecem.
- [ ] Confirmar exclusão em lote.
- [ ] Confirmar remoção.
- [ ] Confirmar log de exclusão em lote.

---

## 13. Testes de usuários

- [ ] Criar usuário.
- [ ] Editar usuário.
- [ ] Resetar senha.
- [ ] Desativar usuário.
- [ ] Ativar usuário.
- [ ] Excluir usuário teste.
- [ ] Confirmar proteção contra autoexclusão.
- [ ] Confirmar proteção contra autodesativação.
- [ ] Confirmar proteção de superadmin.

---

## 14. Testes de perfis

Testar com:

- [ ] superadmin;
- [ ] admin;
- [ ] editor;
- [ ] viewer.

Confirmar:

- [ ] botões visíveis conforme perfil;
- [ ] rotas protegidas no backend;
- [ ] ações proibidas retornam erro;
- [ ] usuários sem permissão não conseguem alterar dados sensíveis.

---

## 15. Testes de logs

- [ ] Fazer login.
- [ ] Fazer logout.
- [ ] Enviar mídia.
- [ ] Editar mídia.
- [ ] Excluir mídia.
- [ ] Criar usuário.
- [ ] Resetar senha.
- [ ] Alterar status.
- [ ] Confirmar registros na tela de auditoria.

---

## 16. Testes do player

- [ ] Abrir player.
- [ ] Confirmar splash inicial.
- [ ] Confirmar carregamento da playlist.
- [ ] Confirmar exibição de imagem.
- [ ] Confirmar exibição de vídeo.
- [ ] Confirmar troca automática.
- [ ] Confirmar loop.
- [ ] Confirmar relógio.
- [ ] Confirmar controles temporários.
- [ ] Confirmar atualização após mudança de playlist.
- [ ] Inativar uma mídia pelo admin e confirmar que ela sai do player após a sincronização.
- [ ] Reativar uma mídia pelo admin e confirmar que ela volta ao player após a sincronização.
- [ ] Agendar uma mídia para horário próximo e confirmar entrada na playlist com atraso reduzido.
- [ ] Confirmar que o player sincroniza a playlist silenciosamente, sem recarregar a página inteira.
- [ ] Confirmar que alterações salvas no admin refletem no player após sincronização automática.
- [ ] Confirmar que sincronização manual não ocorre quando existem alterações pendentes na biblioteca.

---

## 17. Testes de deploy

Na VM:

```powershell
cd c:\tv-v2\tv
git pull
pm2 restart painel-tv-v2
pm2 status
pm2 save
```

Confirmar:

- [ ] processo online;
- [ ] sem erro no PM2;
- [ ] admin acessível;
- [ ] player acessível;
- [ ] console sem erro crítico.

---

## 18. Testes de console

Abrir DevTools e verificar:

- [ ] ausência de erro vermelho;
- [ ] warnings conhecidos não críticos;
- [ ] requisições sem falha;
- [ ] APIs respondendo corretamente.

Warnings conhecidos:

- Font Awesome via CDN pode gerar aviso no Edge relacionado a `cdnjs.cloudflare.com`.

---

## 19. Critério de aprovação

A Fase 2 pode ser considerada validada quando:

- login funcionar;
- dashboard carregar;
- upload funcionar;
- biblioteca funcionar;
- filtros funcionarem;
- playlist atualizar;
- player exibir corretamente;
- usuários funcionarem;
- logs funcionarem;
- permissões forem respeitadas;
- deploy na VM estiver estável.

---

## 20. Observação final

Este guia deve ser usado antes da apresentação e também antes de grandes alterações futuras.

Após refatorações, os testes devem ser repetidos.