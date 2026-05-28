# Fase 3 — Robustez Operacional

## 1. Objetivo da Fase 3

A Fase 3 do Painel TV Prefeitura tem como foco aumentar a segurança operacional, a rastreabilidade, a manutenção preventiva e a capacidade de diagnóstico do sistema.

Nesta etapa, o sistema deixa de apenas executar uploads, playlist e exibição de mídias, passando também a monitorar limites, registrar eventos importantes, proteger o armazenamento, gerar backups, oferecer ferramentas administrativas para suporte e melhorar a qualidade da playlist em uso real.

---

## 2. Escopo desta fase

A Fase 3 contempla melhorias voltadas para:

- armazenamento;
- prevenção de falhas;
- auditoria;
- backups;
- diagnóstico operacional;
- manutenção automática;
- qualidade da playlist;
- validação em produção;
- documentação operacional;
- preparação para uso contínuo.

---

## 3. Principais entregas implementadas

### 3.1 Limpeza automática de uploads temporários antigos

Foi implementada uma rotina de limpeza automática da pasta:

```txt
data/upload-chunks/
```

Essa pasta é usada durante uploads em partes. Caso um upload seja abandonado, interrompido ou não finalizado corretamente, os pedaços temporários poderiam permanecer ocupando espaço.

A rotina criada:

- verifica periodicamente uploads temporários antigos;
- remove apenas pastas temporárias abandonadas;
- usa margem conservadora de 24 horas;
- evita acúmulo de lixo operacional;
- registra auditoria quando remove arquivos.

Ação registrada na auditoria:

```txt
sistema.chunks.limpeza
```

---

### 3.2 Resumo de armazenamento no backend

A rota de resumo administrativo passou a retornar informações operacionais de armazenamento, incluindo:

- tamanho da pasta `midia/`;
- tamanho da pasta `data/upload-chunks/`;
- tamanho da pasta `backups/`;
- tamanho da pasta `data/`;
- espaço total do disco;
- espaço livre do disco;
- percentual de uso do disco;
- limite operacional configurado para mídias;
- reserva mínima de disco livre;
- status geral do armazenamento.

Essas informações são usadas tanto pela dashboard quanto pelas validações preventivas de upload.

---

### 3.3 Limites operacionais por `.env`

Foram adicionadas configurações no `.env` para controlar o crescimento do sistema:

```env
MEDIA_MAX_STORAGE_GB=180
DISK_MIN_FREE_GB=50
```

Onde:

- `MEDIA_MAX_STORAGE_GB` define o limite máximo operacional da pasta `midia/`;
- `DISK_MIN_FREE_GB` define a reserva mínima de espaço livre que o servidor deve manter.

Também foi atualizado o `.env.example` com essas variáveis.

Valores padrão usados no projeto:

```txt
Limite da pasta midia/: 180 GB
Reserva mínima de disco livre: 50 GB
```

---

### 3.4 Bloqueio preventivo de uploads por armazenamento

Foi implementado bloqueio preventivo para impedir uploads quando:

- o novo arquivo ultrapassaria o limite configurado da pasta `midia/`;
- o upload deixaria o disco abaixo da reserva mínima configurada;
- a finalização de upload em partes criaria risco operacional.

O bloqueio funciona em:

- upload simples;
- upload em partes/chunks;
- finalização de chunks;
- validação preventiva no frontend.

Quando um upload é bloqueado, o sistema retorna mensagem amigável para o usuário e evita que arquivos inválidos permaneçam no servidor.

Ação registrada na auditoria:

```txt
midia.upload.bloqueado
```

---

### 3.5 Card visual de armazenamento na dashboard

Foi criado um card visual de armazenamento na dashboard administrativa.

O card exibe:

- uso atual da pasta `midia/`;
- limite configurado para mídias;
- espaço livre dentro desse limite;
- barra visual de progresso;
- status OK, aviso ou crítico.

Importante:

O card visual da dashboard considera principalmente o uso da pasta `midia/` em relação ao limite operacional configurado, evitando confundir o operador com o espaço total do SSD/VM.

A reserva real de disco continua sendo usada pelo backend como proteção operacional.

---

### 3.6 Auditoria de uploads bloqueados

O sistema agora registra quando um upload é bloqueado por armazenamento.

