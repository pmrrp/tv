# Checklist de Implantação de PC/TV — Painel Ribas

## 1. Objetivo

Este checklist serve para orientar e registrar a preparação de computadores ou mini PCs que serão usados nas TVs institucionais do Painel Ribas.

Ele deve ser usado junto com o documento completo:

```txt
docs/GUIA_PREPARACAO_PC_TV.md
```

O guia completo explica os procedimentos.  
Este checklist serve para execução rápida, conferência em bancada, instalação no ponto e validação final.

---

## 2. Identificação do ponto

Preencher antes ou durante a implantação.

```txt
Local/Unidade:
Secretaria:
Setor:
Responsável local:
Técnico responsável:
Data da preparação:
Data da instalação:
```

---

## 3. Identificação do equipamento

```txt
Nome do computador:
Patrimônio:
Marca/modelo:
Tipo: Desktop / Mini PC / Notebook
Sistema operacional:
Usuário local:
AnyDesk ID:
Tipo de conexão: Cabo / Wi-Fi
Nome da rede, se Wi-Fi:
TV utilizada:
Resolução configurada:
Observações:
```

> Atenção: senhas do Windows e AnyDesk devem ser registradas apenas em controle interno restrito da TI, nunca em documentos públicos ou relatórios compartilhados.

---

# PARTE 1 — Preparação inicial do Windows

---

## 4. Sistema e limpeza

- [ ] Windows restaurado, formatado ou revisado.
- [ ] Arquivos antigos removidos.
- [ ] Contas antigas removidas ou desativadas, quando aplicável.
- [ ] Aplicativos desnecessários removidos.
- [ ] Antivírus trial removido, quando existir.
- [ ] Apps promocionais/fabricante removidos, quando não necessários.
- [ ] OneDrive desativado/removido, se não for usado.
- [ ] Teams, Xbox, jogos, notícias e apps similares removidos/desativados.
- [ ] Nenhum programa desnecessário iniciando com o Windows.

---

## 5. Nome e conta do equipamento

- [ ] Nome do PC definido no padrão `PAINEL-TV-XX`.
- [ ] Conta local criada para uso do painel.
- [ ] Conta local nomeada como `Painel` ou padrão definido pela TI.
- [ ] Senha definida e registrada em controle interno da TI.
- [ ] Conta pessoal/Microsoft não está sendo usada para operação do painel.
- [ ] Login automático configurado.
- [ ] Reinício testado com entrada automática no Windows.

---

## 6. Privacidade, notificações e pop-ups

- [ ] Localização desativada, salvo necessidade da TI.
- [ ] Dados de diagnóstico opcionais desativados.
- [ ] ID de publicidade desativado.
- [ ] Sugestões e dicas do Windows desativadas.
- [ ] Experiência de boas-vindas do Windows desativada.
- [ ] Notificações na tela de bloqueio desativadas.
- [ ] Reabertura automática de aplicativos desativada.
- [ ] Aplicativos de inicialização revisados.
- [ ] Nenhum pop-up apareceu durante o teste prolongado.

---

## 7. Windows Update

- [ ] Windows Update executado.
- [ ] Atualizações pendentes instaladas.
- [ ] PC reiniciado após atualizações.
- [ ] Nova verificação feita após reinício.
- [ ] Nenhuma atualização crítica pendente.
- [ ] Horário e data do Windows conferidos.

---

# PARTE 2 — Energia e BIOS

---

## 8. Energia do Windows

- [ ] Tela configurada para nunca desligar.
- [ ] Suspensão configurada como nunca.
- [ ] Hibernação desativada com `powercfg -h off`.
- [ ] Suspensão híbrida desativada.
- [ ] Disco rígido configurado para não desligar automaticamente.
- [ ] Suspensão seletiva USB desativada.
- [ ] PC permanece ligado durante teste prolongado.

---

## 9. BIOS/UEFI

