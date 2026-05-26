# Fase 3 — Robustez Operacional

## 1. Objetivo da Fase 3

A Fase 3 do Painel TV Prefeitura tem como foco aumentar a segurança operacional, a rastreabilidade, a manutenção preventiva e a capacidade de diagnóstico do sistema.

Nesta etapa, o sistema deixa de apenas executar uploads, playlist e exibição de mídias, passando também a monitorar limites, registrar eventos importantes, proteger o armazenamento, gerar backups e oferecer ferramentas administrativas para suporte e manutenção.

---

## 2. Principais entregas implementadas

### 2.1 Limpeza automática de uploads temporários antigos

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

### 2.2 Resumo de armazenamento no backend

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

### 2.3 Limites operacionais por `.env`

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

### 2.4 Bloqueio preventivo de uploads por armazenamento

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

### 2.5 Card visual de armazenamento na dashboard

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

### 2.6 Auditoria de uploads bloqueados

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

### 2.7 Refinamento da visualização de logs/auditoria

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
```

---

### 2.8 Auditoria de backups automáticos JSON

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

### 2.9 Backup auditado do banco SQLite

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

### 2.10 Painel de backups no admin

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

### 2.11 Diagnóstico operacional protegido

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

### 2.12 Painel visual de diagnóstico operacional

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

## 3. Rotas envolvidas

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

## 4. Auditorias adicionadas/refinadas

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

## 5. Configurações de ambiente

Variáveis adicionadas:

```env
MEDIA_MAX_STORAGE_GB=180
DISK_MIN_FREE_GB=50
```

Essas variáveis devem existir no `.env` da VM/produção.

Também devem constar no `.env.example`.

---

## 6. Como testar

### 6.1 Testar resumo de armazenamento

Acessar:

```txt
http://localhost:3000/api/admin/resumo
```

Verificar se o retorno possui o bloco:

```json
"armazenamento": {}
```

---

### 6.2 Testar bloqueio de upload

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

### 6.3 Testar limpeza automática de chunks

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

### 6.4 Testar backup do banco SQLite

No painel admin, como superadmin:

1. abrir seção Backups;
2. clicar em “Backup do banco”;
3. confirmar a ação;
4. verificar novo arquivo `.db` na lista;
5. verificar log `sistema.backup.database`.

---

### 6.5 Testar diagnóstico operacional

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

## 7. Impacto operacional

Com as entregas da Fase 3, o sistema passa a ter maior proteção contra:

- acúmulo de chunks temporários;
- falta de espaço em disco;
- crescimento descontrolado da pasta de mídias;
- perda de arquivos JSON importantes;
- perda do banco SQLite;
- dificuldade de diagnóstico;
- falta de rastreabilidade de ações técnicas.

A manutenção passa a contar com:

- auditoria técnica;
- backups automáticos;
- backup manual do banco;
- diagnóstico operacional;
- indicadores visuais no admin;
- limites configuráveis por ambiente.

---

## 8. Benefícios para produção

Na VM/produção, essas melhorias ajudam a:

- evitar travamentos por falta de espaço;
- impedir uploads que colocariam o servidor em risco;
- manter histórico de backups;
- facilitar suporte técnico;
- identificar problemas antes que afetem o player;
- documentar ações importantes;
- dar mais segurança para uso institucional.

---

## 9. Situação atual

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
```

---

## 10. Pendências futuras / backlog

Itens que podem ser tratados posteriormente:

```txt
[ ] Refatorar admin.css em blocos mais organizados
[ ] Melhorar responsividade mobile dos novos cards
[ ] Criar filtros na listagem de backups por tipo
[ ] Criar download seguro de backups pela interface
[ ] Criar restauração controlada de backups, se necessário
[ ] Melhorar modal detalhado do diagnóstico operacional
[ ] Criar documentação executiva da Fase 3
[ ] Revisar deploy em produção após merge
```

---

## 11. Observação sobre CSS

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

## 12. Conclusão

A Fase 3 fortaleceu significativamente o Painel TV Prefeitura.

O sistema agora possui mecanismos de proteção, rastreabilidade, backup e diagnóstico, tornando a operação mais segura e facilitando manutenção futura.

Essas melhorias aumentam a confiabilidade do sistema tanto para uso institucional na Prefeitura quanto para uma possível evolução futura do projeto.