(function () {
  "use strict";

  var WHATSAPP = "5532999222398";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  function waLink(msg) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svgUse(id, cls) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    if (cls) s.setAttribute("class", cls);
    s.setAttribute("aria-hidden", "true");
    var u = document.createElementNS(ns, "use");
    u.setAttribute("href", "#" + id);
    s.appendChild(u);
    return s;
  }
  function estrelas(n) {
    var s = el("span", "stars");
    s.setAttribute("role", "img");
    s.setAttribute("aria-label", n + " de 5 estrelas");
    for (var i = 0; i < n; i++) s.appendChild(svgUse("i-star"));
    return s;
  }

  /* Links de WhatsApp com mensagem pronta */
  document.querySelectorAll(".js-wa[data-msg]").forEach(function (a) {
    a.href = waLink(a.dataset.msg);
  });

  /* Header: sombra ao rolar */
  var header = document.querySelector(".site-header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 48); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Menu mobile */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("menu");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("open") && !e.target.closest(".site-header")) setMenu(false);
  });

  /* Google: nota, total, distribuição e avaliações (data/google.js) */
  var G = window.ANP_GOOGLE;
  if (G) {
    var nota = Number(G.nota).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    var total = Number(G.total).toLocaleString("pt-BR");
    document.querySelectorAll('[data-g="nota"]').forEach(function (n) { n.textContent = nota; });
    document.querySelectorAll('[data-g="total"]').forEach(function (n) { n.textContent = total; });

    // A distribuição é preenchida à mão; se o total mudou e ela não, escondemos para não mostrar número errado.
    var dist = G.distribuicao || {};
    var soma = [5, 4, 3, 2, 1].reduce(function (acc, k) { return acc + (dist[k] || 0); }, 0);
    var histo = document.querySelector("[data-histo]");
    var cinco = document.querySelector("[data-g-cinco]");
    if (soma === G.total && soma > 0) {
      if (histo) {
        histo.innerHTML = "";
        [5, 4, 3, 2, 1].forEach(function (k) {
          var li = el("li");
          var bar = el("i");
          bar.style.setProperty("--w", ((dist[k] || 0) / soma * 100).toFixed(1) + "%");
          li.appendChild(el("span", null, String(k)));
          li.appendChild(bar);
          li.appendChild(el("b", null, String(dist[k] || 0)));
          histo.appendChild(li);
        });
      }
      if (cinco) {
        cinco.innerHTML = "";
        cinco.appendChild(el("b", null, (dist[5] || 0).toLocaleString("pt-BR") + " de " + total));
        cinco.appendChild(document.createTextNode(" com 5 estrelas."));
      }
    } else {
      if (histo) histo.hidden = true;
      if (cinco) cinco.hidden = true;
    }
  }
  var avaliacoes = (G && G.avaliacoes || []).filter(function (r) { return r.nome && r.texto; });

  /* Mural de avaliações */
  var CORES = ["#c8262c", "#1d2230", "#2f6f4f", "#8a4b1f", "#3b4a8f", "#6b2a5c"];
  function iniciais(nome) {
    var p = nome.trim().split(/\s+/);
    return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
  }
  var lista = document.getElementById("lista-avaliacoes");
  if (lista) {
    avaliacoes.forEach(function (r, i) {
      var card = el("article", "review reveal");
      var head = el("div", "review-head");
      var av = el("span", "avatar", iniciais(r.nome));
      av.style.background = CORES[i % CORES.length];
      av.setAttribute("aria-hidden", "true");
      head.appendChild(av);
      head.appendChild(el("div", "review-name", r.nome));
      head.appendChild(svgUse("i-google", "g-logo"));
      card.appendChild(head);
      card.appendChild(estrelas(r.nota || 5));
      card.appendChild(el("blockquote", null, r.texto));
      lista.appendChild(card);
    });
  }

  /* Faixa de elogios em movimento: repete os itens até encher a tela, depois duplica para o loop */
  var curtas = avaliacoes.filter(function (r) { return r.texto.length <= 120; });
  var faixa = document.querySelector("[data-marquee]");
  if (faixa && curtas.length) {
    var base = [];
    while (base.length < 8) base = base.concat(curtas);
    base.concat(base).forEach(function (r, i) {
      var item = el("div", "praise-item");
      if (i >= base.length) item.setAttribute("aria-hidden", "true");
      item.appendChild(estrelas(r.nota || 5));
      item.appendChild(el("q", null, r.texto));
      item.appendChild(el("small", null, r.nome));
      faixa.appendChild(item);
    });
  } else if (faixa) {
    faixa.closest(".praise").hidden = true;
  }

  /* Depoimento rotativo no hero */
  var quote = document.querySelector("[data-quote]");
  if (quote && curtas.length > 1 && !reduceMotion) {
    var qi = 0, qTexto = quote.querySelector("blockquote"), qAutor = quote.querySelector("figcaption");
    setInterval(function () {
      quote.classList.add("swap");
      setTimeout(function () {
        qi = (qi + 1) % curtas.length;
        qTexto.textContent = "“" + curtas[qi].texto + "”";
        qAutor.textContent = curtas[qi].nome + " · via Google";
        quote.classList.remove("swap");
      }, 450);
    }, 5500);
  }

  /* Animação de entrada */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (r) {
      var pos = r.parentElement ? Array.prototype.indexOf.call(r.parentElement.children, r) : 0;
      r.style.transitionDelay = Math.min(pos, 5) * 70 + "ms";
      io.observe(r);
    });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }

  /* Celular do acompanhamento: percorre as etapas e atualiza o status */
  var steps = document.querySelectorAll("[data-steps] li");
  var etaLabel = document.querySelector("[data-eta-label]");
  if (steps.length) {
    var atual = 1;
    function pintar() {
      steps.forEach(function (li, i) {
        li.classList.toggle("done", i < atual);
        li.classList.toggle("current", i === atual);
      });
      var li = steps[Math.min(atual, steps.length - 1)];
      if (etaLabel) etaLabel.textContent = li.dataset.eta;
    }
    pintar();
    if (!reduceMotion) {
      setInterval(function () {
        atual = (atual + 1) % steps.length;
        pintar();
      }, 3200);
    }
  }

  /* Máscara de telefone */
  document.querySelectorAll('[data-mask="phone"]').forEach(function (inp) {
    inp.addEventListener("input", function () {
      var d = inp.value.replace(/\D/g, "").slice(0, 11);
      var out = d;
      if (d.length > 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 7) out = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(-4);
      inp.value = out;
    });
  });

  /* Formulários -> WhatsApp com os dados preenchidos */
  var TITULOS = {
    proposta: "Olá! Vim pelo site e gostaria de uma proposta da ANP.",
    prestador: "Olá! Vim pelo site e quero ser prestador da rede ANP."
  };
  document.querySelectorAll(".js-wa-form").forEach(function (form) {
    var erro = form.querySelector(".form-error");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, primeiro = null;
      form.querySelectorAll("[required]").forEach(function (f) {
        var vazio = !f.value.trim() || (f.dataset.mask === "phone" && f.value.replace(/\D/g, "").length < 10);
        f.classList.toggle("invalid", vazio);
        f.setAttribute("aria-invalid", String(vazio));
        if (vazio) { ok = false; primeiro = primeiro || f; }
      });
      erro.hidden = ok;
      if (!ok) { primeiro.focus(); return; }

      var linhas = [TITULOS[form.dataset.kind] || TITULOS.proposta, ""];
      new FormData(form).forEach(function (valor, campo) {
        valor = String(valor).trim();
        if (valor) linhas.push("*" + campo + ":* " + valor);
      });
      window.open(waLink(linhas.join("\n")), "_blank", "noopener");
    });
    form.addEventListener("input", function (e) {
      if (e.target.classList.contains("invalid") && e.target.value.trim()) {
        e.target.classList.remove("invalid");
        e.target.removeAttribute("aria-invalid");
      }
    });
  });

  /* Vídeos em modal */
  var modal = document.getElementById("video-modal");
  if (modal && typeof modal.showModal === "function") {
    var video = modal.querySelector("video");
    document.querySelectorAll(".js-video").forEach(function (btn) {
      btn.addEventListener("click", function () {
        video.src = btn.dataset.video;
        modal.setAttribute("aria-label", btn.dataset.title || "Vídeo");
        modal.showModal();
        video.play().catch(function () {});
      });
    });
    function fechar() { video.pause(); video.removeAttribute("src"); video.load(); modal.close(); }
    modal.querySelector(".video-close").addEventListener("click", fechar);
    modal.addEventListener("click", function (e) { if (e.target === modal) fechar(); });
    modal.addEventListener("cancel", function (e) { e.preventDefault(); fechar(); });
  } else {
    document.querySelectorAll(".js-video").forEach(function (btn) {
      btn.addEventListener("click", function () { window.open(btn.dataset.video, "_blank"); });
    });
  }

  /* Ano no rodapé */
  document.querySelectorAll("[data-year]").forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
