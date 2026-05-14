# Roadmap — Painel Ribas

## 1. Objetivo deste documento

Este documento registra a evolução planejada do Painel Ribas.

Ele serve para organizar:

- pendências;
- melhorias futuras;
- próximas fases;
- ideias levantadas durante o desenvolvimento;
- itens que não são urgentes, mas agregam valor ao sistema.

---

## 2. Estado atual

O sistema encontra-se em Fase 2 avançada.

Já possui:

- player funcional;
- dashboard administrativa;
- login;
- upload;
- upload em partes;
- biblioteca de mídias;
- filtros refinados;
- agendamento;
- prioridade;
- recorrência;
- playlist automática;
- backups;
- usuários;
- permissões;
- logs de auditoria;
- deploy na VM;
- acesso via domínio.

---

## 3. Prioridade atual

A prioridade atual é:

1. estabilizar a Fase 2;
2. testar todas as funcionalidades;
3. documentar o sistema;
4. preparar apresentação para chefia/prefeitura;
5. registrar melhorias futuras;
6. só depois iniciar refatorações maiores.

---

## 4. Fase 2 — Fechamento

## Objetivo

Consolidar a dashboard administrativa e garantir que o sistema esteja funcional, apresentável e seguro para uso inicial.

## Itens principais

- [x] Login administrativo.
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
- [x] Perfis.
- [x] Logs de auditoria.
- [x] Exclusão de usuário por superadmin.
- [x] Deploy na VM.
- [x] Documentação inicial.

## Pendências da Fase 2

- [ ] Testar todas as funcionalidades em produção.
- [ ] Revisar popover de detalhes em telas pequenas.
- [ ] Revisar console do navegador.
- [ ] Criar documento executivo.
- [ ] Criar manual de uso.
- [ ] Validar configuração final do player.
- [ ] Validar fluxo de operação com usuário real.

---

## 5. Fase 3 — Documentação e entrega institucional

## Objetivo

Preparar o sistema para apresentação formal e uso assistido.

## Itens planejados

- [ ] Criar manual do administrador.
- [ ] Criar guia rápido de uso.
- [ ] Criar documento executivo para chefe/prefeito.
- [ ] Criar anexo técnico.
- [ ] Criar checklist de entrega.
- [ ] Criar roteiro de apresentação.
- [ ] Registrar benefícios institucionais.
- [ ] Registrar economia gerada pela solução própria.
- [ ] Registrar próximos passos recomendados.

---

## 6. Fase 4 — Refinos visuais e responsividade

## Objetivo

Aprimorar experiência de uso e adaptar melhor a dashboard para diferentes telas.

## Itens planejados

- [ ] Revisar responsividade da dashboard.
- [ ] Adaptar melhor para telas menores.
- [ ] Melhorar experiência em notebook.
- [ ] Avaliar uso em tablet.
- [ ] Revisar espaçamentos.
- [ ] Revisar popovers em telas pequenas.
- [ ] Revisar modais em telas pequenas.
- [ ] Melhorar usabilidade de filtros em mobile.
- [ ] Melhorar disposição dos cards de mídia em telas estreitas.

---

## 7. Fase 5 — Refatoração técnica

## Objetivo

Organizar melhor o código após estabilização funcional.

## Itens planejados

### CSS

- [ ] Refatorar `admin.css`.
- [ ] Agrupar estilos por componente.
- [ ] Remover regras duplicadas.
- [ ] Reduzir uso de `!important`.
- [ ] Padronizar espaçamentos.
- [ ] Padronizar botões.
- [ ] Padronizar modais.
- [ ] Separar estilos por área, se necessário.

### JavaScript do admin

- [ ] Modularizar `admin.js`.
- [ ] Separar lógica de usuários.
- [ ] Separar lógica de mídias.
- [ ] Separar lógica de filtros.
- [ ] Separar lógica de upload.
- [ ] Separar lógica de logs.
- [ ] Separar helpers/utilitários.
- [ ] Reduzir tamanho do arquivo principal.

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

---

## 8. Fase 6 — Monitoramento de players

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
- [ ] Criar painel de saúde das telas.

## Benefícios

- Saber se uma TV parou.
- Reduzir necessidade de checagem manual.
- Melhorar suporte.
- Gerar confiança na operação.

---

## 9. Fase 7 — Múltiplas telas/unidades

## Objetivo

Permitir configurar programações diferentes por local.

## Ideias

- [ ] Cadastrar telas.
- [ ] Cadastrar unidades.
- [ ] Criar grupos de telas.
- [ ] Vincular playlist por tela.
- [ ] Vincular playlist por unidade.
- [ ] Gerar URL específica por player.
- [ ] Permitir campanhas gerais e campanhas locais.

## Exemplo futuro

```txt
/player/ubs-centro
/player/hospital
/player/paco-municipal
```

---

## 10. Fase 8 — Permissões refinadas

## Objetivo

Evoluir o controle de usuários conforme o sistema crescer.

## Ideias

