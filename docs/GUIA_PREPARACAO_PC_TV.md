# Guia de Preparação de PC para TV — Painel Ribas

## 1. Objetivo

Este guia orienta a preparação de computadores ou mini PCs que serão usados como pontos de exibição do **Painel Ribas / Painel TV da Prefeitura**.

O objetivo é deixar cada equipamento operando de forma autônoma, com o mínimo possível de intervenção humana.

Ao final da configuração, o PC deve:

- ligar sozinho após queda de energia;
- iniciar o Windows sem pedir senha;
- abrir o player do Painel Ribas automaticamente;
- abrir o Google Chrome em modo quiosque;
- evitar pop-ups, notificações e telas indesejadas;
- reproduzir vídeos e imagens em tela cheia;
- reproduzir áudio pela TV quando permitido pelo ambiente;
- permitir suporte remoto via AnyDesk;
- funcionar sem teclado e mouse conectados, quando a BIOS permitir;
- não suspender, hibernar ou desligar a tela durante o uso;
- ficar dedicado exclusivamente ao Painel Ribas.

---

## 2. Padrão recomendado

| Item                  | Configuração recomendada                          |
|-----------------------|---------------------------------------------------|
| Nome do computador    | `PAINEL-TV-01`, `PAINEL-TV-02`, `PAINEL-TV-03`    |
| Usuário do Windows    | `Painel`                                          |
| Tipo de conta         | Conta local                                       |
| Navegador             | Google Chrome                                     |
| Modo de exibição      | Quiosque                                          |
| Site do player        | `https://painelribas.com.br/`                     |
| Acesso remoto         | AnyDesk com acesso não supervisionado             |
| Rede                  | Preferencialmente cabo                            |
| Uso do equipamento    | Exclusivo para o Painel Ribas                     |

---

## Kit Ponto TV — preparação semi-automatizada

Além do procedimento manual documentado neste guia, o projeto passa a prever a criação de um **Kit Ponto TV**, com scripts de preparação para reduzir etapas manuais na configuração dos computadores conectados às TVs.

O objetivo do kit é permitir que, após uma preparação inicial mínima do Windows, a equipe técnica execute um instalador local para aplicar ou validar automaticamente grande parte das configurações necessárias para operação do Painel Ribas.

### O que o Kit Ponto TV deve automatizar

Sempre que possível, o instalador deve:

- verificar se está sendo executado com permissão de administrador;
- verificar se o Node.js está instalado;
- verificar se o Google Chrome está instalado;
- validar a presença do Player Agent local;
- instalar ou atualizar a tarefa agendada do Player Agent;
- iniciar o Player Agent automaticamente;
- testar o endpoint local `http://localhost:3579/health`;
- preparar configurações de energia para impedir suspensão;
- auxiliar na criação do modo quiosque do Chrome;
- gerar relatório de preparação do ponto;
- orientar o técnico sobre pendências manuais.

### Player Agent local

O Player Agent local é um componente instalado no computador conectado à TV.

Ele tem como objetivo manter uma cópia local da playlist e das mídias publicadas pelo servidor principal, permitindo que o player continue funcionando temporariamente mesmo em caso de queda de rede ou indisponibilidade do servidor.

Endereço local padrão do agente:

```txt
http://localhost:3579
```

Rotas principais:

```txt
http://localhost:3579/health
http://localhost:3579/playlist.json
http://localhost:3579/midia/NOME_DO_ARQUIVO
```

### Funcionamento esperado

Quando o servidor principal estiver disponível, o player deve usar normalmente o conteúdo remoto.

Quando o servidor principal cair, o player deve alternar automaticamente para o cache local servido pelo Player Agent.

Quando o servidor principal voltar, o player deve retornar automaticamente para a playlist remota oficial.

### Etapas que continuam manuais

Mesmo com o Kit Ponto TV, algumas etapas ainda exigem validação humana:

- configuração da BIOS para ligar após queda de energia;
- configuração de senha segura da conta local;
- configuração do acesso não supervisionado do AnyDesk;
- conexão física HDMI e energia;
- teste de áudio na TV;
- teste real de rede;
- teste prolongado de funcionamento;
- preenchimento da ficha interna do ponto.

---

## 3. Materiais necessários

Antes de iniciar, separar:

- PC ou mini PC;
- cabo de energia;
- cabo HDMI;
- teclado USB;
- mouse USB;
- TV ou monitor para configuração;
- acesso à internet;
- usuário e senha definidos para a conta local;
- instalador do Google Chrome;
- instalador do AnyDesk;
- acesso ao painel para teste;
- local para registrar ficha técnica do ponto.

---

# PARTE 1 — PREPARAÇÃO DO WINDOWS

---

## 4. Restaurar ou limpar o computador

Quando o PC já tiver sido usado em outro setor, recomenda-se restaurar o Windows removendo arquivos e configurações antigas.

Isso ajuda a evitar:

- contas antigas;
- programas desnecessários;
- pop-ups de softwares antigos;
- antivírus trial;
- inicializações indesejadas;
- lentidão;
- notificações aleatórias;
- arquivos pessoais esquecidos;
- conflitos com configurações antigas.

### Caminho recomendado

```txt
Configurações > Sistema > Recuperação > Restaurar este PC
```

Selecionar:

```txt
Remover tudo
```

Depois seguir a restauração até a tela inicial de configuração do Windows.

### Observação

Se o computador estiver limpo, recém-formatado ou já preparado pela TI, essa etapa pode ser apenas revisada.

---

## 5. Criar conta local do Windows

## 5.1 Conta recomendada

Criar uma conta local chamada:

```txt
Painel
```

Essa conta deve ser usada exclusivamente para o painel.

Não usar:

- conta pessoal;
- conta de e-mail do técnico;
- conta Microsoft pessoal;
- conta administrativa geral da Prefeitura;
- senha usada em outros sistemas;
- senha de e-mail;
- senha de domínio.

A conta `Painel` deve ter senha exclusiva, definida pela equipe técnica.

---

## 5.2 Criar conta local durante instalação do Windows 11

Em algumas versões do Windows 11, a Microsoft tenta obrigar login com conta Microsoft.

Na tela de login da conta Microsoft, pressionar:

```txt
Shift + F10
```

Em alguns teclados compactos, pode ser necessário:

```txt
Fn + Shift + F10
```

No Prompt de Comando, tentar:

```cmd
start ms-cxh:localonly
```

Isso pode abrir a tela de criação de conta local.

Preencher:

```txt
Usuário: Painel
Senha: senha definida pela equipe técnica
Perguntas de segurança: respostas controladas pela TI
```

---

## 5.3 Método alternativo sem internet

Se o método anterior não funcionar, no Prompt de Comando executar:

```cmd
oobe\bypassnro
```

O Windows pode reiniciar o assistente de configuração.

Ao retornar, procurar opções como:

```txt
Não tenho internet
Continuar com configuração limitada
Conta offline
```

Depois criar a conta local:

```txt
Painel
```

---

## 5.4 Se nenhum método funcionar

Se nenhuma opção de conta local estiver disponível, concluir temporariamente com uma conta Microsoft institucional ou técnica.

Depois, já dentro do Windows:

```txt
Configurações > Contas > Outros usuários > Adicionar conta
```

Criar usuário local chamado:

```txt
Painel
```

Depois configurar essa conta como a conta operacional definitiva do equipamento.

---

## 6. Nomear o computador

Durante a configuração inicial ou depois pelo Windows, usar um nome padronizado.

Sugestão:

```txt
PAINEL-TV-01
PAINEL-TV-02
PAINEL-TV-03
```

Esse nome será útil para:

- identificar o equipamento na rede;
- configurar login automático via Registro;
- organizar suporte remoto;
- preencher ficha técnica do ponto;
- identificar o equipamento no AnyDesk.

### Caminho no Windows

```txt
Configurações > Sistema > Sobre > Renomear este computador
```

Após renomear, reiniciar o computador.

---

## 7. Configurações de privacidade na instalação

Durante a configuração inicial do Windows, desativar permissões desnecessárias.

| Opção                             | Configuração recomendada  |
|-----------------------------------|---------------------------|
| Localização                       | Não                       |
| Localizar meu dispositivo         | Não, salvo decisão da TI  |
| Dados de diagnóstico opcionais    | Não                       |
| Melhorar escrita e digitação      | Não                       |
| Experiências personalizadas       | Não                       |
| ID de publicidade                 | Não                       |

O objetivo é reduzir notificações, sugestões, integrações e serviços que não são necessários para um PC dedicado ao painel.

---

## 8. Atualizar o Windows antes da implantação

Antes de automatizar o player, finalizar o Windows Update.

### Caminho

```txt
Configurações > Windows Update
```

Executar:

1. Clicar em **Verificar atualizações**.
2. Instalar tudo que aparecer.
3. Reiniciar quando solicitado.
4. Repetir a verificação.
5. Continuar até o Windows informar que está atualizado.

Isso reduz a chance de o PC reiniciar sozinho ou exibir notificações logo após ser instalado atrás da TV.

---

## 9. Limpeza do Windows

## 9.1 Remover aplicativos desnecessários

Remover aplicativos que não terão utilidade no equipamento e podem gerar pop-ups, consumo de recursos ou distrações.

Podem ser removidos, se não houver política interna exigindo:

- McAfee;
- Norton;
- antivírus trial de fabricante;
- Microsoft 365 trial;
- Clipchamp;
- Teams pessoal;
- Skype;
- Xbox;
- jogos;
- LinkedIn;
- Notícias;
- apps promocionais do fabricante;
- apps de entretenimento;
- OneDrive, se não for usado;
- aplicativos de loja que não tenham função no painel.

### Caminho

```txt
Configurações > Aplicativos > Aplicativos instalados
```

Remover apenas o que for claramente desnecessário.

---

## 9.2 Não remover drivers e componentes essenciais

Não remover:

- drivers de vídeo;
- drivers de áudio;
- drivers de rede;
- drivers Bluetooth, se necessário;
- Intel;
- AMD;
- NVIDIA;
- Realtek;
- Microsoft Visual C++;
- componentes do chipset;
- utilitários essenciais do fabricante, se controlarem hardware importante.

A ideia é remover tranqueira, não desmontar o motor do carro.

---

## 10. Desativar pop-ups, notificações e sugestões

A TV institucional não deve exibir notificações do Windows durante a reprodução do painel.

## 10.1 Desativar notificações gerais

Caminho:

```txt
Configurações > Sistema > Notificações
```

Recomendado:

- desativar notificações gerais, se possível;
- ou desativar notificações dos aplicativos desnecessários;
- desativar dicas e sugestões;
- desativar experiência de boas-vindas;
- desativar ofertas e recomendações.

Procurar e desligar opções como:

```txt
Mostrar a experiência de boas-vindas do Windows
Obter dicas e sugestões ao usar o Windows
Sugerir maneiras de terminar a configuração do dispositivo
Mostrar notificações na tela de bloqueio
```

---

## 10.2 Impedir reabertura automática de aplicativos

Caminho:

```txt
Configurações > Contas > Opções de entrada
```

Desativar:

```txt
Salvar automaticamente meus aplicativos reiniciáveis e reiniciá-los quando eu entrar novamente
```

Desativar também:

```txt
Usar minhas informações de entrada para concluir automaticamente a configuração após uma atualização
```

Isso evita que programas antigos reabram junto com o Windows após reinicialização ou atualização.

---

## 10.3 Remover aplicativos da inicialização

Caminho:

```txt
Configurações > Aplicativos > Inicialização
```

Desativar tudo que não for necessário.

Manter apenas o que fizer sentido, como:

- AnyDesk;
- drivers essenciais;
- serviços de áudio/rede, se aparecerem.

Desativar:

- Teams;
- OneDrive;
- launchers;
- atualizadores de fabricante;
- apps promocionais;
- widgets;
- softwares de impressora, se não usados;
- aplicativos aleatórios.

---

# PARTE 2 — ENERGIA E BIOS

---

## 11. Configurações de energia do Windows

O PC precisa ficar ligado continuamente.

## 11.1 Configuração básica

Caminho:

```txt
Configurações > Sistema > Energia
```

Configurar:

| Opção         | Valor |
|---------------|-------|
| Desligar tela | Nunca |
| Suspender     | Nunca |

Se aparecer opção separada para tomada/bateria, configurar na tomada:

```txt
Nunca
```

---

## 11.2 Configurações avançadas de energia

Abrir:

```txt
Painel de Controle > Opções de Energia > Alterar configurações do plano > Alterar configurações de energia avançadas
```

Configurar:

### Suspender

```txt
Suspender após: Nunca
Permitir suspensão híbrida: Desativado
Hibernar após: Nunca
```

### Disco rígido

```txt
Desligar disco rígido após: Nunca
```

### USB

```txt
Configuração de suspensão seletiva USB: Desativado
```

---

## 11.3 Desativar hibernação

Abrir PowerShell como administrador:

```powershell
powercfg -h off
```

Isso desativa a hibernação e reduz comportamentos inesperados de economia de energia.