Foram contemplados dois cenários:

1. bloqueio real pelo backend;
2. bloqueio preventivo feito pelo frontend antes do envio.

A auditoria registra informações como:

- tipo do upload;
- motivo do bloqueio;
- nome original do arquivo;
- tamanho avaliado;
- mensagem exibida;
- estado do armazenamento no momento;
- limite configurado;
- reserva mínima de disco.

Ação registrada:

```txt
midia.upload.bloqueado
```

---

### 3.7 Refinamento da visualização de logs/auditoria

A seção de logs do sistema foi refinada visualmente.

Melhorias aplicadas:

- cards mais legíveis;
- ícones por tipo de ação;
- estados visuais por categoria;
- títulos amigáveis;
- resumos humanos;
- detalhes técnicos expansíveis;
- melhor leitura para eventos técnicos.

Foram tratados eventos como:

```txt
midia.upload
midia.upload.bloqueado
midia.excluir
midia.editar
usuario.criar
usuario.editar
usuario.excluir
usuario.resetar_senha
sistema.chunks.limpeza
sistema.backup.json
sistema.backup.database
sistema.backup.database.falha
```

---

### 3.8 Auditoria de backups automáticos JSON

As funções de backup automático dos arquivos JSON foram aprimoradas.

Arquivos protegidos:

```txt
data/midia-config.json
playlist.json
```

Antes de sobrescrever esses arquivos, o sistema cria backup automático na pasta:

```txt
backups/
```

Também foram adicionados metadados sobre:

- backup criado;
- arquivo atualizado;
- tamanho do backup;
- rotação/limpeza de backups antigos.

Ação registrada:

```txt
sistema.backup.json
```

---

### 3.9 Backup auditado do banco SQLite

Foi implementado backup seguro do banco SQLite:

```txt
data/painel-tv.db
```

O backup é criado usando o método seguro do `better-sqlite3`:

```js
db.backup()
```

Isso evita cópias inconsistentes com o banco em uso.

Os arquivos são salvos em:

```txt
backups/database_YYYY-MM-DD_HH-MM-SS.db
```

Também foi adicionada rotação por prefixo:

```txt
database_
```

Ação registrada em caso de sucesso:

```txt
sistema.backup.database
```

Ação registrada em caso de falha:

```txt
sistema.backup.database.falha
```

---

### 3.10 Painel de backups no admin

Foi criada uma seção visual de Backups no painel administrativo, visível apenas para superadmin.

A seção permite:

- listar backups JSON;
- listar backups SQLite;
- visualizar tipo, tamanho e data dos backups;
- gerar backup manual do banco SQLite pela interface;
- atualizar a listagem;
- consultar resumo por tipo.

Resumo exibido:

```txt
Total de backups • configurações • playlists • bancos SQLite
```

A lista possui rolagem interna para evitar que o dropdown fique muito alto quando houver muitos backups.

---

### 3.11 Diagnóstico operacional protegido

Foi criada a rota protegida:

```txt
/api/admin/diagnostico
```

Essa rota complementa o health check público:

```txt
/api/health
```

Diferença:

```txt
/api/health
```

Verifica apenas se o servidor está respondendo.

```txt
/api/admin/diagnostico
```

Verifica a saúde operacional completa do sistema.

O diagnóstico verifica:

- pastas principais;
- arquivos essenciais;
- banco SQLite;
- armazenamento;
- backups;
- mídias;
- avisos;
- problemas críticos.

A rota é protegida e acessível apenas para superadmin.

---

### 3.12 Painel visual de diagnóstico operacional

Foi criada uma seção visual de Diagnóstico no admin, também visível apenas para superadmin.

O painel mostra:

- status geral do sistema;
- banco SQLite;
- armazenamento de mídias;
- backups;
- mídias;
- arquivos essenciais;
- avisos;
- problemas críticos.

Status possíveis:

```txt
ok
aviso
critico
```

A seção inicia recolhida por padrão, seguindo o padrão visual das demais seções administrativas.

---

### 3.13 Avisos detalhados no diagnóstico

O diagnóstico visual passou a exibir o texto detalhado dos avisos.

Antes, o usuário via apenas uma mensagem genérica como:

```txt
Sistema com avisos
```

