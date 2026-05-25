# Documento Executivo — Painel Ribas
## Sistema Institucional de Comunicação Digital da Prefeitura de Ribas do Rio Pardo

---

# 1. Apresentação

O Painel Ribas é um sistema institucional de comunicação digital desenvolvido internamente pelo setor de Tecnologia da Informação da Prefeitura de Ribas do Rio Pardo.

O projeto foi criado com o objetivo de permitir a exibição automatizada de conteúdos institucionais em televisores instalados em repartições públicas, unidades de saúde, recepções e demais espaços de atendimento à população.

A solução permite centralizar o gerenciamento de vídeos, imagens e campanhas institucionais, facilitando a divulgação de ações da Prefeitura e melhorando a comunicação visual com os cidadãos.

---

# 2. Origem da demanda

A demanda surgiu a partir da necessidade de exibir:

- vídeos institucionais;
- campanhas públicas;
- ações das secretarias;
- conteúdos informativos;
- peças de comunicação visual.

Inicialmente, buscou-se uma solução semelhante aos sistemas utilizados em restaurantes, aeroportos, redes comerciais e painéis de mídia digital (Digital Signage).

O objetivo principal era:

- automatizar a reprodução dos conteúdos;
- reduzir trabalho manual;
- permitir atualização centralizada;
- criar um sistema simples e de baixo custo.

---

# 3. Primeira versão do sistema (Fase 1)

A primeira etapa do projeto consistiu no desenvolvimento de um player institucional leve, acessível via navegador.

Esse player foi projetado para:

- reproduzir vídeos em tela cheia;
- funcionar em Smart TVs;
- consumir poucos recursos;
- operar de forma contínua.

A primeira versão foi desenvolvida rapidamente para validar o conceito e realizar testes práticos.

---

# 4. Problemas encontrados nas Smart TVs

Durante os testes, foram identificadas limitações importantes nos navegadores internos das Smart TVs, especialmente em modelos LG utilizados pela Prefeitura.

Entre os problemas encontrados:

- bloqueio de autoplay;
- restrições de reprodução automática;
- falhas na troca automática de vídeos;
- inconsistências no comportamento do navegador;
- limitações de processamento.

Mesmo utilizando reprodução inicial sem áudio, alguns modelos passaram a bloquear automaticamente a continuidade da playlist após atualizações internas do navegador da TV.

Isso inviabilizou o uso totalmente dependente do navegador interno das televisões.

---

# 5. Mudança de estratégia operacional

Após análise técnica, optou-se pela utilização de computadores conectados às TVs.

Essa abordagem trouxe diversas vantagens:

- maior estabilidade;
- compatibilidade superior;
- melhor desempenho;
- maior controle operacional;
- facilidade de manutenção;
- funcionamento previsível.

A utilização de computadores também permitiu a evolução do projeto para uma plataforma administrativa mais robusta.

---

# 6. Evolução para a Fase 2

Com a estabilização do player, iniciou-se o desenvolvimento da segunda fase do projeto.

A Fase 2 adicionou uma dashboard administrativa completa, permitindo que o próprio setor de comunicação gerencie os conteúdos sem necessidade de intervenção técnica direta.

---

# 7. Funcionalidades atuais

O sistema atualmente possui:

## Player institucional

- reprodução automática de vídeos e imagens;
- playlist dinâmica;
- atualização automática;
- exibição em tela cheia;
- interface leve para operação contínua.

---

## Dashboard administrativa

- upload de mídias;
- gerenciamento de playlist;
- ordenação de conteúdos;
- ativação/desativação de mídias;
- programação por período;
- repetição automática;
- controle de prioridade;
- filtros avançados;
- gerenciamento de usuários;
- logs de auditoria;
- controle de permissões.

---

## Sistema de usuários

Perfis implementados:

- superadmin;
- admin;
- editor;
- viewer.

O sistema possui validações de segurança tanto no frontend quanto no backend.

---

## Logs de auditoria

O sistema registra ações administrativas importantes, incluindo:

- login;
- logout;
- uploads;
- exclusões;
- alterações;
- criação de usuários;
- redefinição de senha;
- alterações administrativas.

---

# 8. Infraestrutura utilizada

O sistema roda atualmente em uma máquina virtual (VM) da própria Prefeitura.

---

## Backend

Tecnologias utilizadas:

- Node.js;
- Express;
- SQLite.

