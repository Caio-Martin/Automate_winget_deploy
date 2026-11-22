/**
 * Catalogo de aplicativos disponiveis para instalacao via winget.
 * Cada item: id (winget package id), name (nome exibido), category (chave),
 * desc (descricao curta) e initials (usado no icone do card).
 */
const CATEGORIES = [
    { key: "essential", label: "Essencial", icon: "star" },
    { key: "browsers", label: "Navegadores", icon: "globe" },
    { key: "utilities", label: "Utilitários", icon: "tool" },
    { key: "dev", label: "Desenvolvimento", icon: "code" },
    { key: "comm", label: "Comunicação", icon: "chat" },
    { key: "media", label: "Mídia & Jogos", icon: "film" },
    { key: "all", label: "Todos", icon: "grid" },
];

const APPS = [
    // Essencial - o basico para qualquer PC
    { id: "Google.Chrome", name: "Google Chrome", category: "essential", desc: "Navegador web do Google" },
    { id: "Microsoft.Office", name: "Microsoft 365 (Office)", category: "essential", desc: "Word, Excel, PowerPoint e Outlook" },
    { id: "9NKSQGP7F2NH", name: "WhatsApp", category: "essential", desc: "Mensageiro instantâneo", source: "msstore" },
    { id: "RARLab.WinRAR", name: "WinRAR", category: "essential", desc: "Compactador de arquivos" },
    { id: "Oracle.JavaRuntimeEnvironment", name: "Java 8 (JRE)", category: "essential", desc: "Executa aplicativos e applets Java" },

    // Navegadores
    { id: "Mozilla.Firefox", name: "Mozilla Firefox", category: "browsers", desc: "Navegador open source" },
    { id: "Brave.Brave", name: "Brave", category: "browsers", desc: "Navegador focado em privacidade" },
    { id: "Opera.Opera", name: "Opera", category: "browsers", desc: "Navegador com VPN integrada" },
    { id: "Opera.OperaGX", name: "Opera GX", category: "browsers", desc: "Navegador para gamers" },
    { id: "Vivaldi.Vivaldi", name: "Vivaldi", category: "browsers", desc: "Navegador altamente customizável" },

    // Utilitarios (sistema, nuvem, documentos e seguranca)
    { id: "7zip.7zip", name: "7-Zip", category: "utilities", desc: "Compactador de arquivos" },
    { id: "voidtools.Everything", name: "Everything", category: "utilities", desc: "Busca instantânea de arquivos" },
    { id: "Microsoft.PowerToys", name: "PowerToys", category: "utilities", desc: "Utilitários extras da Microsoft" },
    { id: "Notepad++.Notepad++", name: "Notepad++", category: "utilities", desc: "Editor de texto leve" },
    { id: "Rufus.Rufus", name: "Rufus", category: "utilities", desc: "Criação de pendrives bootáveis" },
    { id: "RevoUninstaller.RevoUninstaller", name: "Revo Uninstaller", category: "utilities", desc: "Remoção completa de programas" },
    { id: "JAMSoftware.TreeSize.Free", name: "TreeSize Free", category: "utilities", desc: "Análise de uso de disco" },
    { id: "WinDirStat.WinDirStat", name: "WinDirStat", category: "utilities", desc: "Análise visual de disco" },
    { id: "Microsoft.WindowsTerminal", name: "Windows Terminal", category: "utilities", desc: "Terminal moderno da Microsoft" },
    { id: "Google.GoogleDrive", name: "Google Drive", category: "utilities", desc: "Armazenamento em nuvem" },
    { id: "Dropbox.Dropbox", name: "Dropbox", category: "utilities", desc: "Armazenamento em nuvem" },
    { id: "Adobe.Acrobat.Reader.64-bit", name: "Adobe Acrobat Reader", category: "utilities", desc: "Leitor de PDF" },
    { id: "TheDocumentFoundation.LibreOffice", name: "LibreOffice", category: "utilities", desc: "Suíte de escritório" },
    { id: "SumatraPDF.SumatraPDF", name: "Sumatra PDF", category: "utilities", desc: "Leitor de PDF leve" },
    { id: "Foxit.FoxitReader", name: "Foxit PDF Reader", category: "utilities", desc: "Leitor de PDF" },
    { id: "Malwarebytes.Malwarebytes", name: "Malwarebytes", category: "utilities", desc: "Anti-malware" },
    { id: "Bitwarden.Bitwarden", name: "Bitwarden", category: "utilities", desc: "Gerenciador de senhas" },
    { id: "KeePassXCTeam.KeePassXC", name: "KeePassXC", category: "utilities", desc: "Gerenciador de senhas offline" },
    { id: "Obsidian.Obsidian", name: "Obsidian", category: "utilities", desc: "Notas em Markdown com links" },
    { id: "Microsoft.PowerBI", name: "Power BI Desktop", category: "utilities", desc: "Relatórios e dashboards de dados" },
    { id: "CrystalDewWorld.CrystalDiskInfo", name: "CrystalDiskInfo", category: "utilities", desc: "Saúde dos discos via S.M.A.R.T." },
    { id: "Ubiquiti.WiFimanDesktop", name: "WiFiman Desktop", category: "utilities", desc: "Análise de redes Wi-Fi da Ubiquiti" },
    { id: "Cloudflare.Warp", name: "Cloudflare WARP", category: "utilities", desc: "VPN e DNS seguro da Cloudflare" },
    { id: "XPDCCXDN26VNBT", name: "Dell SupportAssist", category: "utilities", desc: "Diagnóstico e drivers para PCs Dell", source: "msstore" },
    { id: "9WZDNCRFJ4MV", name: "Lenovo Vantage", category: "utilities", desc: "Diagnóstico e drivers para PCs Lenovo", source: "msstore" },

    // Desenvolvimento
    { id: "Microsoft.VisualStudioCode", name: "Visual Studio Code", category: "dev", desc: "Editor de código" },
    { id: "Git.Git", name: "Git", category: "dev", desc: "Controle de versão" },
    { id: "OpenJS.NodeJS.LTS", name: "Node.js LTS", category: "dev", desc: "Runtime JavaScript" },
    { id: "Python.Python.3.12", name: "Python 3.12", category: "dev", desc: "Linguagem de programação" },
    { id: "Docker.DockerDesktop", name: "Docker Desktop", category: "dev", desc: "Containers no Windows" },
    { id: "Postman.Postman", name: "Postman", category: "dev", desc: "Testes de API" },
    { id: "GitHub.GitHubDesktop", name: "GitHub Desktop", category: "dev", desc: "Cliente gráfico do Git" },
    { id: "PuTTY.PuTTY", name: "PuTTY", category: "dev", desc: "Cliente SSH/Telnet" },
    { id: "DBeaver.DBeaver.Community", name: "DBeaver", category: "dev", desc: "Cliente universal de banco de dados" },
    { id: "Microsoft.VisualStudio.2022.Community", name: "Visual Studio 2022", category: "dev", desc: "IDE completa da Microsoft (Community)" },
    { id: "Microsoft.PowerShell", name: "PowerShell 7", category: "dev", desc: "Shell e linguagem de script multiplataforma" },
    { id: "Microsoft.PowerShell.Preview", name: "PowerShell Preview", category: "dev", desc: "Versão de testes do PowerShell 7" },
    { id: "Microsoft.WSL", name: "WSL", category: "dev", desc: "Subsistema do Windows para Linux" },
    { id: "Insomnia.Insomnia", name: "Insomnia", category: "dev", desc: "Testes de API REST e GraphQL" },
    { id: "mRemoteNG.mRemoteNG", name: "mRemoteNG", category: "dev", desc: "Gerenciador de conexões RDP, SSH e VNC" },
    { id: "Microsoft.WindowsApp", name: "Windows App", category: "dev", desc: "Área de trabalho remota da Microsoft" },
    { id: "Anthropic.Claude", name: "Claude", category: "dev", desc: "Assistente de IA da Anthropic" },
    { id: "Google.Antigravity", name: "Antigravity", category: "dev", desc: "IDE com agentes de IA do Google" },

    // Comunicacao
    { id: "Discord.Discord", name: "Discord", category: "comm", desc: "Chat de voz e texto" },
    { id: "Zoom.Zoom", name: "Zoom Workplace", category: "comm", desc: "Videoconferência" },
    { id: "SlackTechnologies.Slack", name: "Slack", category: "comm", desc: "Chat corporativo" },
    { id: "Microsoft.Teams", name: "Microsoft Teams", category: "comm", desc: "Chat e reuniões" },
    { id: "Telegram.TelegramDesktop", name: "Telegram", category: "comm", desc: "Mensageiro instantâneo" },

    // Midia, criacao e jogos
    { id: "VideoLAN.VLC", name: "VLC Media Player", category: "media", desc: "Player de vídeo universal" },
    { id: "Spotify.Spotify", name: "Spotify", category: "media", desc: "Streaming de música" },
    { id: "OBSProject.OBSStudio", name: "OBS Studio", category: "media", desc: "Gravação e transmissão de vídeo" },
    { id: "HandBrake.HandBrake", name: "HandBrake", category: "media", desc: "Conversor de vídeo" },
    { id: "Audacity.Audacity", name: "Audacity", category: "media", desc: "Edição de áudio" },
    { id: "CodecGuide.K-LiteCodecPack.Standard", name: "K-Lite Codec Pack", category: "media", desc: "Pacote de codecs de vídeo" },
    { id: "GIMP.GIMP", name: "GIMP", category: "media", desc: "Edição de imagens" },
    { id: "dotPDN.PaintDotNet", name: "Paint.NET", category: "media", desc: "Editor de imagens simples" },
    { id: "Inkscape.Inkscape", name: "Inkscape", category: "media", desc: "Edição de vetores" },
    { id: "IrfanSkiljan.IrfanView", name: "IrfanView", category: "media", desc: "Visualizador de imagens" },
    { id: "ShareX.ShareX", name: "ShareX", category: "media", desc: "Captura de tela e anotações" },
    { id: "Valve.Steam", name: "Steam", category: "media", desc: "Plataforma de jogos" },
    { id: "EpicGames.EpicGamesLauncher", name: "Epic Games Launcher", category: "media", desc: "Plataforma de jogos" },
    { id: "GOG.Galaxy", name: "GOG Galaxy", category: "media", desc: "Plataforma de jogos" },
];
