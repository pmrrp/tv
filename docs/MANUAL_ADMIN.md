# Manual do Administrador — Painel Ribas

## 1. Objetivo deste manual

Este manual orienta o uso da dashboard administrativa do Painel Ribas.

Ele foi criado para ajudar usuários responsáveis por alimentar, organizar e acompanhar os conteúdos exibidos nas TVs institucionais da Prefeitura.

O manual também registra orientações para superadministradores, incluindo backups, diagnóstico operacional, auditoria e cuidados básicos de manutenção.

---

## 2. Acesso ao painel

O painel administrativo é acessado pelo navegador.

Endereço atual:

```txt
https://painelribas.com.br/admin
```

Ao acessar, o usuário será direcionado para a tela de login.

---

## 3. Login

Para entrar no sistema:

1. Informe o usuário/e-mail cadastrado.
2. Informe a senha.
3. Clique em “Entrar”.

Caso os dados estejam corretos, o sistema abrirá a dashboard administrativa.

Caso ocorra erro, será exibida uma mensagem informando que o usuário ou senha são inválidos.

---

## 4. Tela inicial da dashboard

Após o login, o usuário verá a tela principal do painel.

Essa tela pode apresentar:

- cabeçalho do sistema;
- informações do usuário logado;
- cards de resumo;
- área de upload;
- biblioteca de mídias;
- área de usuários, conforme permissão;
- logs de auditoria, conforme permissão;
- seção de backups, conforme permissão;
- seção de diagnóstico, conforme permissão.

Nem todos os usuários visualizam todas as áreas. O sistema exibe ou oculta recursos conforme o perfil de acesso.

---

## 5. Perfis de usuário

O sistema possui diferentes perfis de acesso.

### Superadmin

Perfil com acesso mais completo.

Pode:

- gerenciar usuários;
- visualizar auditoria;
- visualizar backups;
- gerar backup do banco SQLite;
- acessar diagnóstico operacional;
- executar ações administrativas sensíveis.

Uso recomendado:

```txt
Administrador principal do sistema.
```

---

### Admin

Perfil administrativo comum.

Pode acessar recursos administrativos permitidos, mas não deve executar ações exclusivas de superadmin.

Uso recomendado:

```txt
Usuários de gestão ou operação avançada.
```

---

### Editor

Perfil voltado para operação de mídias.

Pode gerenciar conteúdos conforme permissões definidas.

Uso recomendado:

```txt
Equipe responsável por enviar, organizar e atualizar mídias.
```

---

### Viewer

Perfil de visualização.

Não deve realizar alterações sensíveis.

Uso recomendado:

```txt
Usuários que precisam apenas acompanhar informações.
```

---

## 6. Cards de resumo

Os cards de resumo mostram informações gerais sobre o sistema.

Podem incluir:

- total de mídias cadastradas;
- mídias ativas;
- mídias inativas;
- mídias agendadas;
- mídias vencidas;
- mídias com prioridade;
- mídias com recorrência;
- itens publicados na playlist;
- última atualização da playlist;
- uso de armazenamento das mídias.

Esses cards ajudam a acompanhar rapidamente a situação atual do painel.

---

## 7. Card de armazenamento

O card de armazenamento mostra o uso da pasta de mídias em relação ao limite operacional configurado.

Ele pode exibir:

- quanto já foi usado pela pasta `midia/`;
- limite operacional configurado;
- espaço livre dentro do limite;
- barra visual de progresso;
- estado OK, aviso ou crítico.

### Importante

O card não representa necessariamente o espaço total do disco da máquina.

Ele representa principalmente o limite operacional definido para a pasta de mídias.

Exemplo:

```txt
Limite operacional de mídias: 180 GB
Uso atual: 10 GB
Livre dentro do limite: 170 GB
```

O sistema também usa uma reserva mínima de disco livre para proteger a VM.

---

## 8. Envio de mídias

A área de upload permite enviar vídeos e imagens para o sistema.

### Tipos de arquivos aceitos

