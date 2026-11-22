/* Suite UI: exercita o app.js REAL dentro do DOM real do index.html */
(function () {
    const R = { suite: "ui", pass: 0, fail: 0, failures: [], info: {}, scripts: {} };
    const N = APPS.length;          // contagem vem do catalogo real, nunca fixa
    R.info.catalogSize = N;
    function check(name, cond, detail) {
        if (cond) R.pass++;
        else { R.fail++; R.failures.push(name + (detail !== undefined ? " -> " + detail : "")); }
    }
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));

    function setSearch(v) {
        const el = $("#searchInput");
        el.value = v;
        el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    function cardNames() {
        return $$("#appGrid .card .card-name").map(e => e.textContent);
    }
    function clickTab(label) {
        const t = $$(".tab").find(b => b.textContent.trim() === label);
        if (t) t.click();
        return !!t;
    }
    function selectCard(name) {
        const card = $$("#appGrid .card").find(c => c.querySelector(".card-name").textContent === name);
        if (!card) return false;
        card.querySelector("input[type=checkbox]").click();
        return true;
    }

    function run() {
        // ---------- Estado inicial ----------
        check("abas renderizadas = 7", $$(".tab").length === 7, $$(".tab").length);
        check("primeira aba = Essencial", $$(".tab")[0].textContent.trim() === "Essencial");
        check("ultima aba = Todos", $$(".tab")[6].textContent.trim() === "Todos");
        check("aba Essencial ativa por padrao", $$(".tab")[0].classList.contains("active"));
        check("grid inicial = 5 apps essenciais", cardNames().length === 5, cardNames().length);
        check("contador inicial '0 selecionados'", $("#selectedCount").textContent === "0 selecionados",
            $("#selectedCount").textContent);
        check("botao Gerar desabilitado sem selecao", $("#generateBtn").disabled);
        check("botao Limpar desabilitado sem selecao", $("#clearBtn").disabled);
        check("painel de script escondido no inicio", $("#scriptPanel").hidden);

        // ---------- Icones das abas sao SVG, nao emoji ----------
        check("todas abas usam <svg>", $$(".tab svg.tab-icon").length === 7, $$(".tab svg.tab-icon").length);
        const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
        check("nenhum emoji no texto das abas", !$$(".tab").some(t => emojiRe.test(t.textContent)));
        check("svg usa currentColor", $(".tab svg.tab-icon").getAttribute("stroke") === "currentColor");

        // ---------- Busca GLOBAL (o pedido principal) ----------
        setSearch("gimp");
        check("busca global acha GIMP estando em Essencial", cardNames().includes("GIMP"), cardNames().join(","));
        check("nenhuma aba fica ativa durante busca", $$(".tab").filter(t => t.classList.contains("active")).length === 0);

        setSearch("steam");
        check("busca global acha Steam (categoria media)", cardNames().includes("Steam"));

        setSearch("dotPDN");
        check("busca por winget ID acha Paint.NET", cardNames().includes("Paint.NET"), cardNames().join(","));

        setSearch("senhas");
        const descHits = cardNames();
        check("busca por descricao acha gerenciadores de senha", descHits.length >= 2, descHits.join(","));

        setSearch("zzzznaoexiste");
        check("busca sem resultado -> grid vazio", cardNames().length === 0);
        check("busca sem resultado -> empty state visivel", !$("#emptyState").hidden);

        setSearch("");
        check("limpar busca volta para categoria ativa (5 essenciais)", cardNames().length === 5, cardNames().length);
        check("aba Essencial volta a ficar ativa", $$(".tab")[0].classList.contains("active"));

        // ---------- Clicar numa aba limpa a busca ----------
        setSearch("gimp");
        clickTab("Navegadores");
        check("clicar em aba limpa o campo de busca", $("#searchInput").value === "", "'" + $("#searchInput").value + "'");
        check("aba Navegadores mostra 5 navegadores", cardNames().length === 5, cardNames().length);
        check("aba Navegadores fica ativa", $$(".tab")[1].classList.contains("active"));

        // ---------- Aba 'Todos' ----------
        clickTab("Todos");
        R.info.totalCards = cardNames().length;
        check("aba Todos mostra os " + N + " apps do catalogo", cardNames().length === N, cardNames().length);

        // ---------- Selecao ----------
        clickTab("Essencial");
        check("selecionar Google Chrome", selectCard("Google Chrome"));
        check("contador vira '1 selecionado' (singular)", $("#selectedCount").textContent === "1 selecionado",
            $("#selectedCount").textContent);
        check("botao Gerar habilita com 1 selecao", !$("#generateBtn").disabled);
        check("card fica com classe .selected",
            $$("#appGrid .card").some(c => c.querySelector(".card-name").textContent === "Google Chrome"
                && c.classList.contains("selected")));

        selectCard("WinRAR");
        check("contador vira '2 selecionados' (plural)", $("#selectedCount").textContent === "2 selecionados",
            $("#selectedCount").textContent);

        // ---------- Selecao persiste ao trocar de categoria ----------
        clickTab("Navegadores");
        clickTab("Essencial");
        check("selecao sobrevive a troca de categoria", $("#selectedCount").textContent === "2 selecionados",
            $("#selectedCount").textContent);
        check("card continua marcado apos re-render",
            $$("#appGrid .card").some(c => c.querySelector(".card-name").textContent === "Google Chrome"
                && c.classList.contains("selected")));

        // ---------- Selecao persiste ao buscar ----------
        setSearch("chrome");
        check("card seleccionado aparece marcado na busca",
            $$("#appGrid .card").some(c => c.classList.contains("selected")));
        setSearch("");

        // ---------- Desmarcar ----------
        selectCard("WinRAR");
        check("desmarcar volta para '1 selecionado'", $("#selectedCount").textContent === "1 selecionado",
            $("#selectedCount").textContent);
        selectCard("WinRAR"); // re-seleciona para os testes de script

        // ---------- Geracao de script ----------
        $("#generateBtn").click();
        check("painel aparece ao gerar", !$("#scriptPanel").hidden);
        const s1 = $("#scriptOutput").value;
        R.scripts.doisApps = s1;
        check("script nao vazio", s1.length > 100, s1.length);
        check("script contem Google.Chrome", s1.includes("Google.Chrome"));
        check("script contem RARLab.WinRAR", s1.includes("RARLab.WinRAR"));
        check("script tem check de Administrador", s1.includes("IsInRole"));
        check("script tem Start-Process -Verb RunAs", s1.includes("-Verb RunAs"));
        check("script tem --accept-source-agreements", s1.includes("--accept-source-agreements"));
        check("script NAO tem --accept-package-agreements", !s1.includes("--accept-package-agreements"));
        check("script NAO menciona Set-ExecutionPolicy", !s1.includes("Set-ExecutionPolicy"));
        check("script NAO tem -Bypass", !s1.includes("Bypass"));
        check("script tem --silent (toggle ligado por padrao)", s1.includes("--silent"));
        check("script passa --source", s1.includes("--source"));
        check("script declara Source = \"winget\"", s1.includes('Source = "winget"'));
        check("total de apps no cabecalho = 2", s1.includes("Total de aplicativos: 2"));

        // ---------- Toggle de instalacao silenciosa ----------
        $("#silentToggle").click();
        const s2 = $("#scriptOutput").value;
        R.scripts.semSilent = s2;
        check("desligar silencioso remove --silent", !s2.includes("--silent"));
        check("desligar silencioso mantem -e", s2.includes(" -e "));
        $("#silentToggle").click();
        check("religar silencioso traz --silent de volta", $("#scriptOutput").value.includes("--silent"));

        // ---------- App da Microsoft Store (source diferente) ----------
        $("#clearBtn").click();
        clickTab("Essencial");
        selectCard("WhatsApp");
        $("#generateBtn").click();
        const s3 = $("#scriptOutput").value;
        R.scripts.msstore = s3;
        check("WhatsApp usa Source = msstore", s3.includes('Source = "msstore"'), "nao achou");
        check("WhatsApp usa o ID da Store", s3.includes("9NKSQGP7F2NH"));

        // ---------- Selecionar TODOS (caso extremo) ----------
        $("#clearBtn").click();
        check("Limpar zera o contador", $("#selectedCount").textContent === "0 selecionados");
        check("Limpar desabilita Gerar", $("#generateBtn").disabled);
        clickTab("Todos");
        $$("#appGrid .card input[type=checkbox]").forEach(cb => cb.click());
        check("todos os " + N + " selecionados", $("#selectedCount").textContent === N + " selecionados",
            $("#selectedCount").textContent);
        $("#generateBtn").click();
        const sAll = $("#scriptOutput").value;
        R.scripts.todos = sAll;
        check("script com " + N + " apps gerado", sAll.includes("Total de aplicativos: " + N));
        R.info.scriptCharsTodos = sAll.length;

        // ---------- Fechar painel ----------
        $("#panelClose").click();
        check("painel fecha no X", $("#scriptPanel").hidden);
        $("#clearBtn").click();

        // ---------- Tema ----------
        const t0 = document.documentElement.getAttribute("data-theme");
        check("data-theme definido no load", t0 === "dark" || t0 === "light", t0);
        $("#themeToggle").click();
        const t1 = document.documentElement.getAttribute("data-theme");
        check("toggle inverte o tema", t1 !== t0, t0 + " -> " + t1);
        check("exatamente 1 icone de tema ativo", $$(".theme-icon.active").length === 1,
            $$(".theme-icon.active").length);
        check("tema escuro mostra icone de sol",
            t1 === "dark" ? $(".icon-sun").classList.contains("active") : $(".icon-moon").classList.contains("active"));
        $("#themeToggle").click();
        check("toggle volta ao tema original", document.documentElement.getAttribute("data-theme") === t0);

        // ---------- Persistencia (localStorage) ----------
        try {
            selectCard("Google Chrome");
            const raw = localStorage.getItem("winget-toolkit-selection");
            check("selecao salva no localStorage", !!raw && raw.includes("Google.Chrome"), raw);
            check("tema salvo no localStorage", !!localStorage.getItem("winget-toolkit-theme"));
            $("#clearBtn").click();
            const raw2 = localStorage.getItem("winget-toolkit-selection");
            check("limpar esvazia o localStorage", raw2 === "[]", raw2);
        } catch (e) {
            R.info.localStorage = "indisponivel: " + e.message;
        }

        // ---------- Icones dos cards ----------
        clickTab("Todos");
        const imgs = $$("#appGrid .card-icon img");
        R.info.cardImgs = imgs.length;
        check("todo card tem <img> de icone", imgs.length === N, imgs.length);
        check("imgs usam lazy loading", imgs.every(i => i.getAttribute("loading") === "lazy"));
        const broken = imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.src.split("/").pop());
        check("nenhum icone quebrado", broken.length === 0, broken.join(","));

        // ---------- Acessibilidade basica ----------
        check("botoes de tema tem aria-label", !!$("#themeToggle").getAttribute("aria-label"));
        check("botao fechar painel tem aria-label", !!$("#panelClose").getAttribute("aria-label"));
        check("svgs decorativos tem aria-hidden", $$("svg.tab-icon").every(s => s.getAttribute("aria-hidden") === "true"));
        check("input de busca tem placeholder", !!$("#searchInput").getAttribute("placeholder"));
        check("textarea do script e readonly", $("#scriptOutput").hasAttribute("readonly"));
        check("cards usam <label for> ligado ao checkbox",
            $$("#appGrid .card").every(c => c.getAttribute("for") === c.querySelector("input").id));

        // ---------- Rodape / autoria ----------
        const links = $$(".footer-credit a");
        check("rodape tem links de autoria", links.length >= 1, links.length);
        check("links apontam para caiomartin.dev", links.every(a => a.href.includes("caiomartin.dev")));
        check("links abrem em nova aba com rel=noopener",
            links.every(a => a.target === "_blank" && a.rel.includes("noopener")));

        document.title = "TESTS_DONE";
    }

    function finish() {
        const pre = document.createElement("pre");
        pre.id = "testResults";
        pre.textContent = JSON.stringify(R);
        document.body.appendChild(pre);
    }

    window.addEventListener("DOMContentLoaded", () => {
        try { run(); } catch (e) {
            R.fail++;
            R.failures.push("EXCECAO: " + e.message + " @ " + (e.stack || "").split("\n")[1]);
        }
        finish();
    });
})();