- [ ] BIOS acessada e revisada.
- [ ] Opção de ligar após queda de energia configurada.
- [ ] `Restore AC Power Loss`, `AC Recovery` ou equivalente definido como `Power On`, `Always On` ou equivalente.
- [ ] PC liga sozinho após retorno da energia.
- [ ] Verificação de teclado/mouse ajustada, quando disponível.
- [ ] `Halt On` configurado como `No Errors`, quando disponível.
- [ ] `Wait for F1 if Error` desativado, quando disponível.
- [ ] Erro de teclado/mouse desativado, quando disponível.
- [ ] PC inicia sem teclado e mouse conectados.
- [ ] Suporte USB/Legacy USB mantido habilitado.

---

# PARTE 3 — Chrome, quiosque e player

---

## 10. Google Chrome

- [ ] Google Chrome instalado.
- [ ] Chrome aberto uma vez para configuração inicial.
- [ ] Nenhuma conta Google pessoal logada no Chrome.
- [ ] Player testado manualmente no Chrome.
- [ ] Site carregado corretamente:

```txt
https://painelribas.com.br/
```

---

## 11. Atalho em modo quiosque

- [ ] Atalho do Chrome em modo quiosque criado.
- [ ] Atalho nomeado como `Painel Ribas - Quiosque`.
- [ ] Atalho usando perfil separado do Chrome.
- [ ] Atalho usando `--kiosk`.
- [ ] Atalho usando `--no-first-run`.
- [ ] Atalho usando `--disable-session-crashed-bubble`.
- [ ] Atalho usando `--autoplay-policy=no-user-gesture-required`.
- [ ] Atalho testado manualmente.
- [ ] Player abre em tela cheia.
- [ ] Barra de endereço não aparece.
- [ ] Player exibe mídias corretamente.
- [ ] Saída do modo quiosque testada com `Alt + F4`.

Comando base recomendado:

```txt
"C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\PainelChromeQuiosque" --kiosk --no-first-run --disable-session-crashed-bubble --autoplay-policy=no-user-gesture-required "https://painelribas.com.br/"
```

Caminho alternativo, se necessário:

```txt
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\PainelChromeQuiosque" --kiosk --no-first-run --disable-session-crashed-bubble --autoplay-policy=no-user-gesture-required "https://painelribas.com.br/"
```

---

## 12. Inicialização automática do player

- [ ] Pasta de inicialização aberta com `shell:startup`.
- [ ] Atalho `Painel Ribas - Quiosque` copiado para a inicialização.
- [ ] PC reiniciado.
- [ ] Windows entrou automaticamente.
- [ ] Chrome abriu automaticamente.
- [ ] Player carregou automaticamente.
- [ ] Player entrou em tela cheia.
- [ ] Nenhuma janela indesejada apareceu por cima do player.

---

# PARTE 4 — Rede, tela e áudio

---

## 13. Rede

- [ ] Internet funcionando.
- [ ] Rede cabeada usada, se disponível.
- [ ] Wi-Fi configurado, se cabo não for possível.
- [ ] Wi-Fi reconecta automaticamente, se utilizado.
- [ ] Player carregou pela rede local.
- [ ] AnyDesk conectou pela rede.
- [ ] Teste de reprodução feito por alguns minutos.
- [ ] Sem travamentos relevantes durante o teste.
- [ ] Se houve travamento, teste comparativo de rede realizado.

---

## 14. Tela/TV

- [ ] PC conectado à TV via HDMI.
- [ ] Imagem aparece na TV.
- [ ] Resolução configurada, preferencialmente 1920x1080.
- [ ] Escala configurada em 100% ou recomendada.
- [ ] Orientação definida como paisagem.
- [ ] Imagem sem cortes nas bordas.
- [ ] Configuração da TV ajustada para tela cheia/sem overscan, se necessário.
- [ ] Player ocupa a tela corretamente.

---

## 15. Áudio HDMI