---

## Gerenciamento do processo

O backend é mantido ativo utilizando PM2.

---

## Hospedagem

O sistema utiliza:

- VM institucional;
- Cloudflare Tunnel;
- domínio externo temporário.

---

## Objetivo da arquitetura

Toda a estrutura foi pensada para:

- reduzir custos;
- evitar contratação imediata de software;
- aproveitar infraestrutura já existente;
- manter controle interno da solução.

---

# 9. Upload de arquivos grandes

Como os conteúdos institucionais podem possuir arquivos de vídeo pesados, foi implementado um sistema de upload em partes (chunks).

Isso permite:

- maior estabilidade;
- uploads de arquivos grandes;
- feedback visual de progresso;
- menor risco de falha durante envio.

---

# 10. Segurança e controle

O sistema possui:

- autenticação;
- sessões protegidas;
- controle por perfil;
- logs de auditoria;
- proteções administrativas;
- backups automáticos de configurações críticas.

---

# 11. Benefícios para a Prefeitura

## Comunicação institucional centralizada

Permite padronizar campanhas e informações exibidas nas TVs institucionais.

---

## Redução de trabalho manual

O conteúdo pode ser atualizado remotamente sem necessidade de reconfiguração manual em cada tela.

---

## Baixo custo operacional

O projeto foi desenvolvido utilizando tecnologias gratuitas e infraestrutura já existente.

---

## Autonomia técnica

A Prefeitura passa a possuir uma solução própria, reduzindo dependência de fornecedores externos.

---

## Escalabilidade

A arquitetura permite expansão futura para:

- múltiplas unidades;
- múltiplas telas;
- relatórios;
- monitoramento remoto;
- campanhas programadas.

---

# 12. Estado atual do projeto

Atualmente o sistema encontra-se:

- funcional;
- em operação de testes;
- com dashboard administrativa implementada;
- com autenticação e controle de usuários;
- com gerenciamento de playlist operacional;
- em processo de refinamento visual e documental.

---

# 13. Próximas etapas planejadas

## Fase 3

Planejamento de melhorias:

- refinamento visual;
- otimização mobile;
- central de ajuda;
- tutoriais;
- melhorias de UX;
- monitoramento;
- melhorias operacionais.

---

## Fase 4

Possíveis evoluções futuras:

- relatórios;
- analytics;
- controle avançado de telas;
- dashboards estatísticas;
- gerenciamento remoto ampliado;
- arquitetura multiunidade.

---

# 14. Considerações finais

O Painel Ribas representa uma iniciativa de inovação interna voltada à modernização da comunicação institucional da Prefeitura.

Além de atender à necessidade operacional imediata, o projeto demonstra a capacidade de desenvolvimento interno de soluções tecnológicas adaptadas à realidade da administração pública.

O sistema continuará evoluindo conforme as necessidades institucionais, mantendo como princípios:

- baixo custo;
- autonomia;
- estabilidade;
- segurança;
- facilidade de uso;
- escalabilidade.

---

# 15. Responsável técnico

Projeto desenvolvido internamente pelo setor de Tecnologia da Informação da Prefeitura de Ribas do Rio Pardo.

---

# 16. Nome do projeto

```txt
Painel Ribas
Sistema Institucional de Comunicação Digital
```

---

# Conclusão

O Painel Ribas encontra-se em fase funcional e pronta para apresentação institucional.

A solução já está operando em ambiente de produção e permite à Prefeitura gerenciar, programar e exibir conteúdos institucionais em TVs de forma centralizada, com controle administrativo, segurança, rastreabilidade e autonomia técnica.

A Fase 2 consolidou o sistema como uma plataforma própria de comunicação digital, reduzindo dependência de soluções pagas externas e aproveitando a infraestrutura já disponível.

Entre os principais ganhos estão:

- autonomia para publicação de conteúdos;
- redução de custos com plataformas terceirizadas;
- controle centralizado das mídias;
- programação por período;
- priorização de conteúdos importantes;
- repetição controlada;
- upload de arquivos grandes;
- controle de usuários;
- logs de auditoria;
- operação em ambiente próprio da Prefeitura.

Com a Fase 2 concluída, o sistema está apto para apresentação à chefia e poderá evoluir em fases futuras com melhorias de usabilidade, documentação operacional, responsividade, monitoramento e expansão para novas unidades.