Vídeos:

```txt
MP4, WEBM, OGG, MOV
```

Imagens:

```txt
JPG, JPEG, PNG, WEBP, GIF
```

### Como enviar

1. Clique na área de seleção de arquivo.
2. Escolha o vídeo ou imagem desejado.
3. Confirme o envio.
4. Aguarde o progresso.
5. Após o envio, a mídia aparecerá na biblioteca.

Também é possível arrastar o arquivo para a área de upload, quando disponível.

---

## 9. Upload de arquivos grandes

O sistema possui envio em partes para arquivos grandes.

Isso significa que vídeos maiores são divididos em pedaços menores durante o upload e depois montados novamente no servidor.

Durante o envio:

- aguarde até a conclusão completa;
- não feche a página;
- evite trocar de rede;
- evite desligar o computador;
- aguarde a mensagem de sucesso.

Se houver falha no envio, o sistema exibirá uma mensagem de erro.

---

## 10. Bloqueio de upload por armazenamento

O sistema pode bloquear um upload quando identificar risco de armazenamento.

Isso pode acontecer quando:

- o arquivo ultrapassaria o limite operacional da pasta `midia/`;
- o upload deixaria o disco abaixo da reserva mínima de segurança;
- a finalização de um upload em partes colocaria o servidor em risco.

Quando isso ocorrer:

- o arquivo não será adicionado à biblioteca;
- o sistema exibirá uma mensagem amigável;
- o evento será registrado na auditoria;
- o operador deve liberar espaço ou procurar o administrador.

Essa proteção evita travamentos ou falhas por falta de espaço na VM.

---

## 11. Biblioteca de mídias

A biblioteca mostra todas as mídias cadastradas.

Cada card de mídia pode exibir:

- prévia;
- título amigável;
- nome do arquivo;
- tipo;
- status;
- prioridade;
- período de exibição;
- recorrência;
- detalhes;
- botões de ação.

A biblioteca pode iniciar recolhida para manter a dashboard mais limpa.

---

## 12. Título amigável da mídia

O título amigável é o nome usado para identificar a mídia dentro do painel.

Ele pode ser diferente do nome real do arquivo.

Exemplo:

Nome real:

```txt
video_obra_final_2026.mp4
```

Título amigável:

```txt
Obra de Pavimentação no Bairro Centro
```

Usar títulos claros facilita a organização da biblioteca.

---

## 13. Ativar ou desativar mídia

Cada mídia pode estar ativa ou inativa.

### Mídia ativa

A mídia pode aparecer na playlist, desde que esteja dentro do período de exibição.

### Mídia inativa

A mídia permanece cadastrada, mas não aparece no player.

Essa opção é útil para guardar conteúdos que poderão ser usados novamente depois.

### Comportamento do botão Ativo/Inativo

A TAG Ativo/Inativo funciona como um switch.

Ao clicar:

- o status muda imediatamente;
- o sistema salva automaticamente;
- não é necessário clicar em “Salvar alterações” apenas por ativar ou inativar.

Se ocorrer erro, o sistema retorna o card ao estado anterior.

---

## 14. Mídias inativas

Quando uma mídia está inativa, o sistema bloqueia a edição de algumas configurações.

Campos bloqueados:

- nome;
- duração;
- período;
- prioridade;
- recorrência.

Ações que continuam disponíveis:

- reativar;
- excluir;
- visualizar detalhes;
- selecionar em lote, quando aplicável.

Isso evita alterações confusas em mídias que não estão participando da playlist.

---

## 15. Período de exibição

O período de exibição define quando uma mídia deve aparecer no player.

É possível configurar:

- data/hora inicial;
- data/hora final;
- exibição por período indefinido.

### Exemplos de uso

Campanha temporária:

```txt
Início: 01/06/2026
Fim: 30/06/2026
```

Comunicado permanente:

```txt
Sem data final definida
```

Mídias fora do período configurado não entram na playlist.

---

## 16. Modal de período

