# Contexto do Projeto — Painel Ribas

## 1. Identificação do projeto

**Nome do projeto:** Painel Ribas / Painel TV Prefeitura

**Finalidade:** Sistema institucional de exibição de vídeos, imagens, campanhas e comunicados nas TVs da Prefeitura Municipal de Ribas do Rio Pardo - MS.

**Domínio em uso:** painelribas.com.br

**Repositório:** https://github.com/pmrrp/tv

**Branch principal de desenvolvimento atual:** fix-admin-funcionalidades

**Ambiente de produção:** VM Windows com Node.js, PM2 e Cloudflare Tunnel.

---

## 2. Objetivo do sistema

O Painel Ribas foi criado para permitir que a Prefeitura exiba conteúdos institucionais em TVs instaladas em unidades públicas, como postos de saúde, hospitais, secretarias, recepções e demais órgãos municipais.

O sistema permite que vídeos e imagens sejam exibidos automaticamente em loop, por meio de um player web aberto no navegador dos computadores conectados às TVs.

A proposta é oferecer uma solução própria, simples, sem dependência de software pago de digital signage e sem necessidade de aquisição imediata de equipamentos específicos, aproveitando a infraestrutura disponível.

---

## 3. Contexto institucional

O projeto surgiu a partir da necessidade de divulgar ações institucionais da Prefeitura, especialmente vídeos de obras, infraestrutura, campanhas públicas e demais conteúdos de comunicação governamental.

Como aquisições na Prefeitura dependem de processos formais, licitações ou contratação de serviços, a solução foi desenvolvida internamente para garantir agilidade, autonomia e redução de custos.

O sistema também serve como demonstração de capacidade técnica interna, mostrando que é possível desenvolver uma solução institucional funcional, organizada, documentada e expansível dentro do próprio setor de tecnologia.

---

## 4. Visão geral de funcionamento

O sistema possui duas partes principais:

- Player;
- Dashboard administrativa.

---

## 4.1 Player

O player é a tela exibida nas TVs.

Ele roda em navegador e é responsável por:

- carregar a playlist publicada;
- exibir vídeos e imagens em tela cheia;
- reproduzir os conteúdos em loop;
- atualizar a programação automaticamente;
- exibir informações visuais, como relógio, splash inicial e controles temporários;
- funcionar nos computadores conectados às TVs.

Arquivos principais do player:

```txt
index.html
script.js
style.css
config.json
playlist.json
```

---

## 4.2 Dashboard administrativa

A dashboard é a área de administração do sistema.

Ela permite:

- fazer login administrativo;
- enviar vídeos e imagens;
- editar título amigável das mídias;
- ativar ou desativar conteúdos;
- definir período de exibição;
- configurar prioridade;
- configurar recorrência/repetição;
- ordenar mídias;
- excluir mídias individualmente ou em lote;
- visualizar resumo operacional;
- gerenciar usuários;
- visualizar logs de auditoria;
- gerar e atualizar a playlist.

Arquivos principais da dashboard:

```txt
admin/index.html
admin/admin.js
admin/admin.css
admin/login.html
admin/login.js
admin/login.css
```

---

## 5. Stack técnica

### 5.1 Backend

- Node.js;
- Express;
- SQLite;
- better-sqlite3;
- express-session;
- bcryptjs;
- multer;
- dotenv.

### 5.2 Frontend

- HTML;
- CSS;
- JavaScript puro;
- Font Awesome via CDN;
- fonte institucional Belinda via assets locais.

### 5.3 Infraestrutura

- VM Windows;
- PM2 para manter o processo Node ativo;
- Cloudflare Tunnel para disponibilização externa;
- Git/GitHub para versionamento.

---

