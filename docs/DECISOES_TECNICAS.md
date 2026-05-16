# Decisões Técnicas — Painel Ribas

## 1. Objetivo deste documento

Este documento registra decisões técnicas importantes tomadas durante o desenvolvimento do Painel Ribas.

Ele existe para explicar:

- por que determinadas tecnologias foram escolhidas;
- por que certas soluções foram adotadas;
- quais limitações foram consideradas;
- quais decisões podem ser revistas no futuro.

---

## 2. Desenvolvimento de solução própria

## Decisão

Desenvolver uma solução própria de digital signage para a Prefeitura.

## Motivos

- Evitar contratação imediata de software pago.
- Evitar dependência de licenciamento.
- Ganhar agilidade na entrega.
- Aproveitar estrutura já disponível.
- Adaptar a solução à realidade da Prefeitura.
- Criar autonomia técnica interna.

## Observação

A solução própria também permite demonstrar capacidade técnica do setor de tecnologia, gerando valor institucional e reduzindo dependência de fornecedores externos.

---

## 3. Uso de sistema web

## Decisão

Construir o sistema como aplicação web, acessível via navegador.

## Motivos

- Computadores conectados às TVs podem abrir o player pelo navegador.
- Não há necessidade de instalar aplicativo nativo.
- O acesso é simples: basta abrir uma URL.
- Facilita manutenção e atualização.
- Permite centralizar o controle no servidor.

## Consequência

O player e a dashboard são servidos pelo mesmo backend Node.js.

---

## 4. Uso de computadores fixos nas TVs

## Decisão

Utilizar computadores conectados às TVs para exibir o player.

## Motivos

- Mais estabilidade que depender apenas do navegador interno de Smart TVs.
- Melhor compatibilidade com vídeos.
- Mais controle operacional.
- Facilidade para abrir navegador, atualizar e reiniciar.
- Aproveitamento de equipamentos disponíveis.

## Observação

Inicialmente foi considerada a possibilidade de usar somente o navegador das Smart TVs, mas os computadores fixos tornam a operação mais previsível.

---

## 5. Node.js + Express

## Decisão

Utilizar Node.js com Express no backend.

## Motivos

- Backend leve.
- Fácil criação de APIs.
- Boa integração com arquivos locais.
- Simplicidade para servir player e admin.
- Compatível com PM2.
- Adequado para MVP avançado.

## Observação

O backend está atualmente concentrado em `server.js`. Futuramente pode ser separado em módulos.

---

## 6. SQLite

## Decisão

Utilizar SQLite para usuários, secretarias e logs.

## Motivos

- Simplicidade de implantação.
- Não exige servidor de banco separado.
- Suficiente para o volume inicial do projeto.
- Fácil backup.
- Boa integração local com Node.js.

## Uso atual

O banco SQLite armazena:

- usuários;
- secretarias;
- logs de auditoria.

## Observação

As configurações das mídias ainda ficam em JSON, enquanto usuários/logs ficam em banco.

---

## 7. Arquivo JSON para configurações das mídias

## Decisão

Manter configurações das mídias em `data/midia-config.json`.

## Motivos

- Simplicidade.
- Facilidade de leitura e manutenção.
- Boa adequação ao volume inicial.
- Permite backup simples.
- Evita complexidade desnecessária no MVP.

## Informações salvas

- ativo/inativo;
- duração;
- ordem;
- prioridade;
- recorrência;
- título;
- início;
- fim.

## Possível revisão futura

Se o volume crescer muito, as configurações das mídias podem migrar para SQLite.

---

## 8. Playlist em JSON

## Decisão

Gerar `playlist.json` para ser consumido pelo player.

## Motivos

- Player pode carregar uma estrutura simples.
- Fácil depuração.
- Fácil cache e sincronização.
- Baixo custo de processamento no player.
- Permite separar lógica administrativa da exibição.

## Observação

O backend aplica regras de validade, prioridade e recorrência antes de publicar a playlist.

---