O período de exibição é configurado por modal.

Esse modal permite:

- selecionar data inicial;
- selecionar data final;
- ajustar horário;
- usar período indeterminado;
- limpar campos;
- validar datas;
- aplicar período.

Ao clicar em “Aplicar período”, o sistema salva a configuração diretamente no backend.

Não é necessário clicar novamente no botão Salvar do card para concluir essa alteração.

---

## 17. Prioridade e repetição

A prioridade define a importância da mídia dentro da programação.

O sistema trabalha com três níveis:

- Normal;
- Alta;
- Urgente.

---

### Normal

A prioridade Normal é usada para conteúdos comuns.

Nesse caso:

- a mídia entra na playlist na ordem normal;
- o controle de repetição fica oculto;
- a mídia não recebe recorrência adicional.

Uso recomendado:

```txt
conteúdos informativos comuns
```

---

### Alta

A prioridade Alta é usada para conteúdos que merecem aparecer com mais frequência.

Ao selecionar Alta, o sistema libera o campo de repetição e sugere:

```txt
A cada 6 mídias
```

O usuário pode manter essa sugestão ou ajustar manualmente.

Uso recomendado:

```txt
campanhas importantes
avisos institucionais relevantes
```

---

### Urgente

A prioridade Urgente é usada para conteúdos de alta relevância.

Ao selecionar Urgente, o sistema libera o campo de repetição e sugere:

```txt
A cada 3 mídias
```

O usuário pode manter essa sugestão ou ajustar manualmente.

Uso recomendado:

```txt
avisos de grande relevância
comunicados importantes
campanhas prioritárias
```

---

## 18. Recorrência inteligente

A recorrência define de quanto em quanto tempo uma mídia deve aparecer novamente na playlist.

Exemplo:

```txt
Repetir a cada 6 mídias
```

Significa que a mídia poderá aparecer novamente após um bloco de mídias exibidas.

### Melhoria atual

O sistema agora evita que uma mídia repetida apareça muito próxima dela mesma.

Isso significa que ele tenta impedir situações como:

```txt
Campanha X
Campanha X
```

ou:

```txt
Campanha X
Outra mídia
Campanha X
```

quando isso ficaria visualmente incômodo.

### Loop da playlist

A playlist roda em ciclo.

Por isso, o sistema também considera a passagem do final da playlist para o início.

Isso evita que a contagem de repetição seja reiniciada de forma estranha quando a playlist volta ao começo.

### Observação importante

Em alguns casos, o sistema pode pular uma repetição para evitar que a mídia fique colada ou próxima demais dela mesma.

Isso é esperado.

A prioridade é manter uma exibição agradável e evitar sensação de bug visual.

---

## 19. Ordenação da playlist

A ordem das mídias na biblioteca influencia a ordem de exibição no player.

O operador pode reorganizar as mídias usando os controles de ordenação ou arraste, conforme disponível.

Após alterar a ordem:

- a configuração deve ser salva, quando aplicável;
- a playlist deve ser atualizada;
- o player receberá a nova programação após sincronização.

---

## 20. Filtros da biblioteca

A biblioteca possui filtros para facilitar a localização de mídias.

Filtros disponíveis podem incluir:

- busca textual;
- status;
- tipo;
- período;
- prioridade;
- recorrência.

### Aplicação dos filtros

Os filtros usam comportamento de rascunho.

Isso significa que alterar um filtro não aplica imediatamente.

Para aplicar:

```txt
Clique em “Aplicar filtros”.
```

Para cancelar:

```txt
Clique fora sem aplicar ou pressione ESC.
```

Para limpar:

```txt
Clique em “Limpar filtros”.
```

Esse comportamento evita filtros acidentais.

---

## 21. Detalhes da mídia

O botão Detalhes abre um modal com informações da mídia.

O modal pode exibir:

- título;
- nome real do arquivo;
- tipo;
- extensão;
- caminho;
- tamanho;
- ordem;
- duração;
- período;
- início;
- fim;
- prioridade;
- recorrência;
- status.

