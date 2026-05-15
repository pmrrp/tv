# Manual do Administrador — Painel Ribas

## 1. Objetivo deste manual

Este manual orienta o uso da dashboard administrativa do Painel Ribas.

Ele foi criado para ajudar usuários responsáveis por alimentar, organizar e acompanhar os conteúdos exibidos nas TVs institucionais da Prefeitura.

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

Essa tela apresenta:

- cabeçalho do sistema;
- informações do usuário logado;
- cards de resumo;
- área de upload;
- biblioteca de mídias;
- área de usuários;
- logs de auditoria, conforme permissão.

---

## 5. Cards de resumo

Os cards de resumo mostram informações gerais sobre o sistema.

Podem incluir:

- total de mídias cadastradas;
- mídias ativas;
- mídias inativas;
- mídias agendadas;
- mídias vencidas;
- mídias com prioridade;
- itens publicados na playlist;
- última atualização da playlist.

Esses cards ajudam a acompanhar rapidamente a situação atual do painel.

---

## 6. Envio de mídias

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

## 7. Upload de arquivos grandes

O sistema possui envio em partes para arquivos grandes.

Isso significa que vídeos maiores são divididos em pedaços menores durante o upload e depois montados novamente no servidor.

Durante o envio, aguarde até a conclusão completa do processo.

Evite fechar a página durante o upload.

---

## 8. Biblioteca de mídias

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

---

## 9. Título amigável da mídia

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

## 10. Ativar ou desativar mídia

Cada mídia pode estar ativa ou inativa.

### Mídia ativa

A mídia pode aparecer na playlist, desde que esteja dentro do período de exibição.

### Mídia inativa

A mídia permanece cadastrada, mas não aparece no player.

Essa opção é útil para guardar conteúdos que poderão ser usados novamente depois.

---

## 11. Período de exibição

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

## 12. Prioridade

A prioridade define o peso de uma mídia dentro da playlist.

Perfis de prioridade:

- normal;
- alta;
- urgente.

### Uso recomendado

Normal:

```txt
conteúdos comuns
```

Alta:

```txt
campanhas importantes
```

Urgente:

```txt
avisos de grande relevância
```

---

## 13. Recorrência / repetição

A recorrência permite fazer uma mídia reaparecer com maior frequência na playlist.

Exemplo:

```txt
Repetir a cada 4 mídias
```

Isso faz com que o conteúdo seja exibido mais vezes durante o ciclo.

---

## 14. Ordenação das mídias

As mídias podem ser organizadas manualmente.

A ordem influencia a sequência de exibição no player.

Use a alça de arraste ou botões de movimentação, conforme disponível na interface.

Após alterar a ordem, salve as alterações.

---

## 15. Salvar alterações

Quando uma mídia é alterada, o sistema habilita a opção de salvar.

Alterações comuns:

- título;
- status;
- período;
- prioridade;
- recorrência;
- ordem.

Após salvar, a playlist é atualizada automaticamente.

---

## 16. Excluir mídia

Uma mídia pode ser excluída individualmente.

Antes da exclusão, o sistema exibirá uma confirmação.

A exclusão remove o arquivo da biblioteca e atualiza a playlist.

Use essa opção com cuidado.

---

## 17. Exclusão em lote

O sistema permite selecionar múltiplas mídias e excluir em lote.

Essa ação é útil para limpeza de conteúdos antigos ou testes.

Antes de excluir, confira se os arquivos selecionados estão corretos.

---

## 18. Filtros da biblioteca

A biblioteca possui filtros para facilitar a busca.

Filtros disponíveis:

- busca textual;
- status;
- tipo;
- período;
- prioridade;
- recorrência.

### Como aplicar filtros

1. Clique no botão de filtros.
2. Escolha os critérios desejados.
3. Clique em “Aplicar filtros”.

O sistema exibirá um contador indicando quantos filtros estão ativos.

### Como limpar filtros

Clique em “Limpar filtros” para voltar à listagem completa.

Se o usuário abrir o filtro, mudar opções e clicar fora sem aplicar, o sistema descarta o rascunho automaticamente.

---

## 19. Geração da playlist

A playlist é gerada automaticamente pelo sistema.

Ela é atualizada quando:

- uma mídia é enviada;
- uma mídia é editada;
- uma mídia é excluída;
- a ordem é alterada;
- o período de exibição muda;
- a rotina automática verifica mídias vencidas/agendadas.

