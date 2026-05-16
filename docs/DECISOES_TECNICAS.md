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

## 20. Modal genérico de confirmação

## Decisão

Criar/reaproveitar modal genérico para confirmações.

## Motivos

- Evitar `confirm()` nativo do navegador.
- Manter padrão visual.
- Melhor experiência de uso.
- Centralizar comportamento de confirmação.
- Permitir variações visuais como danger, warning e success.

## Usos

- salvar alterações;
- excluir mídias;
- excluir usuários;
- outras confirmações sensíveis.

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

---

## 26. Sincronização automática da playlist

## Decisão
Reduzir o intervalo de revalidação e sincronização da playlist para 5 segundos.

## Motivo
O sistema possui mídias com período de exibição configurável, podendo ter data/hora de início e fim. Com intervalos maiores, uma mídia agendada poderia demorar alguns segundos ou até quase um minuto para entrar na playlist publicada e ser percebida pelo player.

## Como funciona atualmente
- O backend revalida e republica a playlist automaticamente a cada 5 segundos.
- O player consulta silenciosamente o `playlist.json` também a cada 5 segundos.
- Quando detecta alteração, o player atualiza a playlist em memória sem reiniciar desnecessariamente a exibição atual.

## Benefício
Essa configuração reduz o atraso percebido na entrada e saída de mídias agendadas, tornando o comportamento mais próximo do horário configurado pelo usuário.

## Observação
O intervalo de 5 segundos foi considerado adequado para o volume atual do sistema. Caso o número de telas, mídias ou acessos cresça muito, esse intervalo poderá ser revisto futuramente.

---

## 27. Observação final

As decisões técnicas deste documento refletem o estágio atual do projeto.

Elas podem ser revistas futuramente conforme:

- aumento de uso;
- número de telas;
- número de usuários;
- necessidade de relatórios;
- necessidade de monitoramento;
- exigências institucionais;
- amadurecimento da solução.