---

## 12. Configuração da BIOS/UEFI

A BIOS deve ser configurada para reduzir necessidade de intervenção física.

---

## 12.1 Entrar na BIOS

Reiniciar o PC e pressionar repetidamente uma tecla como:

```txt
DEL
F2
F10
F12
ESC
```

As mais comuns são:

```txt
DEL
F2
```

O nome e a posição das opções variam conforme marca e placa-mãe.

---

## 12.2 Configurar para ligar após queda de energia

Procurar opções como:

```txt
Restore on AC Power Loss
AC Power Recovery
After Power Loss
Power On After Power Failure
AC Back
State After G3
Power Failure Recovery
```

Configurar para:

```txt
Power On
```

ou:

```txt
Always On
```

Alternativa aceitável:

```txt
Last State
```

Evitar:

```txt
Power Off
```

### Resultado esperado

Quando a energia voltar, o PC deve ligar sozinho.

---

## 12.3 Configurar para não travar sem teclado/mouse

Alguns PCs param o boot se não detectam teclado ou mouse.

Procurar opções como:

```txt
Halt On
Wait for F1 if Error
Keyboard Error
Report Keyboard Errors
POST Error
```

Configurar, se existir:

```txt
Halt On: No Errors
Wait for F1 if Error: Disabled
Keyboard Error: Disabled
Report Keyboard Errors: Disabled
```

Isso evita erro como:

```txt
Keyboard not found. Press F1 to continue.
```

Essa mensagem é basicamente o PC dizendo: “não achei teclado, aperte uma tecla”. Coisa linda da informática raiz.

---

## 12.4 Manter suporte USB habilitado

Procurar:

```txt
Legacy USB Support
USB Keyboard Support
USB Mouse Support
```

Manter:

```txt
Enabled
```

Isso ajuda teclado e mouse USB funcionarem durante manutenção.

---

## 12.5 Salvar alterações da BIOS

Salvar e sair:

```txt
F10
Save & Exit
Yes
```

Depois testar:

- [ ] PC liga após reconectar energia.
- [ ] PC não trava sem teclado/mouse.
- [ ] Windows inicia normalmente.

---

# PARTE 3 — CHROME, PLAYER E QUIOSQUE

---

## 13. Instalar Google Chrome

O player deve rodar no Google Chrome.

## 13.1 Instalação

Usar o Microsoft Edge apenas para baixar o Chrome pelo site oficial.

Depois:

1. instalar Chrome;
2. abrir Chrome uma vez;
3. não fazer login em conta Google;
4. fechar o Chrome.

---

## 13.2 Testar player antes do modo quiosque

Abrir no Chrome:

```txt
https://painelribas.com.br/
```

Validar:

- [ ] splash aparece;
- [ ] mídia carrega;
- [ ] imagem ou vídeo aparece;
- [ ] sidebar aparece ao mover mouse;
- [ ] controles funcionam;
- [ ] botão de som funciona;
- [ ] tela cheia funciona;
- [ ] sem erro crítico no console.

---

## 14. Criar atalho do Chrome em modo quiosque

## 14.1 Criar atalho

Na Área de Trabalho:

```txt
Botão direito > Novo > Atalho
```

No local do item, usar:

```txt
"C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\PainelChromeQuiosque" --kiosk --no-first-run --disable-session-crashed-bubble --autoplay-policy=no-user-gesture-required "https://painelribas.com.br/"
```

Nome do atalho:

```txt
Painel Ribas - Quiosque
```

Se o Chrome estiver em outro caminho, testar:

```txt
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --user-data-dir="C:\PainelChromeQuiosque" --kiosk --no-first-run --disable-session-crashed-bubble --autoplay-policy=no-user-gesture-required "https://painelribas.com.br/"
```

---

## 14.2 Explicação do comando

| Parâmetro                                     | Função                                                    |
|-----------------------------------------------|-----------------------------------------------------------|
| `chrome.exe`                                  | Executa o Google Chrome                                   |
| `--user-data-dir="C:\PainelChromeQuiosque"`   | Cria perfil separado só para o painel                     |
| `--kiosk`                                     | Abre em tela cheia sem barra de endereço                  |
| `--no-first-run`                              | Evita tela inicial de boas-vindas do Chrome               |
| `--disable-session-crashed-bubble`            | Evita aviso de restaurar páginas após queda de energia    |
| `--autoplay-policy=no-user-gesture-required`  | Ajuda no autoplay em ambiente controlado                  |
| `https://painelribas.com.br/`                 | Endereço do player                                        |