Esse recurso ajuda a verificar informações técnicas e operacionais sem abrir arquivos manualmente.

---

## 22. Excluir mídia

Uma mídia pode ser excluída individualmente ou em lote, conforme permissão.

Antes da exclusão, o sistema pode solicitar confirmação.

A exclusão remove o arquivo da biblioteca e impede que ele volte à playlist.

### Atenção

Excluir é diferente de inativar.

- Inativar: mantém a mídia cadastrada, mas fora da playlist.
- Excluir: remove a mídia do sistema.

Quando houver dúvida, prefira inativar.

---

## 23. Salvar alterações

Algumas alterações exigem salvamento manual, como:

- título amigável;
- prioridade;
- recorrência;
- duração de imagem;
- algumas configurações do card.

Quando há alteração pendente:

- o card pode ficar marcado;
- o botão de salvar aparece;
- o sistema pode alertar antes de sair.

---

## 24. Proteção contra perda de alterações

O sistema protege o usuário contra perda acidental de alterações.

Se houver edições não salvas, o sistema pode alertar ao:

- sair do painel;
- apertar F5;
- apertar Ctrl+R;
- sincronizar a biblioteca;
- tentar recarregar a página.

Algumas ações do navegador ainda exibem aviso nativo, como fechar a aba ou digitar novo endereço.

---

## 25. Sincronizar playlist/biblioteca

A sincronização atualiza os dados exibidos no painel e/ou publica novamente a playlist.

Se existirem alterações pendentes, o sistema pode bloquear a sincronização e orientar o usuário a salvar antes.

Isso evita que o painel descarte rascunhos sem querer.

---

## 26. Player

O player é a tela exibida nas TVs.

Ele:

- consome `playlist.json`;
- exibe vídeos e imagens em loop;
- atualiza a programação automaticamente;
- mostra visual institucional;
- roda no navegador do computador conectado à TV.

Endereço principal:

```txt
https://painelribas.com.br/
```

---

## 27. Atualização da playlist no player

O player sincroniza a playlist periodicamente.

Atualmente, a atualização é rápida para reduzir atraso em:

- novas mídias;
- mídias removidas;
- mídias ativadas/inativadas;
- campanhas agendadas;
- conteúdos vencidos.

O backend também revalida a playlist automaticamente em intervalo curto.

---

## 28. Usuários

A seção de usuários permite gerenciar contas do sistema.

Conforme permissão, é possível:

- listar usuários;
- criar usuário;
- editar usuário;
- alterar perfil;
- ativar/desativar usuário;
- resetar senha;
- excluir usuário.

---

## 29. Cuidados ao gerenciar usuários

O sistema possui proteções para evitar erros graves.

Exemplos:

- usuário não pode desativar a si mesmo;
- superadmin não pode excluir a própria conta logada;
- admin comum não pode alterar superadmin;
- admin comum não pode promover usuário para superadmin.

Essas proteções evitam perda de acesso ou escalada indevida de permissão.

---

## 30. Auditoria

A seção de Auditoria exibe ações importantes realizadas no sistema.

Ela pode registrar:

- login;
- logout;
- upload;
- upload bloqueado;
- edição de mídia;
- exclusão de mídia;
- exclusão em lote;
- criação de usuário;
- edição de usuário;
- alteração de status;
- reset de senha;
- exclusão de usuário;
- backup automático JSON;
- backup do banco SQLite;
- limpeza automática de chunks.

A auditoria ajuda a entender o que aconteceu no sistema e quando aconteceu.

---

## 31. Logs com detalhes técnicos

Alguns logs possuem detalhes técnicos expansíveis.

Esses detalhes podem incluir:

- nome do arquivo;
- tamanho;
- usuário;
- tipo de ação;
- motivo do bloqueio;
- estado do armazenamento;
- informações de backup;
- dados úteis para suporte.

O operador comum geralmente não precisa analisar esses detalhes.