## 9. Upload em partes/chunks

## Decisão

Implementar upload em partes para arquivos grandes.

## Motivos

- Vídeos institucionais podem ser pesados.
- Upload simples pode falhar em arquivos grandes.
- Melhor feedback para o usuário.
- Maior tolerância a limitações de servidor/navegador.
- Permite controlar progresso visual.

## Fluxo

1. Frontend divide o arquivo.
2. Backend recebe cada chunk.
3. Backend junta os chunks.
4. Arquivo final é salvo em `midia/`.
5. Configuração da mídia é criada.
6. Playlist é atualizada.

---

## 10. Backups automáticos

## Decisão

Criar backups automáticos de arquivos críticos.

## Arquivos protegidos

- `midia-config.json`;
- `playlist.json`.

## Motivos

- Reduz risco de perda de configuração.
- Permite recuperação manual.
- Ajuda durante testes e desenvolvimento.
- Protege alterações administrativas.

## Regra

Backup só é criado quando há alteração real no conteúdo.

---

## 11. PM2 na VM

## Decisão

Usar PM2 para manter o servidor Node.js ativo.

## Motivos

- Mantém o processo rodando.
- Permite restart simples.
- Facilita status e logs.
- Permite salvar configuração de processo.
- É adequado para rodar Node.js em servidor/VM.

## Processo

```txt
painel-tv-v2
```

---

## 12. Cloudflare Tunnel

## Decisão

Utilizar Cloudflare Tunnel para disponibilizar o sistema.

## Motivos

- Evita exposição direta de portas.
- Facilita acesso via domínio.
- Reduz complexidade de rede.
- Permite disponibilização externa controlada.

## Observação

Warnings no navegador envolvendo `cdnjs.cloudflare.com` não indicam necessariamente problema no Cloudflare Tunnel. Eles podem estar relacionados ao uso do Font Awesome via CDN externo.

---

## 13. Font Awesome via CDN

## Decisão atual

Utilizar Font Awesome via CDN externo.

## Motivos

- Agilidade no desenvolvimento.
- Facilidade para usar ícones.
- Redução de arquivos locais inicialmente.

## Problema observado

O Microsoft Edge pode exibir warnings de prevenção de rastreamento relacionados a:

```txt
cdnjs.cloudflare.com
```

## Decisão futura

Hospedar Font Awesome localmente dentro do projeto.

## Benefícios da mudança futura

- Reduz dependência externa.
- Remove warnings no Edge.
- Melhora previsibilidade.
- Deixa o sistema mais independente.

---

## 14. Fonte Belinda

## Decisão

Usar a fonte Belinda como fonte visual/institucional em partes do sistema.

## Motivos

- Identidade visual mais próxima da marca.
- Visual mais personalizado.
- Melhor acabamento estético.

## Observação

Arquivos de fonte devem ser tratados com cuidado e não devem ser redistribuídos fora do projeto.

---

## 15. JavaScript puro no frontend

## Decisão

Construir dashboard e player com JavaScript puro.

## Motivos

- Menor complexidade inicial.
- Sem necessidade de build.
- Fácil hospedagem.
- Fácil depuração.
- Menos dependências.
- Mais direto para MVP.

## Consequência

O arquivo `admin.js` cresceu bastante e deverá ser modularizado futuramente.

---

## 16. CSS puro

## Decisão

Usar CSS puro em vez de framework.

## Motivos

- Controle total do visual.
- Evita dependências extras.
- Permite adaptar identidade visual da Prefeitura.
- Facilita ajustes finos.

## Consequência

O arquivo `admin.css` cresceu bastante durante os refinos visuais e deverá ser refatorado futuramente.

---

## 17. Logs de auditoria

## Decisão

Implementar logs de auditoria no sistema.

## Motivos

- Rastreabilidade.
- Segurança.
- Controle administrativo.
- Histórico de ações sensíveis.
- Melhor governança do sistema.

## Ações registradas