- [ ] Saída de áudio configurada para TV/HDMI.
- [ ] Volume do Windows conferido.
- [ ] Volume da TV conferido.
- [ ] Chrome não está silenciado.
- [ ] Vídeo com áudio testado.
- [ ] Som sai pela TV.
- [ ] Áudio continua funcionando após reinício.

---

# PARTE 5 — AnyDesk e suporte remoto

---

## 16. AnyDesk

- [ ] AnyDesk instalado, não apenas executado em modo portátil.
- [ ] ID do AnyDesk registrado.
- [ ] AnyDesk configurado para iniciar com o Windows.
- [ ] Acesso não supervisionado ativado.
- [ ] Senha forte configurada.
- [ ] Permissões de controle remoto revisadas.
- [ ] Acesso remoto testado de outro computador.
- [ ] Acesso remoto testado após reinício.
- [ ] AnyDesk acessível com o player em execução.

---

# PARTE 6 — Testes finais

---

## 17. Teste em bancada

- [ ] PC liga normalmente.
- [ ] Windows entra sem pedir senha.
- [ ] Player abre automaticamente.
- [ ] Player carrega a playlist.
- [ ] Mídias são exibidas.
- [ ] Áudio testado.
- [ ] AnyDesk testado.
- [ ] Nenhum pop-up aparece.
- [ ] Nenhum aplicativo indesejado abre.
- [ ] PC não suspende.
- [ ] Tela não desliga.
- [ ] Rodagem prolongada realizada.

Tempo sugerido de teste:

```txt
30 a 60 minutos em bancada antes da instalação definitiva.
```

---

## 18. Teste sem teclado e mouse

- [ ] PC desligado.
- [ ] Teclado removido.
- [ ] Mouse removido.
- [ ] PC ligado novamente.
- [ ] Nenhuma mensagem de erro de teclado/mouse apareceu.
- [ ] Windows iniciou normalmente.
- [ ] Player abriu automaticamente.
- [ ] AnyDesk continuou acessível.

---

## 19. Teste de queda de energia

- [ ] Player deixado em execução.
- [ ] Energia do PC interrompida.
- [ ] Aguardado alguns segundos.
- [ ] Energia reconectada.
- [ ] PC ligou sozinho.
- [ ] Windows entrou automaticamente.
- [ ] Chrome abriu automaticamente.
- [ ] Player carregou automaticamente.
- [ ] AnyDesk voltou a ficar acessível.
- [ ] Nenhuma intervenção manual foi necessária.

Resultado esperado:

```txt
Energia voltou
↓
PC ligou sozinho
↓
Windows entrou no usuário do painel
↓
Chrome abriu em modo quiosque
↓
Painel Ribas carregou
↓
TV voltou a exibir os conteúdos
```

---

# PARTE 7 — Validação do ponto instalado

---

## 20. Teste no local definitivo

- [ ] PC instalado no local definitivo.
- [ ] TV posicionada corretamente.
- [ ] Cabo HDMI conectado.
- [ ] Energia estabilizada.
- [ ] Rede conectada.
- [ ] Player abriu automaticamente.
- [ ] Conteúdo exibido corretamente.
- [ ] Áudio validado, se aplicável.
- [ ] AnyDesk acessível no local.
- [ ] Responsável local orientado sobre ligar/desligar a TV.
- [ ] Técnico confirmou funcionamento final.

---

## 21. Orientação ao responsável local

Informar ao responsável local:

- [ ] Não usar o PC para navegação comum.
- [ ] Não fechar o player.
- [ ] Não instalar programas.
- [ ] Não desligar o PC manualmente sem orientação.
- [ ] Em caso de tela preta, informar a TI.
- [ ] Em caso de TV sem som, verificar volume da TV antes de acionar suporte.
- [ ] Em caso de internet ruim, a reprodução pode travar.
- [ ] O suporte remoto será feito pela TI via AnyDesk.

---