---

## 14.3 Por que usar perfil separado do Chrome?

O parâmetro:

```txt
--user-data-dir="C:\PainelChromeQuiosque"
```

faz o Chrome criar um perfil exclusivo para o painel.

Isso evita:

- histórico pessoal;
- pop-ups de conta Google;
- abas anteriores;
- restauração de sessão;
- cache misturado;
- extensões indesejadas;
- configurações pessoais interferindo no player.

---

## 14.4 Testar atalho

Antes de colocar na inicialização:

1. Fechar todas as janelas do Chrome.
2. Abrir o atalho `Painel Ribas - Quiosque`.
3. Confirmar tela cheia.
4. Confirmar player.
5. Confirmar mídia.
6. Confirmar áudio.
7. Sair com:

```txt
Alt + F4
```

---

## 15. Abrir player automaticamente com o Windows

Pressionar:

```txt
Win + R
```

Digitar:

```txt
shell:startup
```

Copiar o atalho:

```txt
Painel Ribas - Quiosque
```

para a pasta aberta.

Depois reiniciar o PC.

### Resultado esperado

```txt
Windows iniciou > login automático > Chrome abriu em modo quiosque > Painel carregou
```

---

# PARTE 4 — LOGIN AUTOMÁTICO

---

## 16. Login automático do Windows

## 16.1 Método via netplwiz

Pressionar:

```txt
Win + R
```

Digitar:

```txt
netplwiz
```

Selecionar usuário:

```txt
Painel
```

Desmarcar:

```txt
Os usuários devem digitar um nome de usuário e uma senha para usar este computador
```

Clicar em Aplicar.

Informar a senha do usuário `Painel`.

Reiniciar e testar.

---

## 16.2 Se a opção não aparecer

Caminho:

```txt
Configurações > Contas > Opções de entrada
```

Desativar opção parecida com:

```txt
Para aumentar a segurança, permita apenas a entrada do Windows Hello para contas Microsoft neste dispositivo
```

Depois abrir `netplwiz` novamente.

---

## 16.3 Método via Registro

Usar apenas se necessário e com ciência da TI.

Abrir:

```txt
Win + R
regedit
```

Ir para:

```txt
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon
```

Criar ou editar valores de cadeia de caracteres:

```txt
AutoAdminLogon
DefaultUserName
DefaultPassword
DefaultDomainName
```

Valores:

```txt
AutoAdminLogon = 1
DefaultUserName = Painel
DefaultPassword = [SENHA_DA_CONTA_PAINEL]
DefaultDomainName = [NOME_DO_COMPUTADOR]
```

Exemplo:

```txt
DefaultDomainName = PAINEL-TV-02
```

Para descobrir o nome do computador:

```powershell
hostname
```

---

## 16.4 Atenção sobre senha no Registro

O método via Registro salva a senha localmente.

Por isso:

- usar somente em equipamento dedicado;
- usar senha exclusiva;
- não usar senha pessoal;
- não usar senha de e-mail;
- não registrar senha em documento público;
- manter senha em controle interno da TI.

---

# PARTE 5 — ANYDESK E SUPORTE REMOTO

---

## 17. AnyDesk para manutenção remota

O AnyDesk é essencial porque o PC pode ficar atrás da TV ou em local de difícil acesso.

---

## 17.1 Instalar AnyDesk

1. Baixar AnyDesk para Windows no site oficial.
2. Instalar, não apenas executar em modo portátil.
3. Abrir AnyDesk.
4. Anotar o ID do equipamento.

---

## 17.2 Configurar acesso não supervisionado

No AnyDesk:

```txt
Configurações > Segurança
```

Ativar:

```txt
Acesso não supervisionado
```

Definir senha forte e exclusiva.

Permitir, se necessário:

- controle de teclado e mouse;
- acesso com tela bloqueada;
- transferência de arquivos, se autorizado pela TI.

---

## 17.3 Testar AnyDesk

De outro computador:

- conectar no ID;
- informar senha;
- confirmar acesso sem alguém precisar aceitar localmente;
- testar controle do mouse;
- testar após reiniciar o PC.

---

## 17.4 Segurança do AnyDesk

Não colocar senha do AnyDesk em documento público ou relatório executivo.

Registrar ID e senha apenas em ficha interna controlada pela TI.

---