- [ ] Vincular usuário a secretaria.
- [ ] Permitir editor por secretaria.
- [ ] Permitir visualizador por secretaria.
- [ ] Restringir mídias por secretaria.
- [ ] Restringir relatórios por perfil.
- [ ] Criar regras por grupo.
- [ ] Melhorar cadastro de secretarias.

---

## 11. Fase 9 — Relatórios

## Objetivo

Criar relatórios para acompanhamento administrativo.

## Ideias

- [ ] Relatório de mídias cadastradas.
- [ ] Relatório de mídias ativas.
- [ ] Relatório de mídias vencidas.
- [ ] Relatório de mídias agendadas.
- [ ] Relatório de uploads por usuário.
- [ ] Relatório de ações administrativas.
- [ ] Relatório de exibição futura.
- [ ] Exportação em PDF ou CSV.

---

## 12. Fase 10 — Modo comunicado urgente

## Objetivo

Permitir publicar um aviso emergencial que sobreponha a programação normal.

## Ideias

- [ ] Criar opção “comunicado urgente”.
- [ ] Definir prioridade máxima.
- [ ] Exibir comunicado em todas as telas.
- [ ] Definir tempo de validade.
- [ ] Permitir texto + imagem.
- [ ] Registrar log de ativação.
- [ ] Registrar log de remoção.

## Exemplos de uso

- alerta de saúde;
- campanha emergencial;
- aviso institucional urgente;
- mudança de atendimento;
- comunicado de utilidade pública.

---

## 13. Melhorias técnicas futuras

- [ ] Hospedar Font Awesome localmente.
- [ ] Criar arquivos `.example` para configurações.
- [ ] Criar documentação das APIs.
- [ ] Criar guia de instalação local.
- [ ] Criar guia de restauração de backup.
- [ ] Criar rotina de limpeza de chunks antigos.
- [ ] Criar rotina de limpeza de mídias órfãs.
- [ ] Criar validação de espaço em disco.
- [ ] Criar limite/configuração de tamanho por arquivo.
- [ ] Melhorar logs técnicos do servidor.

---

## 14. Melhorias no player

- [ ] Criar modo produção mais limpo.
- [ ] Avaliar ocultar controles nas TVs definitivas.
- [ ] Melhorar comportamento em falha de mídia.
- [ ] Criar fallback visual elegante.
- [ ] Melhorar tela sem playlist.
- [ ] Melhorar tela de erro.
- [ ] Exibir data/hora de última sincronização.
- [ ] Criar identificador visual opcional do player.
- [ ] Melhorar compatibilidade com diferentes navegadores.

---

## 15. Melhorias na dashboard

- [ ] Melhorar responsividade.
- [ ] Criar busca avançada.
- [ ] Melhorar organização dos cards de mídia.
- [ ] Criar visualização compacta.
- [ ] Criar ordenação por colunas.
- [ ] Criar filtros salvos.
- [ ] Criar indicadores de mídia agendada/vencida.
- [ ] Melhorar popover de detalhes.
- [ ] Melhorar experiência de exclusão em lote.

---

## 16. Melhorias na segurança

- [ ] Avaliar expiração de sessão.
- [ ] Avaliar HTTPS e cookies seguros em produção.
- [ ] Avaliar proteção CSRF.
- [ ] Avaliar limitação de tentativas de login.
- [ ] Criar política de senha mais forte.
- [ ] Registrar tentativas de login inválidas.
- [ ] Melhorar controle de IP nos logs.
- [ ] Criar rotina de backup do banco SQLite.

---

## 17. Melhorias de documentação

- [ ] Finalizar `MANUAL_ADMIN.md`.
- [ ] Criar `MANUAL_PLAYER.md`.
- [ ] Criar `DOCUMENTO_EXECUTIVO.md`.
- [ ] Criar `GUIA_INSTALACAO_LOCAL.md`.
- [ ] Criar `GUIA_RESTAURACAO.md`.
- [ ] Criar `API.md`.
- [ ] Atualizar `CHANGELOG.md` a cada bloco de alteração.

---

## 18. Itens fora de escopo no momento

Estes itens não são prioridade agora:

- criar app mobile;
- criar aplicativo nativo para TV;
- migrar para framework frontend;
- migrar imediatamente para banco externo;
- criar sistema complexo de múltiplas playlists antes da entrega inicial;
- refatorar tudo antes de validar a Fase 2.

---

## 19. Critério para considerar a Fase 2 finalizada

A Fase 2 pode ser considerada finalizada quando:

- todas as funcionalidades atuais forem testadas;
- não houver erro crítico no console;
- player estiver funcionando em produção;
- dashboard estiver funcionando em produção;
- upload, edição, filtros e usuários estiverem validados;
- logs estiverem funcionando;
- documentação base estiver criada;
- documento executivo estiver pronto;
- apresentação para chefia estiver preparada.

---

## 20. Observação final

Este roadmap é vivo.

Ele deve ser atualizado sempre que:

- uma fase for concluída;
- uma nova necessidade surgir;
- uma melhoria for implementada;
- uma decisão técnica mudar;
- o sistema evoluir para novos usos.