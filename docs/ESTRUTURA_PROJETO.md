# Estrutura do Projeto — Painel Ribas

## Objetivo

Este documento descreve a organização de pastas e arquivos do projeto Painel Ribas.

Seu objetivo é facilitar:

- manutenção;
- onboarding futuro;
- entendimento da arquitetura;
- localização rápida de arquivos;
- futuras refatorações.

---

# Estrutura geral

```txt
painel-prefeitura-ribas/
```

---

# Raiz do projeto

## `.env`

Arquivo de variáveis de ambiente.

---

## `.env.example`

Modelo de referência para criação do `.env`.

---

## `config.json`

Arquivo de configuração geral do sistema.

---

## `server.js`

Backend principal da aplicação.

Responsável por:

- APIs;
- autenticação;
- upload;
- geração de playlist;
- logs;
- usuários;
- backups;
- regras de negócio;
- entrega dos arquivos frontend.

---

## `index.html`

Player principal exibido nas TVs.

---

## `script.js`

Lógica do player institucional.

---

## `style.css`

Estilos do player institucional.

---

## `playlist.json`

Playlist gerada automaticamente pelo backend.

Consumida pelo player.

---

## `gerar-playlist.ps1`

Script auxiliar relacionado à geração/manutenção da playlist.

---

# Pasta `admin/`

```txt
admin/
```

Contém toda a dashboard administrativa.

---

## `admin/index.html`

Estrutura principal da dashboard administrativa.

---

## `admin/admin.js`

Frontend principal do painel administrativo.

Arquivo atualmente grande e centralizado.

Responsável por:

- uploads;
- usuários;
- filtros;
- modais;
- playlist;
- auditoria;
- eventos;
- renderização dinâmica;
- integração com APIs.

---

## `admin/admin.css`

Estilos completos da dashboard administrativa.

Contém:

- layout;
- responsividade parcial;
- animações;
- modais;
- cards;
- filtros;
- biblioteca;
- login;
- badges;
- estados visuais.

---

## `admin/login.html`

Tela de login administrativo.

---

## `admin/login.js`

Lógica do login.

---

## `admin/login.css`

Estilos da tela de login.

---

# Pasta `assets/`

```txt
assets/
```

Arquivos visuais e institucionais.

---

## Conteúdo

- logos;
- wallpapers;
- favicon;
- fontes;
- SVGs;
- imagens institucionais.

---

## `assets/fonts/`

Fontes utilizadas pelo projeto.

Atualmente inclui:

- Fonte Belinda.

---

# Pasta `midia/`

```txt
midia/
```

Armazena as mídias exibidas no player.

## Conteúdo esperado

- vídeos;
- imagens;
- campanhas;
- peças institucionais.

## Observação

O conteúdo varia conforme ambiente:

- máquina local;
- VM;
- ambiente de testes.

---

# Pasta `data/`

```txt
data/
```

Armazena arquivos operacionais do sistema.

---

## `data/midia-config.json`

Configurações administrativas das mídias.

Contém:

- duração;
- prioridade;
- recorrência;
- ordem;
- validade;
- status;
- título amigável.

---

## `data/painel-tv.db`

Banco SQLite principal.

---

## `data/upload-chunks/`

Pasta temporária usada durante uploads em partes.

---

# Pasta `database/`

```txt
database/
```

Arquivos relacionados à camada SQLite.

---

## `database/db.js`

Conexão e helpers do banco.

---

## `database/initDatabase.js`

Inicialização da estrutura do banco.

---

# Pasta `scripts/`

```txt
scripts/
```

Scripts auxiliares de manutenção.

---

## Scripts atuais

### `criar-superadmin.js`

Cria usuário superadmin.

---

### `listar-users.js`

Lista usuários cadastrados.

---

### `init-db.js`

Inicialização auxiliar do banco.

---

# Pasta `backups/`

```txt
backups/
```

Backups automáticos do sistema.

---

## Conteúdo

Backups versionados de:

- `playlist.json`;
- `midia-config.json`.

---

# Pasta `docs/`

```txt
docs/
```

Documentação técnica e institucional do projeto.

---

## Arquivos atuais

- CONTEXTO_PROJETO.md
- DEPLOY_VM.md
- CHECKLIST_FASE_2.md
- ARQUITETURA.md
- DECISOES_TECNICAS.md
- ROADMAP.md
- HISTORICO_PROJETO.md
- CHANGELOG.md
- ESTRUTURA_PROJETO.md

---

# Ambiente de produção

## VM

Atualmente o sistema roda em:

```txt
C:\tv-v2\tv
```

---

## PM2

Processo principal:

```txt
painel-tv-v2
```

---

## Tunnel

Acesso externo realizado via:

- Cloudflare Tunnel.

---

## Domínio atual

```txt
painelribas.com.br
```

---

# Organização futura planejada

## Possíveis melhorias

- modularização do backend;
- separação de rotas;
- separação de serviços;
- separação de componentes frontend;
- refatoração do CSS;
- refatoração do admin.js;
- responsividade mobile;
- sistema de monitoramento remoto;
- relatórios;
- dashboards analíticas.

---

# Observação final

A estrutura atual prioriza:

- simplicidade;
- agilidade;
- facilidade de deploy;
- manutenção rápida;
- MVP avançado funcional.

A arquitetura poderá evoluir futuramente conforme crescimento do projeto.