# PARTE 6 — ÁUDIO, TELA E REDE

---

## 18. Áudio HDMI

Conectar PC à TV via HDMI.

No Windows:

```txt
Configurações > Sistema > Som
```

Em saída de áudio, selecionar a TV.

Nomes comuns:

```txt
Samsung
LG TV
HDMI Audio
Intel Display Audio
NVIDIA High Definition Audio
AMD HDMI Audio
Realtek HDMI
```

Testar:

- vídeo no Painel Ribas;
- vídeo comum no navegador;
- volume do Windows;
- volume da TV;
- aba do Chrome sem mudo.

---

## 19. Configuração de tela

Caminho:

```txt
Configurações > Sistema > Tela
```

Configurar:

| Item          | Recomendado               |
|---------------|---------------------------|
| Resolução     | 1920 x 1080, se suportado |
| Escala        | 100% ou recomendada       |
| Orientação    | Paisagem                  |

Se a imagem ficar cortada, ajustar na TV:

```txt
Just Scan
Screen Fit
Ajustar à tela
Sem overscan
Formato 16:9
```

O nome muda conforme a marca.

---

## 20. Rede

## 20.1 Preferência

Usar cabo de rede sempre que possível.

Wi-Fi só se estiver estável.

---

## 20.2 Testes de rede

Testar:

- carregar `https://painelribas.com.br/`;
- reproduzir vídeos;
- deixar rodando por alguns minutos;
- verificar travamentos;
- testar AnyDesk.

Se houver travamentos, comparar:

- cabo;
- Wi-Fi;
- 4G/5G;
- outro ponto de rede.

Vídeos grandes sofrem bastante com rede ruim. O player pode estar certo e a internet estar de férias.

---

# PARTE 7 — TESTES FINAIS

---

## 21. Teste final em bancada

Antes de instalar atrás da TV, testar em bancada.

| OK    | Item                  | Observação                            |
|-------|-----------------------|---------------------------------------|
|  [ ]  | Reiniciar             | Windows entra sozinho e abre player   |
|  [ ]  | Desligar e ligar      | Equipamento volta ao painel           |
|  [ ]  | Sem teclado/mouse     | PC inicia sem travar                  |
|  [ ]  | AnyDesk               | Conecta remotamente após reinício     |
|  [ ]  | Rodagem prolongada    | Deixar rodando por horas              |
|  [ ]  | Pop-ups               | Nenhum pop-up aparece                 |
|  [ ]  | Som                   | Áudio automático validado             |
|  [ ]  | Quiosque              | Chrome abre sem barra de endereço     |

---

## 22. Teste na TV

| OK    | Item              | Observação                                    |
|-------|-------------------|---------------------------------------------- |
|  [ ]  | HDMI              | Imagem aparece na TV                          |
|  [ ]  | Resolução         | Preferencialmente 1920x1080                   |
|  [ ]  | Escala            | Sem corte de bordas                           |
|  [ ]  | Áudio HDMI        | Som sai pela TV                               |
|  [ ]  | Rede              | Player carrega sem travamentos                |
|  [ ]  | Controle local    | Teclado/mouse funcionam para manutenção       |
|  [ ]  | Acesso remoto     | AnyDesk acessível                             |
|  [ ]  | Quiosque          | Player abre em tela cheia                     |
|  [ ]  | Pop-ups           | Nenhuma notificação aparece sobre o player    |

---

## 23. Teste de queda de energia

Com tudo configurado:

1. Fechar testes manuais.
2. Deixar player rodando.
3. Desligar energia do PC ou filtro de linha.
4. Aguardar 10 segundos.
5. Religar energia.
6. Confirmar:

```txt
PC liga sozinho
Windows entra sozinho
Chrome abre sozinho
Painel Ribas carrega
Player entra em tela cheia
AnyDesk volta a ficar acessível
```

Se o PC não ligar, revisar BIOS:

```txt
Restore on AC Power Loss = Power On
```

Se o PC ligar mas parar pedindo teclado, revisar BIOS:

```txt
Halt On = No Errors
Wait for F1 if Error = Disabled
Keyboard Error = Disabled
```

---

## 24. Teste prolongado

Antes de considerar o equipamento pronto, deixar rodando por algumas horas.

Verificar:

- [ ] nenhum pop-up apareceu;
- [ ] player continuou em tela cheia;
- [ ] não suspendeu;
- [ ] não desligou a tela;
- [ ] áudio continua funcionando;
- [ ] AnyDesk continua acessível;
- [ ] vídeos não travaram por rede;
- [ ] Windows não pediu reinicialização.

