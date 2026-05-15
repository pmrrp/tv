# HISTÓRICO DO PROJETO — PAINEL TV RIBAS

## 1. ORIGEM DO PROJETO

O projeto Painel TV Ribas surgiu a partir de uma solicitação interna da Diretoria de Gestão de TI da Prefeitura Municipal de Ribas do Rio Pardo.

O objetivo inicial era criar uma solução simples e de baixo custo para exibição de vídeos institucionais da gestão municipal em televisores instalados em setores públicos, como:

- recepções
- unidades de saúde
- prédios administrativos
- ambientes institucionais

A proposta era semelhante a sistemas de Digital Signage utilizados em estabelecimentos comerciais, como:

- restaurantes
- redes de fast food
- lojas
- painéis informativos

Na época do início do projeto, ainda não havia uma plataforma administrativa completa. A ideia inicial era apenas reproduzir vídeos em tela cheia de forma leve e automática.

---

# 2. PRIMEIRA IMPLEMENTAÇÃO (FASE 1)

A primeira versão do sistema foi desenvolvida como um player extremamente leve, focado em compatibilidade com navegadores de Smart TVs.

## Características da primeira versão

- reprodução automática de vídeos
- interface minimalista
- sidebar lateral com controles básicos
- funcionamento diretamente no navegador da TV
- baixo consumo de processamento
- sistema totalmente gratuito

## Tecnologias utilizadas inicialmente

- HTML
- CSS
- JavaScript puro
- playlist JSON
- PowerShell
- GitHub Pages (fase inicial de testes)

---

# 3. DESAFIOS ENCONTRADOS NA FASE 1

Durante os testes iniciais, o sistema funcionou corretamente em:

- computadores
- navegador Google Chrome
- televisores Samsung

Porém, problemas começaram a ocorrer principalmente em televisores LG utilizados pela Prefeitura.

## Problema principal

Os navegadores das Smart TVs passaram a bloquear o autoplay dos vídeos.

Inicialmente:
- os vídeos reproduziam automaticamente apenas no modo mudo.

Depois:
- mesmo mutados, os vídeos deixaram de avançar automaticamente.

Isso gerava necessidade de intervenção manual constante:
- apertar play
- ativar som
- reiniciar reprodução a cada troca de vídeo

O comportamento inviabilizava o uso profissional do sistema diretamente no navegador das TVs.

---

# 4. DECISÃO ARQUITETURAL

Após análise técnica, foi decidido abandonar a dependência do navegador interno das Smart TVs.

A solução escolhida foi utilizar computadores dedicados (mini PCs ou desktops simples) conectados às TVs.

## Motivos da decisão

- navegadores de PC possuem suporte completo
- maior estabilidade operacional
- melhor desempenho
- compatibilidade com autoplay
- maior capacidade futura de expansão
- facilidade de manutenção

Essa mudança marcou o início da Fase 2 do projeto.

---

# 5. EVOLUÇÃO PARA PLATAFORMA ADMINISTRATIVA (FASE 2)

Com a adoção de computadores dedicados, surgiu a necessidade de uma plataforma mais robusta.

O sistema evoluiu de um simples player para uma plataforma administrativa completa de gerenciamento de mídia institucional.

## Novos recursos implementados

- dashboard administrativa
- upload de vídeos
- upload de imagens
- gerenciamento de playlist
- ordenação de mídia
- exclusão de arquivos
- sistema de usuários
- permissões por perfil
- auditoria de ações
- backups automáticos
- filtros avançados
- logs de sistema

---

# 6. INFRAESTRUTURA

## Hospedagem

O sistema passou a ser hospedado em uma Virtual Machine (VM) disponibilizada pela infraestrutura da Prefeitura.

## Objetivos da infraestrutura

- custo zero de licenciamento
- independência de plataformas pagas
- controle interno
- facilidade de expansão futura

---

# 7. CLOUDFARE TUNNEL

Para evitar exposição direta do servidor da Prefeitura na internet, foi adotado o Cloudflare Tunnel.

## Benefícios

- ocultação do IP do servidor
- maior segurança
- acesso externo seguro
- SSL automático
- facilidade de gerenciamento

## Domínio utilizado

Inicialmente:
- painelribas.com.br

Também foi preparado suporte futuro para:
- tv.ribasdoriopardo.ms.gov.br

---

# 8. LIMITAÇÕES ENCONTRADAS

## Upload de arquivos grandes

O Cloudflare gratuito possui limitações de tamanho de upload.

Isso gerou problemas durante envio de vídeos maiores.

## Solução implementada

Foi desenvolvido um sistema de upload em partes (chunked upload), permitindo:

- envio de arquivos grandes
- retomada segura
- maior estabilidade
- redução de falhas

---

# 9. AUTOMAÇÕES IMPLEMENTADAS

O projeto conta atualmente com:

## PM2

Gerenciamento automático do processo Node.js.

## Agendador de Tarefas do Windows Server (VM)

Responsável por:
- inicialização automática
- recuperação após reinicialização
- atualização automática de playlist
- inicialização do Cloudflare Tunnel

---

# 10. SITUAÇÃO ATUAL

Atualmente o sistema possui:

- player operacional
- painel administrativo funcional
- autenticação
- auditoria
- uploads grandes
- gerenciamento de usuários
- controle de permissões
- backups automáticos
- deploy via Git
- hospedagem própria
- funcionamento contínuo
- agendamento de conteúdo
- gerenciamento remoto

O projeto encontra-se em fase de refinamento visual, documentação e preparação para expansão futura.

---

# 11. ROADMAP FUTURO

## Fase 3 (planejada)

- múltiplas TVs
- grupos de exibição
- playlists independentes
- polimento e refino visual e de usabilidade

## Fase 4 (planejada)

- analytics
- monitoramento em tempo real
- aplicação mobile
- relatórios de exibição
- cache offline
- dashboards gerenciais

---

# 12. CONSIDERAÇÕES FINAIS

O Painel TV Ribas deixou de ser apenas um player simples de vídeos e evoluiu para uma plataforma institucional de comunicação interna e exibição de conteúdo multimídia.

Todo o desenvolvimento foi realizado priorizando:

- baixo custo
- independência tecnológica
- estabilidade
- segurança
- facilidade operacional
- possibilidade de crescimento futuro

O projeto continua em evolução contínua.