- login;
- logout;
- upload;
- edição;
- exclusão;
- criação de usuário;
- reset de senha;
- alteração de status;
- exclusão de usuário.

---

## 18. Perfis de usuário

## Decisão

Implementar controle por roles.

## Perfis

- superadmin;
- admin;
- editor;
- viewer.

## Motivos

- Separar responsabilidades.
- Proteger ações sensíveis.
- Preparar o sistema para múltiplos usuários.
- Evitar que qualquer usuário tenha controle total.

## Observação

A interface oculta botões conforme perfil, mas a segurança real é validada no backend.

---

## 19. Proteções contra ações perigosas

## Decisão

Criar proteções específicas para usuários administrativos.

## Proteções

- usuário não pode desativar a si mesmo;
- superadmin não pode excluir a própria conta logada;
- admin comum não pode alterar superadmin;
- admin comum não pode promover usuário para superadmin;
- rotas sensíveis exigem role específica.

## Motivo

Evitar bloqueios acidentais, escalada indevida de permissão e perda de acesso administrativo.

---

## 20. Modal genérico e padronização de modais

## Decisão

Criar e reaproveitar modais padronizados para confirmações, avisos e visualização de informações.

## Motivos

- Evitar `confirm()` nativo do navegador sempre que possível.
- Manter padrão visual na dashboard.
- Melhorar a experiência de uso.
- Centralizar comportamento de confirmação.
- Permitir variações visuais como danger, warning e success.
- Reduzir inconsistências entre alertas, confirmações e detalhes.

## Usos atuais

- salvar alterações;
- excluir mídias;
- excluir usuários;
- visualizar detalhes da mídia;
- avisar sobre alterações pendentes;
- bloquear sincronização manual quando existem alterações pendentes;
- outras confirmações sensíveis.

## Observação

Nem toda saída da página permite modal customizado.

Fechar aba, clicar no botão atualizar do navegador ou navegar pela barra de endereço continuam usando o aviso nativo do navegador por limitação de segurança dos próprios navegadores.

Para ações controláveis pelo sistema, como botão "Sair", F5 e Ctrl+R, o sistema usa modal próprio.

---

## 21. Refatoração futura

## Decisão

Adiar refatoração geral até estabilização da Fase 2.

## Motivos

- Evitar quebrar funcionalidades já funcionando.
- Priorizar entrega estável.
- Finalizar refinos de UX antes de reorganizar código.
- Documentar primeiro para refatorar com segurança.

## Alvos futuros

- `admin.css`;
- `admin.js`;
- `server.js`.

---

## 22. Documentação dentro do repositório

## Decisão

Criar documentação na pasta `docs/`.

## Motivos

- Evitar perda de contexto.
- Registrar arquitetura e decisões.
- Apoiar manutenção futura.
- Facilitar apresentação institucional.

## Arquivos iniciais

- `CONTEXTO_PROJETO.md`;
- `DEPLOY_VM.md`;
- `CHECKLIST_FASE_2.md`;
- `ARQUITETURA.md`;
- `DECISOES_TECNICAS.md`;
- `ROADMAP.md`;
- `HISTORICO_PROJETO.md`;
- `CHANGELOG.md`.

---

## 23. Estruturação em branches

## Decisão

Separar funcionalidades e documentações por branches Git.

## Objetivos

- Evitar alterações diretas na branch principal.
- Organizar melhor cada tipo de trabalho.
- Separar correções funcionais de documentação.
- Facilitar revisão antes de merge.
- Reduzir risco de quebrar a versão estável.

## Branches utilizadas até o momento

- `main`;
- `fase-2-backend-admin`;
- `fix-admin-funcionalidades`;
- `polish-admin-ui-v2`;
- `docs/documentacao-fase-2`.

## Observação

A branch `docs/documentacao-fase-2` foi criada especificamente para concentrar a documentação da Fase 2 antes de mesclar com a branch funcional.

---

## 24. Prioridade para custo zero

## Decisão

Priorizar soluções gratuitas ou já disponíveis na infraestrutura da Prefeitura.