---

# PARTE 8 — PROBLEMAS COMUNS

---

## 25. Problemas comuns e solução rápida

| Problema                              | Possível solução                                              |
|---------------------------------------|---------------------------------------------------------------|
| Chrome não abriu automaticamente      | Verificar se o atalho está em `shell:startup`                 |
| Chrome abriu com barra de endereço    | Confirmar se o atalho usa `--kiosk`                           |
| Apareceu aviso de restaurar páginas   | Confirmar uso de `--disable-session-crashed-bubble`           |
| Apareceu tela inicial do Chrome       | Confirmar uso de `--no-first-run`                             |
| Windows pediu senha                   | Revisar `netplwiz` ou Registro                                |
| PC não liga após queda de energia     | Revisar opção de energia na BIOS                              |
| PC trava sem teclado                  | Revisar `Halt On`, `Wait for F1 if Error` ou `Keyboard Error` |
| Sem som                               | Verificar saída HDMI/TV e volume                              |
| AnyDesk não conecta                   | Verificar internet, ID, senha e serviço AnyDesk               |
| Apareceu pop-up                       | Revisar notificações, inicialização, apps instalados e Chrome |
| Imagem cortada na TV                  | Ajustar resolução/escala no Windows e formato de tela da TV   |
| Vídeo travando                        | Testar rede, usar cabo e verificar peso do vídeo              |

---

## 26. Chrome não abriu automaticamente

Verificar:

```txt
shell:startup
```

Confirmar se o atalho `Painel Ribas - Quiosque` está na pasta de inicialização.

---

## 27. Chrome abriu com barra de endereço

Possíveis causas:

- atalho sem `--kiosk`;
- Chrome já estava aberto antes;
- caminho errado do Chrome;
- aspas erradas no comando.

Fechar tudo com:

```txt
Alt + F4
```

E testar o atalho correto novamente.

---

## 28. Apareceu aviso de restaurar páginas

Confirmar se o atalho tem:

```txt
--disable-session-crashed-bubble
```

---

## 29. Apareceu tela inicial do Chrome

Confirmar se o atalho tem:

```txt
--no-first-run
```

Confirmar também se está usando perfil separado:

```txt
--user-data-dir="C:\PainelChromeQuiosque"
```

---

## 30. Windows pediu senha

Revisar:

```txt
netplwiz
```

ou a chave:

```txt
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon
```

---

## 31. PC não liga após queda de energia

Revisar BIOS:

```txt
Restore on AC Power Loss
AC Power Recovery
Power On After Power Failure
AC Back
State After G3
```

Configurar como:

```txt
Power On
```

---

## 32. PC trava sem teclado

Revisar BIOS:

```txt
Halt On: No Errors
Wait for F1 if Error: Disabled
Keyboard Error: Disabled
Report Keyboard Errors: Disabled
```

---

## 33. Sem som

Verificar:

- saída HDMI/TV;
- volume do Windows;
- volume da TV;
- Chrome sem mudo;
- vídeo com áudio;
- abertura pelo atalho quiosque;
- dispositivo de saída padrão do Windows.

---

## 34. AnyDesk não conecta

Verificar:

- internet;
- AnyDesk instalado;
- AnyDesk configurado para iniciar com Windows;
- acesso não supervisionado;
- senha correta;
- ID correto;
- Windows iniciou corretamente.

---

## 35. Apareceu pop-up

Verificar:

- notificações do Windows;
- aplicativos de inicialização;
- antivírus trial;
- OneDrive;
- Teams;
- apps do fabricante;
- Chrome sem perfil separado;
- flags do atalho quiosque;
- softwares de fabricante;
- widgets/notícias.

---

# PARTE 9 — FICHA E CHECKLIST

---

## 36. Ficha interna de implantação

Usar somente em controle interno da TI.

```txt
Local:
Secretaria/Unidade:
Nome do computador:
Patrimônio:
Modelo do PC:
Usuário Windows:
Senha Windows:
AnyDesk ID:
Senha AnyDesk:
Tipo de conexão: Cabo / Wi-Fi
Nome da rede:
TV utilizada:
Resolução:
Áudio HDMI testado: Sim / Não
BIOS liga após queda de energia: Sim / Não
BIOS inicia sem teclado/mouse: Sim / Não
Login automático: Sim / Não
Player abre sozinho: Sim / Não
Modo quiosque: Sim / Não
Pop-ups removidos/desativados: Sim / Não
Data da instalação:
Técnico responsável:
Observações:
```