# PARTE — Player Agent local e Kit Ponto TV

## Player Agent local

- [ ] Pasta do Player Agent presente no computador.
- [ ] `config.agent.json` conferido.
- [ ] Servidor principal configurado corretamente no agente.
- [ ] Tarefa agendada do Player Agent criada.
- [ ] Player Agent inicia automaticamente com o Windows.
- [ ] Endpoint local `http://localhost:3579/health` responde.
- [ ] Playlist local `http://localhost:3579/playlist.json` responde.
- [ ] Pasta local de mídias em cache criada.
- [ ] Mídias da playlist foram baixadas para cache local.
- [ ] Limpeza de mídias antigas configurada.
- [ ] Logs do agente gerados corretamente.

## Teste de fallback local

- [ ] Player abre normalmente usando o servidor principal.
- [ ] Servidor principal/rede foi simulado como indisponível.
- [ ] Player alternou automaticamente para o agente local.
- [ ] Mídias tocaram via `localhost:3579`.
- [ ] Servidor principal/rede foi restabelecido.
- [ ] Player voltou automaticamente para a playlist remota.
- [ ] Agente local voltou a sincronizar atualizações.
- [ ] Teste realizado sem necessidade de atualizar manualmente a página.

## Kit Ponto TV

- [ ] Script de preparação executado como administrador.
- [ ] Relatório de preparação gerado.
- [ ] Node.js validado.
- [ ] Google Chrome validado.
- [ ] Player Agent validado.
- [ ] Tarefa do agente validada.
- [ ] Configurações de energia aplicadas ou conferidas.
- [ ] Modo quiosque criado ou conferido.
- [ ] Pendências manuais listadas para o técnico.

---

# PARTE 8 — Checklist resumido final

---

## 22. Checklist de entrega

| OK  | Item                                | Observação                    |
|-----|-------------------------------------|-------------------------------|
| [ ] | Windows limpo/revisado              |                               |
| [ ] | Nome do PC definido                 |                               |
| [ ] | Conta local criada                  |                               |
| [ ] | Login automático configurado        |                               |
| [ ] | Notificações/pop-ups desativados    |                               |
| [ ] | Apps desnecessários removidos       |                               |
| [ ] | Windows Update concluído            |                               |
| [ ] | Energia configurada                 |                               |
| [ ] | Hibernação desativada               |                               |
| [ ] | BIOS liga após queda de energia     |                               |
| [ ] | BIOS inicia sem teclado/mouse       |                               |
| [ ] | Chrome instalado                    |                               |
| [ ] | Atalho quiosque criado              |                               |
| [ ] | Atalho no `shell:startup`           |                               |
| [ ] | Player abre automaticamente         |                               |
| [ ] | AnyDesk instalado/configurado       |                               |
| [ ] | Rede testada                        |                               |
| [ ] | HDMI testado                        |                               |
| [ ] | Áudio testado                       |                               |
| [ ] | Teste sem teclado/mouse aprovado    |                               |
| [ ] | Teste de queda de energia aprovado  |                               |
| [ ] | Teste prolongado aprovado           |                               |
| [ ] | Ficha do ponto preenchida           |                               |
| [ ] | Responsável local orientado         |                               |

---

## 23. Parecer final da implantação

```txt
Equipamento preparado: Sim / Não
Equipamento instalado: Sim / Não
Player funcionando: Sim / Não
AnyDesk funcionando: Sim / Não
Pendências encontradas:
Ações necessárias:
Técnico responsável:
Data:
Assinatura/validação:
```

---

## 24. Observação final

Este checklist deve ser usado para garantir que cada ponto de exibição do Painel Ribas seja instalado de forma padronizada.

Quanto mais bem preparado estiver o PC, menor será a necessidade de manutenção manual, visitas técnicas e correções emergenciais.

O objetivo final é simples:

```txt
ligou a energia → ligou o PC → abriu o player → exibiu o Painel Ribas
```