Agora, quando houver aviso, o painel mostra o motivo específico.

Exemplo:

```txt
Nenhum backup do banco SQLite encontrado.
```

ou:

```txt
O disco está se aproximando da reserva mínima de segurança.
```

Isso evita que o superadmin veja um alerta sem entender o que precisa ser conferido.

---

### 3.14 Recorrência inteligente da playlist

A lógica de recorrência da playlist foi aprimorada.

Antes, a repetição era baseada em uma regra simples de posição:

```txt
A cada X mídias, inserir novamente a mídia recorrente.
```

Esse comportamento podia causar situações visualmente incômodas, como:

- a mesma mídia aparecer colada nela mesma;
- a mídia repetir logo antes ou logo depois da posição original;
- a contagem reiniciar no começo da playlist, ignorando que o player roda em loop.

A nova lógica considera:

- última aparição real da mídia;
- posição original da mídia na playlist base;
- distância mínima entre aparições;
- loop entre fim e início da playlist;
- múltiplas mídias com recorrência ativa.

Resultado:

- a playlist fica mais agradável visualmente;
- mídias importantes continuam sendo destacadas;
- o sistema evita sensação de bug por repetição colada;
- a recorrência pode pular uma inserção quando ela ficaria muito próxima da própria mídia.

---

### 3.15 Ajuda contextual e dicas nativas no admin

Foi adicionada uma primeira camada de ajuda contextual no painel administrativo.

A estratégia adotada foi manter a interface limpa e evitar excesso de ícones visuais.

Padrão definido:

- controles pequenos e botões usam dica nativa no hover (`title`);
- seções principais mantêm ícone de ajuda discreto no título;
- os ícones de ajuda das seções ficam preparados para futura evolução com modais explicativos ou vídeos tutoriais;
- não foram adicionadas interrogações em todos os campos para evitar poluição visual.

Áreas contempladas:

- resumo operacional;
- upload de mídia;
- biblioteca de mídias;
- filtros da biblioteca;
- cards de mídia;
- usuários do sistema;
- auditoria/logs;
- backups;
- diagnóstico operacional.

A mudança não altera regras de negócio nem backend.

O objetivo é melhorar a experiência do operador, reduzindo dúvidas sobre o funcionamento de campos, botões, filtros, status, prioridade, recorrência, backups, diagnóstico e ações administrativas sensíveis.

---

### 3.16 Anti-cache para assets do admin

Foi adicionada uma proteção simples contra cache antigo nos arquivos leves do painel administrativo.

O backend agora envia headers anti-cache para arquivos do admin como:

- HTML;
- CSS;
- JavaScript.

Essa configuração reduz situações em que, após um deploy, o navegador carrega HTML atualizado, mas mantém CSS ou JS antigo em cache.

A regra foi limitada ao frontend administrativo e não deve afetar arquivos pesados, mídias, vídeos, imagens ou conteúdos exibidos pelo player.

Essa solução não substitui um versionamento completo por hash ou `APP_VERSION`, mas resolve o problema prático de deploy com baixo risco e baixa complexidade.

---

## 4. Rotas envolvidas

### Health público

```txt
GET /api/health
```

Retorna informações básicas do servidor:

- status;
- nome do sistema;
- uptime;
- ambiente;
- data/hora UTC.

---

### Resumo administrativo

```txt
GET /api/admin/resumo
```

Retorna dados consolidados da dashboard, incluindo mídias, playlist, servidor e armazenamento.

---

### Backups

```txt
GET /api/admin/backups
```

Lista backups disponíveis.

```txt
POST /api/admin/backups/database
```

Cria backup manual/auditado do banco SQLite.

---

### Diagnóstico operacional

```txt
GET /api/admin/diagnostico
```

Retorna diagnóstico operacional completo do sistema.

---

### Logs de auditoria

```txt
GET /api/admin/audit-logs
```

Lista eventos registrados na auditoria.

---

### Upload bloqueado por armazenamento

O bloqueio pode ocorrer em rotas de upload e finalização de chunks, conforme o tipo de envio:

```txt
POST /api/upload
POST /api/upload/chunk
POST /api/upload/finalizar
```

---

## 5. Auditorias adicionadas/refinadas

Durante a Fase 3, foram adicionados ou refinados os seguintes eventos de auditoria:

