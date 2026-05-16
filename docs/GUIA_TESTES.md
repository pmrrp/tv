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
- [ ] Confirmar detalhes.

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