O player consome essa playlist para exibir os conteúdos.

---

## 20. Usuários

Usuários com permissão administrativa podem gerenciar outros usuários.

A área de usuários permite:

- listar usuários;
- criar usuário;
- editar usuário;
- ativar/desativar;
- resetar senha;
- excluir usuário, quando permitido.

---

## 21. Perfis de usuário

O sistema possui perfis diferentes.

### Superadmin

Acesso total ao sistema.

Pode:

- gerenciar mídias;
- gerenciar usuários;
- excluir usuários;
- visualizar logs.

### Admin

Perfil administrativo.

Pode gerenciar conteúdos e usuários comuns, conforme regras do sistema.

### Editor

Pode gerenciar mídias e conteúdos.

### Viewer

Perfil de visualização.

Não deve realizar alterações sensíveis.

---

## 22. Criar usuário

Para criar um usuário:

1. Acesse a área de usuários.
2. Clique em “Novo usuário”.
3. Informe nome.
4. Informe e-mail/login.
5. Informe senha inicial.
6. Escolha o perfil.
7. Salve.

Após criado, o usuário poderá acessar o painel conforme o perfil definido.

---

## 23. Editar usuário

Para editar:

1. Localize o usuário na lista.
2. Clique em “Editar”.
3. Ajuste os dados permitidos.
4. Salve.

O sistema possui proteções para evitar alterações perigosas em usuários superadmin.

---

## 24. Resetar senha

Para redefinir a senha de um usuário:

1. Localize o usuário.
2. Clique em “Resetar senha”.
3. Informe a nova senha.
4. Confirme.

A senha será salva de forma protegida no sistema.

---

## 25. Ativar ou desativar usuário

Usuários podem ser ativados ou desativados.

Usuário desativado não consegue acessar o painel.

O sistema impede que um usuário desative a própria conta logada.

---

## 26. Excluir usuário

A exclusão de usuário é permitida apenas para perfil superadmin.

O sistema impede que o superadmin exclua a própria conta logada.

Toda exclusão é registrada nos logs de auditoria.

---

## 27. Logs de auditoria

Os logs mostram ações importantes realizadas no sistema.

Podem ser registrados:

- login;
- logout;
- upload;
- edição;
- exclusão;
- criação de usuário;
- alteração de status;
- reset de senha;
- exclusão de usuário.

Os logs ajudam na rastreabilidade e segurança administrativa.

---

## 28. Boas práticas para uso

Recomendações:

- usar nomes claros nas mídias;
- evitar enviar arquivos duplicados;
- conferir período de exibição;
- usar prioridade urgente apenas quando necessário;
- limpar mídias antigas periodicamente;
- revisar a playlist após alterações grandes;
- não compartilhar senha;
- criar usuários individuais para cada operador;
- evitar usar contas genéricas;
- conferir filtros antes de concluir que uma mídia sumiu.

---

## 29. Cuidados com arquivos grandes

Ao enviar vídeos grandes:

- mantenha a aba aberta;
- aguarde o término do upload;
- evite atualizar a página;
- confira se a mídia apareceu na biblioteca;
- teste se a playlist foi atualizada.

---

## 30. Problemas comuns

### A mídia não aparece no player

Verificar:

- se está ativa;
- se está dentro do período de exibição;
- se a playlist foi atualizada;
- se há filtros ocultando a mídia na biblioteca;
- se o arquivo foi enviado corretamente.

---

### Não consigo salvar alterações

Verificar:

- se o usuário tem permissão;
- se houve alteração real no card;
- se a sessão não expirou.

---

### O filtro parece não funcionar

Verificar:

- se clicou em “Aplicar filtros”;
- se há filtros anteriores ativos;
- se o botão mostra contador;
- se é necessário clicar em “Limpar filtros”.

---

### O upload não conclui

Verificar:

- tamanho do arquivo;
- conexão;
- se a página foi fechada;
- se o servidor está online.

---

## 31. Encerramento de sessão

Ao terminar de usar o sistema, recomenda-se clicar em “Sair”.

Isso evita que outra pessoa utilize o painel com a conta aberta.

---

## 32. Observação final

O Painel Ribas foi criado para facilitar a comunicação institucional da Prefeitura.

O uso correto da dashboard garante que os conteúdos sejam exibidos nas TVs públicas de forma organizada, segura e atualizada.