# WinGet Toolkit

Página web que mostra uma vitrine de softwares em cards selecionáveis e gera, ao final da
página, um script PowerShell pronto para colar no terminal e instalar tudo de uma vez via
[`winget`](https://learn.microsoft.com/windows/package-manager/winget/).

Não há backend, build ou dependências — é só HTML/CSS/JS puro.

> 📋 **[Veja o catálogo completo](CATALOGO.md)** — os 72 aplicativos por categoria, com ícone,
> Package ID do winget e descrição.

## Como usar

1. Abra `index.html` no navegador (duplo clique ou `start index.html` no PowerShell), ou
   sirva a pasta com qualquer servidor estático (ex: `python -m http.server`, ou publique
   via GitHub Pages).
2. Filtre por categoria ou busque pelo nome do programa.
3. Marque os softwares desejados — o contador na barra inferior mostra quantos foram selecionados.
4. Clique em **Gerar script**.
5. Duas formas de rodar na máquina de destino:
   - **Copiar e colar**: botão "Copiar script" → cole num **PowerShell** comum e pressione Enter.
   - **Baixar e dar duplo clique**: botão "Baixar .bat" → dois cliques no arquivo baixado.

O script detecta sozinho se a sessão já é de Administrador. Se não for, ele abre uma nova janela do
PowerShell elevada (via UAC) para rodar a instalação — sem precisar de `Set-ExecutionPolicy -Bypass`
nem de qualquer configuração extra, porque o conteúdo é executado como comando (`-Command`), não como
um arquivo `.ps1` assinado/bloqueado.

O arquivo baixado é um `.bat` (não `.ps1`) que internamente chama `powershell -EncodedCommand`. Isso
importa porque arquivos `.ps1` baixados do navegador ganham a "Zona de Segurança da Internet" (Mark of
the Web) do Windows e ficam bloqueados por exigirem assinatura digital — mesmo em máquinas configuradas
como `RemoteSigned`, não só nas com a política `Restricted` de fábrica. Arquivos `.bat` não passam por
esse mecanismo do PowerShell, e `-EncodedCommand` roda como comando, não como script — então o `.bat`
baixado já funciona de primeira, em qualquer máquina, sem `Unblock-File` e sem mexer em política de
execução.

> O script aceita automaticamente o termo inicial do winget (`--accept-source-agreements`), que só
> aparece na primeira vez que a máquina usa o winget. Ele **não** aceita termos de licença de pacotes
> específicos (`--accept-package-agreements`) — se algum app exigir isso, vai aparecer um prompt
> pedindo para aceitar; fique de olho na janela do PowerShell e responda quando solicitado.

## Requisitos na máquina de destino

- Windows 10 1709+ ou Windows 11 com o **App Installer** (winget) atualizado.
- Permissão para aprovar o UAC (elevação de Administrador) na máquina onde o script roda.

## Estrutura do projeto

```
index.html                     # marcação da página (ponto de entrada)
README.md
LICENSE
src/
├── css/
│   └── style.css              # estilos (tema claro/escuro, responsivo)
├── js/
│   ├── apps.js                # catálogo: id do winget, nome, categoria, descrição
│   └── app.js                 # lógica: filtros, seleção, geração do script, download
└── assets/
    ├── brand/                 # identidade visual — logo, favicon, ícones da interface
    │   └── logo.svg
    └── apps/                  # ícones dos aplicativos do catálogo (1 PNG por item)
        └── *.png
```

A separação entre `assets/brand/` e `assets/apps/` é proposital: `brand/` guarda o que é
do próprio projeto (logo, favicon), enquanto `apps/` contém **somente** os ícones dos
softwares do catálogo — todos juntos num único diretório, com o nome derivado do ID do
winget.

## Adicionando novos aplicativos

Edite `src/js/apps.js` e acrescente um item ao array `APPS`:

```js
{ id: "Fabricante.NomeDoPacote", name: "Nome exibido", category: "utilities", desc: "Descrição curta" }
```

O `id` deve ser o **Package Identifier** do winget (confira com `winget search <nome>` ou em
[winget.run](https://winget.run/)). As categorias disponíveis estão em `CATEGORIES`
no mesmo arquivo.

Depois, salve o ícone em `src/assets/apps/<id-com-pontos-trocados-por-hifen>.png` (ex: o app
`Google.Chrome` usa `src/assets/apps/Google-Chrome.png`). Se o arquivo não existir, a página
cai automaticamente para um ícone com as iniciais do nome.

## Sobre os ícones

Os ícones em `src/assets/apps/` foram baixados do favicon oficial do site de cada fabricante (via
`https://www.google.com/s2/favicons`) ou, quando o favicon não era representativo, direto
do asset público do próprio projeto. São marcas registradas de seus respectivos
fabricantes, incluídas aqui apenas para identificação visual dos softwares na interface.

## Licença

Projeto interno de automação de deploy de software via winget.