## 6. Estrutura principal do projeto

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
│   ├── favicon.svg
│   ├── fonts/
│   ├── logo-prefeitura.svg
│   ├── logo_hor.svg
│   ├── wallpaper.jpg
│   └── watermark-prefeitura.svg
├── backups/
├── data/
│   ├── midia-config.json
│   ├── painel-tv.db
│   └── upload-chunks/
├── database/
│   ├── db.js
│   └── initDatabase.js
├── midia/
├── scripts/
│   ├── criar-superadmin.js
│   ├── init-db.js
│   └── listar-users.js
├── config.json
├── gerar-playlist.ps1
├── index.html
├── package.json
├── package-lock.json
├── playlist.json
├── script.js
├── server.js
└── style.css
```

---

## 7. Responsabilidade dos principais arquivos

### 7.1 `server.js`

Backend principal do sistema.

Responsável por:

- servir o player;
- servir o painel administrativo;
- controlar login e sessão;
- receber uploads;
- receber uploads em partes/chunks;
- listar mídias;
- salvar configurações;
- gerar playlist;
- criar backups;
- controlar usuários;
- registrar logs de auditoria;
- expor APIs para o frontend.

---

### 7.2 `admin/admin.js`

Controla toda a lógica da dashboard administrativa.

Responsável por:

- carregar dados do usuário logado;
- aplicar permissões visuais;
- carregar resumo da dashboard;
- controlar upload;
- renderizar mídias;
- aplicar filtros;
- controlar seleção em lote;
- salvar alterações;
- excluir mídias;
- ordenar mídias;
- gerenciar usuários;
- resetar senha;
- alterar status de usuário;
- excluir usuário por superadmin;
- carregar logs de auditoria;
- controlar modais e popovers.

---

### 7.3 `admin/admin.css`

Arquivo principal de estilo da dashboard.

Contém:

- layout geral do painel;
- cabeçalho;
- cards de resumo;
- upload;
- biblioteca de mídias;
- filtros;
- cards de mídia;
- usuários;
- logs;
- modais;
- responsividade parcial.

Observação: este arquivo cresceu bastante durante o desenvolvimento e deverá ser refatorado futuramente, após a estabilização da Fase 2.

---

### 7.4 `admin/index.html`

Estrutura HTML da dashboard.

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

### 7.5 `script.js`

Controla o player exibido nas TVs.

Responsável por:

- carregar configurações;
- carregar playlist;
- exibir vídeos e imagens;
- controlar loop;
- controlar transições;
- atualizar relógio;
- controlar interface temporária;
- sincronizar alterações na playlist.

---

### 7.6 `style.css`

Estilos do player.

Controla:

- tela cheia;
- splash inicial;
- layout da mídia;
- controles;
- relógio;
- transições;
- responsividade básica.

---

### 7.7 `data/midia-config.json`

Arquivo de configuração das mídias.

Guarda informações como:

- ativo/inativo;
- duração de imagens;
- ordem;
- prioridade;
- recorrência;
- título amigável;
- início e fim de exibição.

---

### 7.8 `playlist.json`

Arquivo consumido pelo player.

É gerado automaticamente pelo backend com base nas mídias ativas, dentro da validade, respeitando ordem, prioridade e recorrência.

---

### 7.9 `database/initDatabase.js`

Cria e atualiza a estrutura inicial do banco SQLite.

Tabelas principais:

- `users`;
- `secretarias`;
- `audit_logs`.

---

## 8. Perfis de usuário

O sistema possui os seguintes perfis:

- superadmin;
- admin;
- editor;
- viewer.

---

## 8.1 Superadmin

Acesso total.

Pode:

- gerenciar mídias;
- gerenciar usuários;
- criar usuários;
- editar usuários;
- resetar senhas;
- ativar/desativar usuários;
- excluir usuários;
- visualizar logs de auditoria.

---

## 8.2 Admin

Perfil administrativo.

Pode gerenciar conteúdos e usuários comuns, respeitando as proteções definidas no backend.

---

## 8.3 Editor

Pode gerenciar mídias e conteúdos.

---

## 8.4 Viewer

Perfil de visualização.

Não deve realizar alterações sensíveis.

---

## 9. Regras importantes de segurança

O sistema possui validações no frontend e no backend.

A segurança real fica no backend.

Proteções implementadas:

- usuário precisa estar logado para acessar o admin;
- rotas sensíveis exigem role específica;
- senha é armazenada com hash bcrypt;
- sessão não armazena senha nem hash;
- admin comum não pode alterar superadmin;
- usuário não pode desativar a si mesmo;
- superadmin não pode excluir a própria conta logada;
- exclusões e alterações sensíveis são registradas em logs de auditoria.

---

## 10. Logs de auditoria

O sistema registra eventos administrativos importantes, como:

- login;
- logout;
- upload de mídia;
- edição de mídia;
- exclusão de mídia;
- exclusão em lote;
- movimentação/reordenação;
- criação de usuário;
- edição de usuário;
- alteração de status;
- reset de senha;
- exclusão de usuário.

Os logs guardam:

- usuário;
- e-mail;
- perfil;
- ação;
- detalhes;
- IP;
- user-agent;
- data/hora.

---

## 11. Estado atual do projeto

O sistema encontra-se em Fase 2 avançada.

Já existem:

- player funcional;
- dashboard administrativa funcional;
- upload de mídias;
- upload em partes/chunks;
- biblioteca de mídias;
- filtros profissionais;
- agendamento de exibição;
- prioridade;
- recorrência;
- playlist automática;
- backups automáticos;
- usuários com perfis;
- logs de auditoria;
- deploy funcional na VM;
- acesso via painelribas.com.br.

---

## 12. Pendências atuais conhecidas

Pendências e melhorias identificadas:

- revisar popover de detalhes em telas pequenas;
- criar documentação completa de uso;
- criar documento executivo para apresentação;
- revisar responsividade/mobile da dashboard;
- hospedar Font Awesome localmente;
- futuramente refatorar `admin.css`;
- futuramente modularizar `admin.js`;
- criar documentação técnica completa;
- criar checklist final de entrega.

---

## 13. Padrão de trabalho adotado

O projeto está sendo desenvolvido com foco em:

- código bem comentado;
- organização por seções;
- nomes claros de funções e variáveis;
- alterações incrementais;
- teste local antes de subir para VM;
- commit por bloco de funcionalidade;
- deploy controlado na VM;
- documentação progressiva.

Padrão de comentários utilizado:

```js
/* =========================================================
   NOME DA SEÇÃO
   ========================================================= */