Eles são mais úteis para suporte técnico e manutenção.

---

## 32. Backups

A seção Backups fica disponível para superadmin.

Ela mostra os backups existentes no sistema.

Tipos principais:

- backup de configurações de mídias;
- backup de playlist;
- backup do banco SQLite.

---

## 33. Backup automático JSON

O sistema cria backup automático de arquivos importantes quando há alteração.

Arquivos protegidos:

```txt
data/midia-config.json
playlist.json
```

Esses backups ajudam a recuperar configurações em caso de erro ou alteração indesejada.

---

## 34. Backup do banco SQLite

O banco SQLite armazena informações como:

- usuários;
- permissões;
- logs de auditoria.

O superadmin pode gerar backup manual do banco pela seção Backups.

Ao gerar backup:

- um arquivo `.db` é criado na pasta `backups/`;
- o evento é registrado na auditoria;
- a listagem de backups é atualizada;
- o diagnóstico passa a reconhecer esse backup.

---

## 35. Primeiro backup do banco na VM

Após a instalação da funcionalidade de backup SQLite, é normal que o diagnóstico avise que ainda não existe backup do banco.

Para resolver:

1. Entre no painel como superadmin.
2. Abra a seção Backups.
3. Clique em Backup do banco.
4. Confirme.
5. Atualize o Diagnóstico.

Após isso, o aviso deve desaparecer.

---

## 36. Diagnóstico operacional

A seção Diagnóstico fica disponível para superadmin.

Ela verifica a saúde operacional do sistema.

Pode mostrar:

- status geral;
- banco SQLite;
- armazenamento;
- backups;
- mídias;
- arquivos essenciais;
- avisos;
- problemas críticos.

---

## 37. Como interpretar o diagnóstico

### Sistema OK

Indica que não há problemas relevantes detectados.

---

### Sistema com avisos

Indica que o sistema está funcionando, mas existe algum ponto de atenção.

Exemplos:

- disco se aproximando da reserva mínima;
- ausência de backup do banco;
- algum item que merece conferência.

O aviso deve ser lido e avaliado.

Nem todo aviso significa erro.

---

### Sistema crítico

Indica problema mais sério.

Nesse caso:

- verificar mensagem exibida;
- evitar novos uploads;
- conferir armazenamento;
- consultar logs;
- procurar suporte técnico.

---

## 38. Health público

O sistema possui uma rota pública de health check:

```txt
/api/health
```

Ela verifica se o servidor está respondendo.

Essa rota não substitui o diagnóstico operacional.

Diferença:

- `/api/health`: indica se o servidor está vivo.
- `/api/admin/diagnostico`: verifica a saúde operacional do sistema.

---

## 39. Boas práticas para mídias

Para melhor funcionamento:

- usar vídeos em MP4;
- preferir codec H.264;
- preferir áudio AAC;
- usar resolução 1920x1080 quando possível;
- evitar vídeos desnecessariamente pesados;
- usar nomes/títulos claros;
- revisar campanhas vencidas;
- inativar conteúdos que não devem mais aparecer;
- evitar muitas mídias urgentes ao mesmo tempo.

---

## 40. Boas práticas para recorrência

Use recorrência apenas para conteúdos que precisam aparecer com mais frequência.

Evite marcar muitas mídias como Alta ou Urgente ao mesmo tempo.

Se muitas mídias tiverem recorrência, a playlist pode ficar menos previsível.

Recomendação:

- Normal: conteúdos comuns;
- Alta: campanhas importantes;
- Urgente: avisos realmente prioritários.

---

## 41. Boas práticas para armazenamento

Para manter o sistema saudável:

- excluir mídias antigas que não serão mais usadas;
- evitar vídeos muito grandes;
- acompanhar o card de armazenamento;
- respeitar mensagens de bloqueio;
- manter reserva de espaço livre na VM;
- gerar backups antes de grandes alterações.

---

## 42. Boas práticas para operação na TV

Nos computadores conectados às TVs:

- manter o navegador aberto no player;
- evitar abrir outras abas;
- manter energia configurada para não suspender;
- usar modo quiosque quando configurado;
- verificar saída de áudio HDMI;
- preferir rede cabeada quando possível;
- evitar depender de Wi-Fi instável para vídeos pesados.

---

## 43. Problemas comuns

### A mídia não aparece no player

Verificar:

- a mídia está ativa?
- está dentro do período de exibição?
- está vencida?
- está agendada para o futuro?
- a playlist foi atualizada?
- o player já sincronizou?
- o arquivo ainda existe na pasta `midia/`?

---

### O upload foi bloqueado

Possíveis causas:

- arquivo muito grande;
- limite da pasta de mídias seria ultrapassado;
- disco ficaria abaixo da reserva mínima;
- formato não permitido.

Ação recomendada:

- verificar mensagem exibida;
- liberar espaço;
- tentar arquivo menor;
- otimizar vídeo;
- procurar superadmin.

---

### O diagnóstico mostra aviso

Ler o texto do aviso.

Exemplos comuns:

- backup do banco ainda não foi criado;
- disco está se aproximando da reserva mínima.

Ação recomendada:

- seguir a orientação do próprio aviso;
- verificar seção Backups;
- verificar armazenamento;
- procurar suporte técnico se necessário.

---

### O player trava

Possíveis causas:

- internet instável;
- Wi-Fi fraco;
- vídeo muito pesado;
- computador com baixo desempenho;
- navegador travado;
- problema temporário no servidor.

Ação recomendada:

- testar internet local;
- testar com 4G/5G se possível;
- reiniciar navegador;
- verificar se outros serviços também estão lentos;
- conferir se o player funciona em outro ponto.

---

### A TV está sem som

Verificar:

- volume da TV;
- volume do Windows;
- saída de áudio HDMI;
- navegador em modo mudo;
- vídeo possui áudio;
- cabo HDMI;
- dispositivo de saída padrão do Windows.

---

## 44. O que evitar

Evite:

- fechar a aba durante upload;
- desligar computador durante upload;
- excluir mídia sem necessidade;
- marcar muitas mídias como urgente;
- usar vídeos gigantes sem necessidade;
- deixar a VM sem espaço;
- alterar arquivos manualmente na VM sem registrar;
- mexer no `.env` sem reiniciar o PM2;
- compartilhar senha de superadmin.

---

## 45. Quando procurar suporte técnico

Procure suporte técnico quando:

- o sistema não abre;
- o login não funciona;
- o player não carrega;
- uploads falham repetidamente;
- diagnóstico mostrar estado crítico;
- backups não forem gerados;
- a VM estiver sem espaço;
- houver erro vermelho no console;
- houver erro no terminal/PM2.

---

## 46. Resumo rápido de uso

Fluxo comum para adicionar uma mídia:

1. Entrar no painel.
2. Enviar a mídia.
3. Conferir na biblioteca.
4. Ajustar título amigável.
5. Definir prioridade, se necessário.
6. Definir período, se necessário.
7. Salvar alterações, quando aplicável.
8. Conferir playlist/player.

---

## 47. Resumo rápido para superadmin

Rotina recomendada:

- acompanhar card de armazenamento;
- conferir logs de auditoria;
- conferir seção Backups;
- gerar backup do banco antes de grandes alterações;
- conferir Diagnóstico após deploys;
- manter usuários atualizados;
- remover ou inativar conteúdos antigos;
- validar player após alterações relevantes.

---

## 48. Observação final

O Painel Ribas foi desenvolvido para facilitar a comunicação institucional da Prefeitura.

O uso correto do painel depende de:

- organização das mídias;
- cuidado com vídeos muito pesados;
- atenção aos períodos de exibição;
- uso responsável de prioridade/recorrência;
- acompanhamento de armazenamento;
- backups e diagnóstico por superadmin.

A ferramenta foi criada para ser simples no uso diário, mas possui recursos administrativos importantes para manter a operação segura e estável.