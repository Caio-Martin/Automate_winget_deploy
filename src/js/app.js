(function () {
    "use strict";

    const STORAGE_KEY = "winget-toolkit-selection";
    const THEME_KEY = "winget-toolkit-theme";

    // --- Origem dos icones ---------------------------------------------------
    // Publicado, os icones sao servidos do proprio repositorio na branch main
    // via jsDelivr. Usamos o CDN e nao o raw.githubusercontent porque este
    // ultimo e limitado por taxa e nao foi feito para trafego de producao.
    //
    // A pipeline de deploy substitui "@main" pelo SHA do commit publicado, de
    // modo que cada versao do site tenha sua propria URL de icone e o cache do
    // CDN nunca devolva uma imagem desatualizada.
    const REMOTE_ICON_BASE =
        "https://cdn.jsdelivr.net/gh/Caio-Martin/Automate_winget_deploy@main/src/assets/apps/";
    const LOCAL_ICON_BASE = "src/assets/apps/";

    // Abrindo o arquivo direto (file://) ou servindo em localhost, usa os PNGs
    // do disco: da para trabalhar offline e ver a troca de um icone na hora.
    const isLocal =
        location.protocol === "file:" ||
        /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    const ICON_BASE = isLocal ? LOCAL_ICON_BASE : REMOTE_ICON_BASE;

    const TAB_ICONS = {
        star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
        globe: '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
        tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>',
        code: '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
        chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>',
        film: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line>',
        grid: '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>',
    };

    function tabIconSvg(name) {
        const inner = TAB_ICONS[name] || TAB_ICONS.grid;
        return `<svg class="tab-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
    }

    const state = {
        selected: new Set(loadSelection()),
        category: "essential",
        query: "",
    };

    const el = {
        tabs: document.getElementById("categoryTabs"),
        grid: document.getElementById("appGrid"),
        search: document.getElementById("searchInput"),
        count: document.getElementById("selectedCount"),
        clearBtn: document.getElementById("clearBtn"),
        generateBtn: document.getElementById("generateBtn"),
        panel: document.getElementById("scriptPanel"),
        panelClose: document.getElementById("panelClose"),
        scriptOutput: document.getElementById("scriptOutput"),
        copyBtn: document.getElementById("copyBtn"),
        downloadBtn: document.getElementById("downloadBtn"),
        silentToggle: document.getElementById("silentToggle"),
        themeToggle: document.getElementById("themeToggle"),
        iconSun: document.querySelector(".icon-sun"),
        iconMoon: document.querySelector(".icon-moon"),
        emptyState: document.getElementById("emptyState"),
        catalogStats: document.getElementById("catalogStats"),
    };

    function loadSelection() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveSelection() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.selected]));
        } catch {
            /* localStorage indisponível, ignora */
        }
    }

    function systemPrefersDark() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        if (el.iconSun && el.iconMoon) {
            el.iconSun.classList.toggle("active", theme === "dark");
            el.iconMoon.classList.toggle("active", theme === "light");
        }
    }

    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        applyTheme(saved === "light" || saved === "dark" ? saved : (systemPrefersDark() ? "dark" : "light"));

        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
            if (!localStorage.getItem(THEME_KEY)) {
                applyTheme(e.matches ? "dark" : "light");
            }
        });
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        try {
            localStorage.setItem(THEME_KEY, next);
        } catch { /* ignora */ }
    }

    function renderTabs() {
        el.tabs.innerHTML = "";
        const searching = state.query.trim().length > 0;
        CATEGORIES.forEach((cat) => {
            const btn = document.createElement("button");
            btn.className = "tab" + (!searching && cat.key === state.category ? " active" : "");
            btn.type = "button";
            btn.innerHTML = `${tabIconSvg(cat.icon)}<span>${cat.label}</span>`;
            btn.addEventListener("click", () => {
                state.category = cat.key;
                state.query = "";
                el.search.value = "";
                renderTabs();
                renderGrid();
            });
            el.tabs.appendChild(btn);
        });
    }

    function initials(name) {
        return name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((w) => w[0].toUpperCase())
            .join("");
    }

    function matchesFilter(app) {
        const q = state.query.trim().toLowerCase();
        if (q) {
            // Com busca ativa, ignora a categoria selecionada e varre o catalogo inteiro.
            return app.name.toLowerCase().includes(q) ||
                app.desc.toLowerCase().includes(q) ||
                app.id.toLowerCase().includes(q);
        }
        return state.category === "all" || app.category === state.category;
    }

    function renderGrid() {
        const filtered = APPS.filter(matchesFilter);
        el.grid.innerHTML = "";
        el.emptyState.hidden = filtered.length !== 0;

        filtered.forEach((app) => {
            const card = document.createElement("label");
            card.className = "card" + (state.selected.has(app.id) ? " selected" : "");
            card.setAttribute("for", "chk-" + cssSafe(app.id));

            card.innerHTML = `
                <input type="checkbox" id="chk-${cssSafe(app.id)}" ${state.selected.has(app.id) ? "checked" : ""} />
                <span class="card-icon" aria-hidden="true">
                    <img src="${ICON_BASE}${cssSafe(app.id)}.png" alt="" loading="lazy" />
                </span>
                <span class="card-body">
                    <code class="card-tag" title="${app.id}">${app.id}</code>
                    <span class="card-name">${app.name}</span>
                    <span class="card-desc" title="${app.desc}">${app.desc}</span>
                </span>
                <span class="card-check" aria-hidden="true">✓</span>
            `;

            const icon = card.querySelector(".card-icon img");
            // Se o CDN estiver fora do ar, ainda existe uma copia dos icones
            // publicada junto com o site: tenta ela antes de desistir. So depois
            // das duas falharem o card cai para as iniciais do nome.
            let tentouLocal = ICON_BASE === LOCAL_ICON_BASE;
            icon.addEventListener("error", function aoFalhar() {
                if (!tentouLocal) {
                    tentouLocal = true;
                    icon.src = LOCAL_ICON_BASE + cssSafe(app.id) + ".png";
                    return;
                }
                icon.removeEventListener("error", aoFalhar);
                const fallback = document.createElement("span");
                fallback.className = "card-icon-fallback";
                fallback.textContent = initials(app.name);
                icon.replaceWith(fallback);
            });

            const checkbox = card.querySelector("input");
            checkbox.addEventListener("change", () => {
                if (checkbox.checked) {
                    state.selected.add(app.id);
                } else {
                    state.selected.delete(app.id);
                }
                card.classList.toggle("selected", checkbox.checked);
                saveSelection();
                updateCount();
            });

            el.grid.appendChild(card);
        });
    }

    function cssSafe(str) {
        return str.replace(/[^a-zA-Z0-9]/g, "-");
    }

    function updateCount() {
        const n = state.selected.size;
        el.count.textContent = n === 1 ? "1 selecionado" : `${n} selecionados`;
        // Versao curta usada pelo CSS em telas estreitas (evita truncar em "0 ...").
        el.count.dataset.compact = `${n} sel.`;
        el.generateBtn.disabled = n === 0;
        el.clearBtn.disabled = n === 0;
    }

    function buildScript() {
        const chosen = APPS.filter((a) => state.selected.has(a.id));
        const silent = el.silentToggle.checked;
        const flags = ["-e", "--accept-source-agreements"];
        if (silent) flags.push("--silent");
        const flagsStr = flags.join(" ");

        const now = new Date();
        const stamp = now.toLocaleString("pt-BR");

        const lines = [];
        lines.push("<#");
        lines.push("  Script gerado automaticamente - WinGet Toolkit");
        lines.push(`  Gerado em: ${stamp}`);
        lines.push(`  Total de aplicativos: ${chosen.length}`);
        lines.push("  Este script pede elevacao de Administrador sozinho, se precisar.");
        lines.push("#>");
        lines.push("");
        lines.push("$payload = {");
        lines.push('    $ErrorActionPreference = "Continue"');
        lines.push("");
        lines.push("    $apps = @(");
        chosen.forEach((app) => {
            const source = app.source || "winget";
            lines.push(`        [PSCustomObject]@{ Nome = "${escapePs(app.name)}"; Id = "${app.id}"; Source = "${source}" }`);
        });
        lines.push("    )");
        lines.push("");
        lines.push('    Write-Host "Iniciando instalacao de $($apps.Count) aplicativo(s)..." -ForegroundColor Cyan');
        lines.push(`    Write-Host "O aceite inicial do winget (se for a primeira vez nesta maquina) e feito automaticamente. Porem, alguns pacotes tem termos de licenca proprios: se aparecer um pedido assim, fique atento e responda 'S' quando solicitado." -ForegroundColor Yellow`);
        lines.push('    Write-Host ""');
        lines.push("");
        lines.push("    foreach ($app in $apps) {");
        lines.push('        Write-Host "`n>> Instalando $($app.Nome) ($($app.Id))..." -ForegroundColor Yellow');
        lines.push(`        winget install --id $($app.Id) --source $($app.Source) ${flagsStr}`);
        lines.push("    }");
        lines.push("");
        lines.push('    Write-Host "`nInstalacao concluida!" -ForegroundColor Green');
        lines.push("}");
        lines.push("");
        lines.push("$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)");
        lines.push("");
        lines.push("if ($isAdmin) {");
        lines.push("    & $payload");
        lines.push("} else {");
        lines.push('    Write-Host "Este script precisa ser executado como Administrador. Solicitando elevacao..." -ForegroundColor Yellow');
        lines.push('    Start-Process powershell -Verb RunAs -Wait -ArgumentList "-NoProfile", "-Command", $payload.ToString()');
        lines.push("}");

        return lines.join("\n");
    }

    function escapePs(str) {
        return str.replace(/"/g, '""');
    }

    function openPanel() {
        el.scriptOutput.value = buildScript();
        el.panel.hidden = false;
        el.panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function closePanel() {
        el.panel.hidden = true;
        el.copyBtn.textContent = "Copiar script";
    }

    async function copyScript() {
        try {
            await navigator.clipboard.writeText(el.scriptOutput.value);
            el.copyBtn.textContent = "Copiado!";
            setTimeout(() => (el.copyBtn.textContent = "Copiar script"), 1800);
        } catch {
            el.scriptOutput.select();
            document.execCommand("copy");
            el.copyBtn.textContent = "Copiado!";
            setTimeout(() => (el.copyBtn.textContent = "Copiar script"), 1800);
        }
    }

    function toBase64Utf16LE(str) {
        const bytes = new Uint8Array(str.length * 2);
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            bytes[i * 2] = code & 0xff;
            bytes[i * 2 + 1] = (code >> 8) & 0xff;
        }
        let binary = "";
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        return btoa(binary);
    }

    function downloadScript() {
        // Empacota o script como .bat chamando "powershell -EncodedCommand".
        // .bat nao e governado pela politica de execucao do PowerShell, e
        // -EncodedCommand roda como comando (nao como arquivo .ps1 assinado/bloqueado),
        // entao o arquivo baixado ja funciona de primeira, sem Unblock-File e sem bypass.
        const encoded = toBase64Utf16LE(el.scriptOutput.value);
        const batContent = `@echo off\r\npowershell -NoProfile -EncodedCommand ${encoded}\r\npause\r\n`;

        const blob = new Blob([batContent], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "instalar-apps.bat";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function clearSelection() {
        state.selected.clear();
        saveSelection();
        updateCount();
        renderGrid();
    }

    function bindEvents() {
        el.search.addEventListener("input", (e) => {
            state.query = e.target.value;
            renderTabs();
            renderGrid();
        });
        el.clearBtn.addEventListener("click", clearSelection);
        el.generateBtn.addEventListener("click", openPanel);
        el.panelClose.addEventListener("click", closePanel);
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !el.panel.hidden) closePanel();
        });
        el.copyBtn.addEventListener("click", copyScript);
        el.downloadBtn.addEventListener("click", downloadScript);
        el.silentToggle.addEventListener("change", () => {
            el.scriptOutput.value = buildScript();
        });
        el.themeToggle.addEventListener("click", toggleTheme);
    }

    function renderCatalogStats() {
        const totalCategories = CATEGORIES.length - 1; // exclui "Todos"
        el.catalogStats.textContent = `· ${APPS.length} aplicativos em ${totalCategories} categorias`;
    }

    function init() {
        initTheme();
        renderTabs();
        renderGrid();
        updateCount();
        renderCatalogStats();
        bindEvents();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