## Motivos

- Evitar contratação imediata.
- Evitar abertura de processo licitatório apenas para validação inicial.
- Acelerar a implantação.
- Aproveitar a estrutura de servidores já existente.
- Demonstrar capacidade técnica interna.

## Resultado

O sistema foi implementado com custo operacional praticamente zero para a Prefeitura, utilizando VM interna, Cloudflare Tunnel gratuito, Node.js, SQLite, PM2 e desenvolvimento próprio.

---

## 25. Prioridade para facilidade operacional

## Decisão

Criar uma solução simples o suficiente para ser operada por equipes não técnicas.

## Objetivos

- Permitir que a Comunicação/SEGOV alimente conteúdos.
- Reduzir dependência diária da TI.
- Facilitar upload, ordenação, agendamento e exclusão de mídias.
- Tornar o painel visual e intuitivo.

## Reflexos no sistema

- Dashboard administrativa visual.
- Filtros de mídia.
- Botões claros de ação.
- Modais padronizados.
- Controle de permissões.
- Logs para rastreabilidade.

---

## 26. Sincronização automática da playlist

## Decisão

Reduzir o intervalo de revalidação e sincronização da playlist para 5 segundos.

## Motivos

- Diminuir o atraso entre alterações feitas no painel e a exibição no player.
- Melhorar o comportamento de mídias agendadas por data/hora.
- Fazer campanhas entrarem e saírem da playlist com mais precisão operacional.
- Evitar que o usuário administrativo precise aguardar muito tempo para ver o resultado.
- Manter o sistema simples, sem implementar WebSocket nesta fase.

## Como ficou

O backend passou a revalidar e publicar a playlist periodicamente a cada 5 segundos.

O player também passou a consultar silenciosamente a playlist a cada 5 segundos.

## Consequência prática

Quando uma mídia chega ao horário configurado, é ativada, inativada, excluída ou tem configuração salva, o player tende a refletir a mudança com atraso reduzido.

## Observação

Essa decisão é adequada para o volume atual do sistema.

Como o Painel Ribas ainda possui poucos players e baixo volume de requisições, o intervalo de 5 segundos é aceitável e traz ganho prático de usabilidade.

## Possível revisão futura

Caso o sistema cresça para muitas unidades/telas simultâneas, poderá ser avaliada uma estratégia mais sofisticada, como:

- WebSocket;
- Server-Sent Events;
- cache com controle de versão;
- sincronização por grupos de telas;
- intervalo dinâmico conforme horário de expediente.

---

## 27. Status Ativo/Inativo como ação imediata

## Decisão

Tratar a TAG Ativo/Inativo das mídias como uma ação imediata, com salvamento automático no backend.

## Motivos

- Ativar ou inativar uma mídia é uma ação simples e reversível.
- Se o usuário clicar por engano, basta clicar novamente.
- Exigir botão "Salvar alterações" para essa ação deixava o fluxo mais burocrático.
- A interface fica mais parecida com um switch real.
- O botão "Salvar alterações" deve ser reservado para mudanças de configuração mais sensíveis.

## Como ficou

Ao clicar na TAG Ativo/Inativo:

1. o estado visual muda imediatamente;
2. o novo status é enviado ao backend;
3. a playlist é atualizada automaticamente;
4. os resumos e filtros são atualizados;
5. em caso de erro, o card volta ao estado anterior.

## Regras adotadas para mídia inativa

Quando uma mídia está inativa, o card continua visível na biblioteca, mas a edição de configurações fica bloqueada.

Campos bloqueados:

- nome;
- duração;
- período de exibição;
- prioridade;
- repetição.

Ações permitidas:

- reativar;
- excluir;
- visualizar detalhes;
- selecionar em lote.

## Motivo do bloqueio parcial

A mídia inativa representa um conteúdo temporariamente fora da programação.

Por isso, faz sentido impedir ajustes acidentais de configuração, mas manter disponíveis as ações operacionais essenciais.