```

---

## 14. Observação importante sobre refatoração

A refatoração geral dos arquivos, especialmente `admin.css` e `admin.js`, deve ser feita somente após:

1. estabilização funcional;
2. conclusão dos refinos visuais;
3. testes completos;
4. validação em produção;
5. documentação da Fase 2.

Isso evita quebrar funcionalidades já estáveis antes da apresentação institucional.

---

## 15. Observação sobre arquivos sensíveis

Alguns arquivos e pastas não devem ser compartilhados publicamente ou enviados em pacotes de documentação sem revisão prévia.

Exemplos:

- `.env`;
- `node_modules/`;
- `midia/`;
- `data/painel-tv.db`;
- `data/painel-tv.db-shm`;
- `data/painel-tv.db-wal`;
- `backups/`;
- `.git/`.

Esses itens podem conter dados sensíveis, arquivos pesados, credenciais, histórico interno ou informações reais de operação.

---

## 16. Observação sobre Font Awesome

Atualmente o projeto utiliza Font Awesome via CDN externo.

Foi identificado que o Microsoft Edge pode exibir warnings relacionados a `cdnjs.cloudflare.com`, por causa de políticas de prevenção de rastreamento do próprio navegador.

Isso não foi identificado como falha do Cloudflare Tunnel nem como erro funcional do sistema.

Mesmo assim, foi registrada como melhoria futura a possibilidade de hospedar o Font Awesome localmente dentro do projeto, reduzindo dependência externa e removendo esses avisos no console do Edge.