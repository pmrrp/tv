# Arquitetura do Projeto — Painel Ribas

## 1. Objetivo deste documento

Este documento descreve a arquitetura técnica do sistema Painel Ribas.

Ele serve para:

- entender a estrutura geral do sistema;
- registrar responsabilidades dos arquivos;
- facilitar manutenção futura;
- orientar refatorações;
- evitar perda de contexto;
- apoiar novos desenvolvedores ou futuras revisões do projeto.

---

## 2. Visão geral da arquitetura

O Painel Ribas é um sistema web desenvolvido com Node.js, Express, SQLite, HTML, CSS e JavaScript puro.

O sistema possui duas grandes áreas:

1. **Player institucional**
   - exibido nas TVs;
   - roda em navegador;
   - consome `playlist.json`;
   - exibe vídeos e imagens em loop.

2. **Dashboard administrativa**
   - usada para gerenciar mídias;
   - permite upload, edição, filtros, usuários, logs e configurações;
   - acessada por usuários autenticados.

O backend centraliza:

- autenticação;
- APIs administrativas;
- upload de arquivos;
- configuração de mídias;
- geração de playlist;
- backups;
- usuários;
- logs de auditoria.

---

## 3. Estrutura resumida

```txt
painel-prefeitura-ribas/
├── admin/
│   ├── admin.css
│   ├── admin.js
│   ├── index.html
│   ├── login.css
│   ├── login.html
│   └── login.js
├── assets/
├── data/
├── database/
├── midia/
├── scripts/
├── config.json
├── gerar-playlist.ps1
├── index.html
├── package.json
├── playlist.json
├── script.js
├── server.js
└── style.css
```

---

## 4. Backend

## 4.1 Arquivo principal

```txt
server.js
```

O `server.js` é o backend principal do projeto.

Ele concentra:

- configuração do servidor Express;
- middlewares;
- controle de sessão;
- autenticação;
- proteção de rotas;
- upload de mídias;
- upload em partes;
- leitura e gravação de configurações;
- geração da playlist;
- backups;
- gerenciamento de usuários;
- logs de auditoria;
- rotas públicas do player;
- rotas administrativas.

---

## 4.2 Principais responsabilidades do backend

### Servir arquivos públicos

O backend serve:

- player;
- arquivos CSS/JS do player;
- arquivos estáticos do admin;
- mídias da pasta `midia/`;
- assets institucionais.

---

### Autenticação

O backend controla:

- login;
- logout;
- sessão;
- identificação do usuário logado;
- proteção do painel administrativo.

Rotas principais:

```txt
POST /api/login
POST /api/logout
GET  /api/auth/me
GET  /api/auth/status
```

---

### Mídias

O backend permite:

- listar mídias;
- enviar novas mídias;
- editar configurações;
- reordenar mídias;
- excluir mídias;
- excluir mídias em lote;
- gerar playlist.

Rotas principais:

```txt
GET    /api/midias
POST   /api/upload
POST   /api/upload/chunk
POST   /api/upload/finalizar
PUT    /api/midias/config/lote
PUT    /api/midias/:nomeArquivo/config
POST   /api/midias/:nomeArquivo/mover
DELETE /api/midias/:nomeArquivo
POST   /api/midias/excluir-lote
POST   /api/playlist/gerar
```

---

### Usuários

O backend permite:

- listar usuários;
- criar usuários;
- editar usuários;
- ativar/desativar usuários;
- resetar senha;
- excluir usuários;
- proteger ações sensíveis por perfil.

Rotas principais:

```txt
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/:id
PATCH  /api/admin/users/:id/status
POST   /api/admin/users/:id/reset-password
DELETE /api/admin/users/:id
```

---

### Auditoria

O backend registra ações administrativas importantes.

Rota principal:

```txt
GET /api/admin/audit-logs
```

Eventos registrados incluem:

- login;
- logout;
- upload;
- edição de mídia;
- exclusão de mídia;
- exclusão em lote;
- reordenação;
- criação de usuário;
- edição de usuário;
- alteração de status;
- reset de senha;
- exclusão de usuário.

---

## 5. Banco de dados