## Botão Excluir

O botão Excluir permanece visualmente ativo mesmo em mídias inativas.

Essa escolha foi feita porque, na prática, após inativar uma mídia, uma ação provável pode ser removê-la definitivamente da biblioteca.

## Impacto

A operação ficou mais simples, previsível e segura.

O usuário administrativo consegue ativar e inativar conteúdos com rapidez, sem perder acesso às ações principais e sem gerar alterações pendentes desnecessárias.

---

---

## 27. Detalhes da mídia em modal

## Decisão

Substituir o popover de detalhes da mídia por um modal padronizado.

## Motivos

- O popover antigo podia ser cortado em telas pequenas.
- Popovers posicionados dentro de cards sofrem com limites de largura, altura, overflow e bordas da viewport.
- Os detalhes da mídia são informações de leitura, não uma ação rápida.
- Um modal oferece melhor espaço visual para organizar dados técnicos e operacionais.
- O padrão de modal já estava consolidado na dashboard.

## Como ficou

O botão "Detalhes" passou a abrir um modal com informações da mídia.

O popover antigo foi desativado para evitar conflitos visuais e cortes em telas menores.

## Informações exibidas

O modal pode exibir:

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

## Observação futura

O modal de detalhes está funcional.

Na Fase 3, deverá ser refinado o posicionamento e a experiência de abertura em telas pequenas/mobile.

---

## 28. Alterações pendentes com modal próprio

## Decisão

Criar modal próprio para avisar o usuário quando existem alterações pendentes em ações controláveis pelo sistema.

## Motivos

- Reduzir risco de perda acidental de alterações.
- Manter padrão visual da dashboard.
- Evitar depender apenas do alerta nativo do navegador.
- Tornar a mensagem mais clara para usuários administrativos.
- Permitir ações como continuar editando ou sair sem salvar.

## Como ficou

Quando existem alterações pendentes:

- o botão "Sair" abre modal próprio;
- F5 abre modal próprio;
- Ctrl+R abre modal próprio.

O modal permite:

- continuar editando;
- sair/recarregar sem salvar.

## Limitação técnica

Navegadores modernos não permitem substituir completamente o alerta nativo de `beforeunload`.

Por isso, as seguintes ações continuam usando aviso nativo do navegador:

- fechar aba;
- clicar no botão atualizar do navegador;
- digitar outra URL na barra de endereço;
- navegar para fora da página por controles do navegador.

## Decisão complementar

O aviso nativo foi mantido como fallback obrigatório para proteger alterações pendentes nos cenários que o JavaScript não consegue controlar com modal customizado.

---

## 29. Bloqueio de sincronização com alterações pendentes

## Decisão

Bloquear a sincronização manual da biblioteca/playlist quando existem alterações pendentes na tela.

## Motivos

- A sincronização recarrega dados salvos no backend.
- Se houver rascunhos visuais não salvos, a sincronização pode descartar o que aparece na tela.
- Isso pode gerar inconsistência entre o estado visual do card e o estado real salvo.
- A playlist deve refletir dados já persistidos, não rascunhos locais.
- O usuário deve salvar ou descartar alterações antes de sincronizar.

## Como ficou

Ao clicar em "Sincronizar" com alterações pendentes:

1. a sincronização é bloqueada;
2. o sistema exibe um modal de aviso;
3. o usuário pode continuar editando;
4. o usuário pode optar por salvar as alterações;
5. após salvar, a playlist é atualizada pelo fluxo normal do backend.

## Diretriz adotada

Não foi criada opção de "sincronizar mesmo assim".

A decisão foi evitar perda de rascunho e impedir estados intermediários confusos para o usuário administrativo.


## Observação final

As decisões técnicas deste documento refletem o estágio atual do projeto.

Elas podem ser revistas futuramente conforme:

- aumento de uso;
- número de telas;
- número de usuários;
- necessidade de relatórios;
- necessidade de monitoramento;
- exigências institucionais;
- amadurecimento da solução.