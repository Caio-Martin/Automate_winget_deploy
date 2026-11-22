/* Mede layout real para detectar overflow horizontal e sobreposicoes */
window.addEventListener("DOMContentLoaded", () => {
    const R = { pass: 0, fail: 0, failures: [], metrics: {} };
    const check = (n, c, d) => { if (c) R.pass++; else { R.fail++; R.failures.push(n + (d !== undefined ? " -> " + d : "")); } };
    const $ = (s) => document.querySelector(s);

    const w = window.innerWidth;
    R.metrics.viewport = w;
    R.metrics.docScrollWidth = document.documentElement.scrollWidth;
    R.metrics.bodyScrollWidth = document.body.scrollWidth;

    // O corpo da pagina nunca deve rolar horizontalmente
    check("sem scroll horizontal no documento",
        document.documentElement.scrollWidth <= w + 1,
        document.documentElement.scrollWidth + " > " + w);

    // Nenhum elemento pode estourar a viewport
    const overflowing = Array.from(document.querySelectorAll("body *")).filter(el => {
        const r = el.getBoundingClientRect();
        // ignora elementos dentro de containers com scroll proprio (abas)
        if (el.closest(".tabs") && el !== $(".tabs")) return false;
        return r.right > w + 1 && r.width > 0;
    }).map(el => el.tagName + "." + (el.className.baseVal || el.className || "").toString().split(" ")[0]);
    check("nenhum elemento estoura a viewport", overflowing.length === 0,
        [...new Set(overflowing)].slice(0, 5).join(", "));

    // Barra de abas deve ter scroll proprio quando nao cabe
    const tabs = $(".tabs");
    const tabsScrolls = tabs.scrollWidth > tabs.clientWidth;
    R.metrics.tabsOverflow = tabsScrolls;
    if (tabsScrolls) {
        check("abas com overflow usam scroll proprio",
            getComputedStyle(tabs).overflowX === "auto" || getComputedStyle(tabs).overflowX === "scroll",
            getComputedStyle(tabs).overflowX);
    } else { R.pass++; }

    // Cards nao podem ficar espremidos demais
    const cards = Array.from(document.querySelectorAll("#appGrid .card"));
    const widths = cards.map(c => c.getBoundingClientRect().width);
    R.metrics.cardWidth = widths.length ? Math.round(Math.min(...widths)) : 0;
    check("cards com largura utilizavel (>=200px)", widths.every(x => x >= 200), R.metrics.cardWidth + "px");

    // Barra fixa inferior nao pode cobrir o TEXTO do rodape.
    // So faz sentido medir com a pagina ROLADA ATE O FIM (e a situacao em que
    // o rodape fica mais perto da barra). Mede o texto, nao a caixa do <footer>,
    // que tem 110px de padding justamente para reservar esse espaco.
    window.scrollTo(0, document.documentElement.scrollHeight);
    const bar = $(".action-bar").getBoundingClientRect();
    const lastText = $(".site-footer .footer-credit").getBoundingClientRect();
    R.metrics.viewportH = window.innerHeight;
    R.metrics.scrolledTo = Math.round(window.scrollY);
    R.metrics.footerTextBottom = Math.round(lastText.bottom);
    R.metrics.barTop = Math.round(bar.top);
    check("texto do rodape visivel acima da barra (rolado ao fim)",
        lastText.bottom <= bar.top + 1,
        "textoBottom=" + Math.round(lastText.bottom) + " barTop=" + Math.round(bar.top)
        + " viewportH=" + window.innerHeight);
    check("rodape tem padding reservando espaco sob a barra fixa",
        parseFloat(getComputedStyle($(".site-footer")).paddingBottom) >= bar.height,
        getComputedStyle($(".site-footer")).paddingBottom + " vs barra " + Math.round(bar.height) + "px");

    // Cabecalho fixo
    check("cabecalho e sticky", getComputedStyle($("header.topbar")).position === "sticky");

    // Busca ocupa a largura disponivel
    const si = $("#searchInput").getBoundingClientRect();
    check("campo de busca tem largura razoavel", si.width > w * 0.5, Math.round(si.width) + "px");

    // Area de toque minima dos controles (acessibilidade mobile)
    const small = [...document.querySelectorAll(".tab, .btn, .icon-btn")]
        .filter(el => { const r = el.getBoundingClientRect(); return r.height > 0 && r.height < 30; })
        .map(el => el.className.split(" ")[0] + ":" + Math.round(el.getBoundingClientRect().height));
    check("controles com altura de toque >=30px", small.length === 0, [...new Set(small)].join(","));

    // Contraste: texto principal nao pode ser igual ao fundo
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const bodyFg = getComputedStyle(document.body).color;
    R.metrics.bg = bodyBg; R.metrics.fg = bodyFg;
    check("texto difere do fundo", bodyBg !== bodyFg, bodyBg + " vs " + bodyFg);
    check("fundo do body nao e transparente",
        bodyBg !== "rgba(0, 0, 0, 0)" && bodyBg !== "transparent", bodyBg);

    const pre = document.createElement("pre");
    pre.id = "respResults";
    pre.textContent = JSON.stringify(R);
    document.body.appendChild(pre);
});
