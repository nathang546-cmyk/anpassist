(function () {
  "use strict";

  var WHATSAPP = "5532999222398";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  function waLink(msg) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
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

  /* Avaliações */
  var AVATAR_CORES = ["#c8262c", "#1d2230", "#2f6f4f", "#8a4b1f", "#3b4a8f", "#6b2a5c"];
  function iniciais(nome) {
    var partes = nome.trim().split(/\s+/);
    var ini = partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "");
    return ini.toUpperCase();
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
  var lista = document.getElementById("lista-avaliacoes");
  if (lista && window.ANP_AVALIACOES) {
    window.ANP_AVALIACOES.forEach(function (r, i) {
      var card = el("article", "review reveal");
      var head = el("div", "review-head");
      var av = el("span", "avatar", iniciais(r.nome));
      av.style.background = AVATAR_CORES[i % AVATAR_CORES.length];
      av.setAttribute("aria-hidden", "true");
      var who = el("div");
      who.appendChild(el("div", "review-name", r.nome));
      who.appendChild(el("div", "review-meta", r.detalhe ? r.detalhe + " · Google" : "Avaliação no Google"));
      head.appendChild(av);
      head.appendChild(who);
      head.appendChild(svgUse("i-google", "g-logo"));
      card.appendChild(head);

      var stars = el("span", "stars");
      stars.setAttribute("role", "img");
      stars.setAttribute("aria-label", "5 de 5 estrelas");
      for (var s = 0; s < 5; s++) stars.appendChild(svgUse("i-star"));
      card.appendChild(stars);

      card.appendChild(el("blockquote", null, r.texto));
      if (r.resposta) {
        var rep = el("div", "review-reply");
        rep.appendChild(el("b", null, "Resposta da ANP"));
        rep.appendChild(document.createTextNode(r.resposta));
        card.appendChild(rep);
      }
      lista.appendChild(card);
    });
  }

  /* Animação de entrada */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (r, i) {
      var irmaos = r.parentElement ? Array.prototype.indexOf.call(r.parentElement.children, r) : 0;
      r.style.transitionDelay = Math.min(irmaos, 5) * 70 + "ms";
      io.observe(r);
    });
  } else {
    reveals.forEach(function (r) { r.classList.add("in"); });
  }

  /* Contadores */
  function formatar(n, dec) {
    return n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        co.unobserve(en.target);
        var node = en.target, alvo = parseFloat(node.dataset.count), dec = parseInt(node.dataset.decimals || "0", 10);
        var t0 = null, dur = 1400;
        function passo(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
          node.textContent = formatar(alvo * e, dec);
          if (p < 1) requestAnimationFrame(passo);
        }
        requestAnimationFrame(passo);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* Cartão "ao vivo" do hero: percorre as etapas do atendimento */
  var steps = document.querySelectorAll("[data-steps] li");
  if (steps.length) {
    var atual = 2;
    function pintar() {
      steps.forEach(function (li, i) {
        li.classList.toggle("done", i < atual);
        li.classList.toggle("current", i === atual);
      });
    }
    pintar();
    if (!reduceMotion) {
      setInterval(function () {
        atual = atual >= steps.length ? 0 : atual + 1;
        pintar();
      }, 3600);
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
      var email = form.querySelector('input[type="email"]');
      if (email && email.value && !email.checkValidity()) {
        email.classList.add("invalid"); ok = false; primeiro = primeiro || email;
      }
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