## 5.1 Tecnologia

O sistema usa SQLite com `better-sqlite3`.

Arquivo principal do banco em ambiente local/produção:

```txt
data/painel-tv.db
```

Arquivos auxiliares gerados pelo SQLite:

```txt
data/painel-tv.db-shm
data/painel-tv.db-wal
```

Esses arquivos não devem ser versionados.

---

## 5.2 Arquivos relacionados

```txt
database/db.js
database/initDatabase.js
```

### `database/db.js`

Responsável por abrir/conectar ao banco SQLite.

### `database/initDatabase.js`

Responsável por criar as tabelas necessárias caso ainda não existam.

---

## 5.3 Tabelas principais

### `users`

Armazena os usuários administrativos.

Campos principais:

- id;
- nome;
- email;
- senha_hash;
- role;
- secretaria_id;
- ativo;
- criado_em;
- atualizado_em.

---

### `secretarias`

Estrutura preparada para vincular usuários a secretarias.

Campos principais:

- id;
- nome;
- slug;
- ativo;
- criado_em;
- atualizado_em.

---

### `audit_logs`

Registra ações administrativas.

Campos principais:

- id;
- user_id;
- user_name;
- user_email;
- user_role;
- action;
- details;
- ip;
- user_agent;
- created_at.

---

## 6. Configurações de mídias

## 6.1 Arquivo principal

```txt
data/midia-config.json
```

Esse arquivo guarda as configurações individuais das mídias.

Exemplos de informações:

- status ativo/inativo;
- duração de imagens;
- ordem na playlist;
- prioridade;
- recorrência;
- título amigável;
- início de exibição;
- fim de exibição.

---

## 6.2 Playlist publicada

```txt
playlist.json
```

Esse arquivo é gerado automaticamente pelo backend.

O player consome esse arquivo para saber quais mídias devem ser exibidas.

A playlist respeita:

- mídias ativas;
- período de validade;
- ordem;
- prioridade;
- recorrência;
- tipo da mídia;
- duração de imagens.

---

## 7. Upload de arquivos

## 7.1 Pasta de mídias

```txt
midia/
```

Essa pasta armazena os arquivos enviados pelo painel administrativo.

Ela não deve ser versionada, pois contém vídeos e imagens reais de operação.

---

## 7.2 Upload tradicional

Usado para arquivos menores ou envio normal.

Rota:

```txt
POST /api/upload
```

---

## 7.3 Upload em partes/chunks

Usado para arquivos grandes.

Rotas:

```txt
POST /api/upload/chunk
POST /api/upload/finalizar
```

Pasta temporária:

```txt
data/upload-chunks/
```

Fluxo:

1. O frontend divide o arquivo em partes.
2. Cada parte é enviada ao backend.
3. O backend salva temporariamente os chunks.
4. Ao final, o backend junta os pedaços.
5. A mídia final é salva em `midia/`.
6. O registro entra em `midia-config.json`.
7. A playlist é atualizada.

---

## 8. Backups

## 8.1 Pasta

```txt
backups/
```

O sistema cria backups automáticos de:

- `midia-config.json`;
- `playlist.json`.

---

## 8.2 Regras

Os backups:

- são criados antes de alterações relevantes;
- só são gerados quando há mudança real;
- possuem limite por tipo;
- backups antigos são removidos automaticamente.

A pasta `backups/` não deve ser versionada.

---

## 9. Dashboard administrativa

## 9.1 Arquivos principais

```txt
admin/index.html
admin/admin.js
admin/admin.css
```

---

## 9.2 `admin/index.html`

Define a estrutura da dashboard.

Contém:

- cabeçalho;
- cards de resumo;
- área de upload;
- biblioteca de mídias;
- filtros;
- usuários;
- logs;
- modais;
- modal genérico de confirmação.

---

## 9.3 `admin/admin.js`

Controla a lógica da dashboard.

Responsabilidades:

- carregar usuário logado;
- aplicar permissões visuais;
- carregar resumo;
- enviar mídias;
- renderizar biblioteca;
- aplicar filtros;
- salvar configurações;
- excluir mídias;
- selecionar mídias em lote;
- ordenar mídias;
- controlar usuários;
- resetar senhas;
- alterar status;
- excluir usuários;
- carregar logs;
- controlar modais;
- controlar popovers;
- controlar alterações pendentes.

---

## 9.4 `admin/admin.css`

Controla o visual da dashboard.

Contém estilos para:

- layout geral;
- cabeçalho;
- cards de resumo;
- upload;
- biblioteca;
- filtros;
- cards de mídia;
- usuários;
- logs;
- modais;
- responsividade parcial.

Observação: o CSS cresceu bastante durante o desenvolvimento e deverá ser refatorado futuramente.

---

## 10. Login administrativo

Arquivos:

```txt
admin/login.html
admin/login.js
admin/login.css
```

Responsabilidades:

- exibir tela de login;
- enviar credenciais para `/api/login`;
- mostrar erros;
- controlar botão de mostrar/ocultar senha;
- redirecionar para `/admin` após login.

---

## 11. Player

## 11.1 Arquivos principais

```txt
index.html
script.js
style.css
config.json
playlist.json
```

---

## 11.2 Responsabilidade

O player é responsável por exibir os conteúdos nas TVs.

Funções principais:

- carregar configuração;
- carregar playlist;
- exibir splash inicial;
- exibir vídeos;
- exibir imagens;
- fazer loop;
- aplicar transições;
- mostrar relógio;
- mostrar controles temporários;
- sincronizar playlist periodicamente;
- continuar a exibição de forma automática.

---

## 11.3 Configuração do player

Arquivo:

```txt
config.json
```

Contém opções como:

- modo de teste;
- exibir status;
- exibir controles;
- exibir relógio;
- título;
- subtítulo;
- wallpaper inicial;
- tempo mínimo de splash;
- duração de fade;
- tempo para ocultar painel.

---

## 12. Assets

Pasta:

```txt
assets/
```

Contém:

- favicon;
- logos;
- watermark;
- wallpaper;
- fonte Belinda.

Observação: arquivos de fonte devem ser tratados com cuidado e não devem ser redistribuídos fora do projeto.

---

## 13. Scripts auxiliares

Pasta:

```txt
scripts/
```

Arquivos principais:

```txt
criar-superadmin.js
init-db.js
listar-users.js
```

Esses scripts auxiliam tarefas administrativas, como:

- inicializar banco;
- criar superadmin;
- listar usuários.

---

## 14. Script legado/auxiliar de playlist

Arquivo:

```txt
gerar-playlist.ps1
```

Script PowerShell usado em fases anteriores ou como apoio para geração de playlist.

Atualmente a geração principal de playlist está integrada ao backend Node.js.

---

## 15. Fluxo resumido do sistema

1. Usuário acessa `/admin`.
2. Se não estiver logado, é redirecionado para `/admin/login`.
3. Após login, a dashboard carrega usuário, resumo, mídias, usuários e logs.
4. Usuário envia ou edita mídias.
5. Backend salva configurações e atualiza `playlist.json`.
6. Player aberto nas TVs consome `playlist.json`.
7. Player exibe mídias válidas em loop.
8. Logs registram ações administrativas sensíveis.

---

## 16. Pontos de atenção

- `admin.js` está grande e deverá ser modularizado futuramente.
- `admin.css` está extenso e deverá ser refatorado futuramente.
- A dashboard ainda precisa de revisão de responsividade/mobile.
- O popover de detalhes pode precisar de ajuste em telas pequenas.
- Font Awesome ainda é carregado via CDN externo.
- A pasta `midia/` varia conforme o ambiente.
- O banco SQLite não deve ser versionado.
- A VM usa PM2 para manter o processo ativo.

---

## 17. Direção futura da arquitetura

Após estabilização da Fase 2, considerar:

- separar rotas do backend em módulos;
- separar serviços de mídia, usuários, logs e playlist;
- modularizar JavaScript do admin;
- dividir CSS por áreas;
- criar documentação técnica mais detalhada de APIs;
- criar testes manuais padronizados;
- criar rotina de backup externa;
- criar monitoramento dos players.