### Atenção

Senhas não devem ser colocadas em documentos públicos, relatórios executivos ou arquivos compartilhados sem controle.

A ficha com senhas deve ficar sob controle restrito da TI.

---

## 37. Checklist final de entrega

| OK    | Item                              | Observação                            |
|-------|-----------------------------------|---------------------------------------|
|  [ ]  | Windows restaurado/limpo          | Sem arquivos e configurações antigas  |
|  [ ]  | Nome do PC definido               | `PAINEL-TV-XX`                        |
|  [ ]  | Conta local criada                | Usuário `Painel`                      |
|  [ ]  | Privacidade ajustada              | Permissões desnecessárias desativadas |
|  [ ]  | Windows Update finalizado         | Sem pendências críticas               |
|  [ ]  | Apps inúteis removidos            | Sem bloatware/trials                  |
|  [ ]  | Notificações desativadas          | Sem pop-ups na TV                     |
|  [ ]  | Apps de inicialização revisados   | Só o necessário                       |
|  [ ]  | Energia configurada               | Tela/suspensão nunca                  |
|  [ ]  | Hibernação desativada             | `powercfg -h off`                     |
|  [ ]  | BIOS energia configurada          | Liga após queda                       |
|  [ ]  | BIOS teclado/mouse ajustada       | Não trava sem periféricos             |   
|  [ ]  | Chrome instalado                  | Sem login Google                      |
|  [ ]  | Atalho quiosque criado            | Com flags corretas                    |
|  [ ]  | Atalho no Startup                 | `shell:startup`                       |
|  [ ]  | Login automático                  | Windows entra sozinho                 |
|  [ ]  | AnyDesk instalado                 | Não supervisionado                    |
|  [ ]  | Áudio HDMI testado                | Som sai pela TV                       |
|  [ ]  | Rede testada                      | Preferencialmente cabo                |
|  [ ]  | Player testado                    | Mídias rodam                          |
|  [ ]  | Teste de queda de energia         | Volta sozinho                         |
|  [ ]  | Teste prolongado                  | Sem pop-ups/travamentos               |
|  [ ]  | Ficha interna preenchida          | Dados do ponto registrados            |

---

## 38. Resumo rápido para técnicos

```txt
1. Restaurar ou limpar Windows.
2. Nomear PC como PAINEL-TV-XX.
3. Criar conta local Painel.
4. Desativar permissões de privacidade desnecessárias.
5. Rodar Windows Update até finalizar.
6. Remover apps inúteis e antivírus trial.
7. Desativar notificações e sugestões do Windows.
8. Desativar apps desnecessários da inicialização.
9. Configurar energia para nunca suspender.
10. Desativar hibernação.
11. Configurar BIOS para ligar após queda de energia.
12. Configurar BIOS para não travar sem teclado/mouse.
13. Instalar Chrome.
14. Criar atalho quiosque com flags anti-pop-up.
15. Colocar atalho em shell:startup.
16. Configurar login automático.
17. Instalar e configurar AnyDesk.
18. Configurar áudio HDMI.
19. Testar player.
20. Testar reinício.
21. Testar sem teclado/mouse.
22. Testar queda de energia.
23. Testar AnyDesk.
24. Deixar rodando para verificar pop-ups/travamentos.
25. Preencher ficha interna.
```

---

## 39. Observação importante

Este PC deve ser tratado como equipamento dedicado ao Painel Ribas.

Evitar usar o equipamento para:

- navegação comum;
- downloads aleatórios;
- instalação de programas desnecessários;
- uso pessoal;
- armazenamento de arquivos sem relação com o painel;
- testes não autorizados;
- login com contas pessoais.

Quanto mais limpo o equipamento, menor a chance de travamentos, pop-ups e manutenção corretiva.

---

## 40. Conclusão

Com essas configurações, o PC passa a operar como equipamento dedicado ao Painel Ribas.

O fluxo esperado é:

```txt
Energia voltou
↓
PC ligou sozinho
↓
Windows entrou no usuário Painel
↓
Chrome abriu em modo quiosque
↓
Painel Ribas carregou
↓
TV começou a exibir os conteúdos
```

Esse é o comportamento ideal para os pontos de exibição instalados nas TVs institucionais.