```txt
midia.upload.bloqueado
sistema.chunks.limpeza
sistema.backup.json
sistema.backup.database
sistema.backup.database.falha
```

Esses eventos permitem acompanhar:

- tentativas de upload bloqueadas;
- limpezas automáticas executadas;
- backups automáticos criados;
- backups manuais do banco;
- falhas em rotinas de backup.

---

## 6. Configurações de ambiente

Variáveis adicionadas:

```env
MEDIA_MAX_STORAGE_GB=180
DISK_MIN_FREE_GB=50
```

Essas variáveis devem existir no `.env` da VM/produção.

Também devem constar no `.env.example`.

---

## 7. Como testar

### 7.1 Testar resumo de armazenamento

Acessar:

```txt
http://localhost:3000/api/admin/resumo
```

Verificar se o retorno possui o bloco:

```json
"armazenamento": {}
```

---

### 7.2 Testar bloqueio de upload

Temporariamente alterar no `.env` local:

```env
MEDIA_MAX_STORAGE_GB=1
DISK_MIN_FREE_GB=50
```

Reiniciar o servidor e tentar enviar mídia acima do limite.

Resultado esperado:

- upload bloqueado;
- mensagem amigável;
- arquivo não entra na biblioteca;
- log `midia.upload.bloqueado` registrado.

Após o teste, retornar para:

```env
MEDIA_MAX_STORAGE_GB=180
DISK_MIN_FREE_GB=50
```

---

### 7.3 Testar limpeza automática de chunks

Temporariamente reduzir o tempo máximo de chunk antigo no código para teste.

Criar pasta temporária em:

```txt
data/upload-chunks/
```

Reiniciar o servidor e verificar:

- pasta removida;
- log `sistema.chunks.limpeza` registrado.

Após o teste, retornar o tempo normal para 24 horas.

---

### 7.4 Testar backup do banco SQLite

No painel admin, como superadmin:

1. abrir seção Backups;
2. clicar em “Backup do banco”;
3. confirmar a ação;
4. verificar novo arquivo `.db` na lista;
5. verificar log `sistema.backup.database`.

---

### 7.5 Testar diagnóstico operacional

Acessar:

```txt
http://localhost:3000/api/admin/diagnostico
```

Ou usar a seção visual no admin.

Verificar:

- status geral;
- banco SQLite;
- armazenamento;
- backups;
- mídias;
- arquivos essenciais;
- avisos ou problemas críticos.

---

### 7.6 Testar recorrência inteligente

Configurar pelo menos duas mídias com recorrência ativa.

Exemplo:

```txt
Mídia A — repetir a cada 3 mídias
Mídia B — repetir a cada 3 mídias
```

Gerar a playlist e verificar o arquivo:

```txt
playlist.json
```

Resultado esperado:

- a mesma mídia não deve aparecer colada nela mesma;
- a mesma mídia não deve aparecer muito próxima dela mesma, quando evitável;
- a contagem deve considerar o loop da playlist;
- a lógica pode pular uma repetição se ela ficaria visualmente ruim.

---

## 8. Validação em produção/VM

Após o merge da Fase 3 na branch funcional, as alterações foram publicadas na VM de produção.

Ambiente:

```txt
C:\tv-v2\tv
```

Branch:

```txt
fix-admin-funcionalidades
```

Processo PM2:

```txt
painel-tv-v2
```

Comando padrão de reinício:

```powershell
pm2 restart painel-tv-v2 --update-env
```

---

### 8.1 Itens validados na VM

- [x] Código atualizado na branch `fix-admin-funcionalidades`.
- [x] PM2 reiniciado.
- [x] Dashboard carregando.
- [x] Player funcionando.
- [x] Card de armazenamento exibido.
- [x] Seção Backups disponível para superadmin.
- [x] Seção Diagnóstico disponível para superadmin.
- [x] Auditoria disponível para superadmin.
- [x] Diagnóstico operacional carregando.
- [x] Primeiro backup SQLite gerado no ambiente real.
- [x] Aviso de ausência de backup SQLite removido após geração do backup.
- [x] Sistema validado após deploy.

---

## 9. Impacto operacional

Com as entregas da Fase 3, o sistema passa a ter maior proteção contra:

- acúmulo de chunks temporários;
- falta de espaço em disco;
- crescimento descontrolado da pasta de mídias;
- perda de arquivos JSON importantes;
- perda do banco SQLite;
- dificuldade de diagnóstico;
- falta de rastreabilidade de ações técnicas;
- repetição visualmente incômoda de mídias na playlist.

A manutenção passa a contar com:

- auditoria técnica;
- backups automáticos;
- backup manual do banco;
- diagnóstico operacional;
- indicadores visuais no admin;
- limites configuráveis por ambiente;
- recorrência de playlist mais inteligente.

---

## 10. Benefícios para produção

Na VM/produção, essas melhorias ajudam a:

- evitar travamentos por falta de espaço;
- impedir uploads que colocariam o servidor em risco;
- manter histórico de backups;
- facilitar suporte técnico;
- identificar problemas antes que afetem o player;
- documentar ações importantes;
- dar mais segurança para uso institucional;
- melhorar a qualidade visual da playlist exibida nas TVs.

---

## 11. Situação atual

A Fase 3 já possui um bloco robusto de melhorias operacionais concluídas.

Entregas concluídas:

```txt
[OK] Limpeza automática de chunks antigos
[OK] Auditoria da limpeza de chunks
[OK] Resumo de armazenamento
[OK] Limites por .env
[OK] Bloqueio preventivo de uploads
[OK] Auditoria de uploads bloqueados
[OK] Card visual de armazenamento
[OK] Refinamento premium dos logs
[OK] Auditoria de backups JSON
[OK] Backup auditado do banco SQLite
[OK] Painel de backups no admin
[OK] Diagnóstico operacional protegido
[OK] Painel visual de diagnóstico operacional
[OK] Avisos detalhados no diagnóstico
[OK] Recorrência inteligente da playlist
[OK] Deploy na VM
[OK] Primeiro backup SQLite em produção
[OK] Diagnóstico validado em produção
[OK] Dicas nativas/hover nos principais controles do admin
[OK] Estratégia de ajuda contextual sem poluir visualmente a interface
[OK] Headers anti-cache para assets leves do admin
[OK] Avaliar versionamento/cache busting automático dos assets CSS/JS no deploy
[OK] Implementar versionamento/cache busting automático dos assets CSS/JS no deploy, evitando necessidade de hard reload após alterações visuais no admin/player.
```

---

## 12. Pendências futuras / backlog

Itens que podem ser tratados posteriormente:

```txt
[ ] Criar sistema de tooltips/ajuda contextual no admin
[ ] Criar checklist final de implantação por ponto
[ ] Documentar diagnóstico de rede/travamentos
[ ] Refatorar admin.css em blocos mais organizados
[ ] Melhorar responsividade mobile dos novos cards de Backups e Diagnóstico
[ ] Criar filtros por tipo na listagem de backups
[ ] Avaliar download seguro de backups pela interface
[ ] Avaliar restauração controlada de backups
[ ] Criar modal detalhado para diagnóstico operacional completo
[ ] Atualizar documentação executiva da Fase 3
[ ] Evoluir ajuda contextual por seção para modais ou vídeos tutoriais
[ ] Avaliar versionamento automático por `APP_VERSION` ou hash do commit para CSS/JS
```

---

## 13. Observação sobre CSS

Durante a Fase 3, novas seções visuais foram adicionadas ao admin, como Backups e Diagnóstico.

Foi identificado que o arquivo CSS do painel administrativo já possui várias camadas de ajustes, polimentos e regras específicas.

Recomendação futura:

Refatorar o CSS do admin em blocos mais claros, separando:

```txt
tokens/variáveis
base
layout
cards
botões
formulários
biblioteca
usuários
backups
diagnóstico
auditoria
modais
responsivo
```

Essa refatoração deve ser planejada com cuidado para evitar regressões visuais.

---

## 14. Conclusão

A Fase 3 fortaleceu significativamente o Painel TV Prefeitura.

O sistema agora possui mecanismos de proteção, rastreabilidade, backup, diagnóstico e distribuição mais inteligente da playlist, tornando a operação mais segura e facilitando manutenção futura.

Essas melhorias aumentam a confiabilidade do sistema tanto para uso institucional na Prefeitura quanto para uma possível evolução futura do projeto.