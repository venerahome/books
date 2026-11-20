/* Читалка книг Венеры Хасановой */
(function () {
  const CFG = window.READER_CONFIG || {};
  const DEMO = !CFG.SUPABASE_URL;
  const $app = document.getElementById("app");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  function toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 3200);
  }

  /* ================= Данные ================= */
  function supaApi() {
    const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
    const ok = (r) => { if (r.error) throw r.error; return r.data; };
    return {
      async session() { const { data } = await sb.auth.getSession(); return data.session; },
      onAuth(cb) { sb.auth.onAuthStateChange((_e, s) => cb(s)); },
      async signUp(email, password) {
        const r = await sb.auth.signUp({ email, password });
        if (r.error) throw r.error;
        if (!r.data.session) { await this.signIn(email, password); }
      },
      async signIn(email, password) { ok(await sb.auth.signInWithPassword({ email, password })); },
      async signOut() { await sb.auth.signOut(); },
      async isAdmin() { try { return !!ok(await sb.rpc("is_admin")); } catch (e) { return false; } },
      async books() { return ok(await sb.from("books").select("*").order("sort")); },
      async book(id) { return ok(await sb.from("books").select("*").eq("id", id).maybeSingle()); },
      async toc(id) { return ok(await sb.rpc("book_toc", { p_book: id })); },
      async myAccess() { return new Set((ok(await sb.from("access").select("book_id")) || []).map((r) => r.book_id)); },
      async chapter(id, idx) { return ok(await sb.from("chapters").select("idx,title,body,free").eq("book_id", id).eq("idx", idx).maybeSingle()); },
      async accessList() { return ok(await sb.from("access").select("*").order("created_at", { ascending: false })); },
      async grant(email, book, note) { ok(await sb.from("access").upsert({ email: email.toLowerCase().trim(), book_id: book, source: "manual", note }, { onConflict: "email,book_id" })); },
      async revoke(email, book) { ok(await sb.from("access").delete().eq("email", email).eq("book_id", book)); },
      async importBook(json) {
        ok(await sb.from("books").upsert(json.book));
        const rows = json.chapters.map((c) => ({ ...c, book_id: json.book.id }));
        for (let i = 0; i < rows.length; i += 5) ok(await sb.from("chapters").upsert(rows.slice(i, i + 5)));
        const maxIdx = Math.max(...rows.map((r) => r.idx));
        ok(await sb.from("chapters").delete().eq("book_id", json.book.id).gt("idx", maxIdx));
      },
    };
  }

  function demoApi() {
    const D = window.DEMO_DATA;
    let session = store.get("demo_session", null);
    const access = new Set(store.get("demo_access", []));
    let cb = () => {};
    return {
      async session() { return session; },
      onAuth(f) { cb = f; },
      async signUp(email) { session = { user: { id: "demo", email } }; store.set("demo_session", session); cb(session); },
      async signIn(email) { return this.signUp(email); },
      async signOut() { session = null; store.set("demo_session", null); cb(null); },
      async isAdmin() { return !!session && /khassanovav@gmail\.com/i.test(session.user.email); },
      async books() { return [D.book]; },
      async book() { return D.book; },
      async toc() { return D.chapters.map((c) => ({ idx: c.idx, title: c.title, free: c.free })); },
      async myAccess() { return access; },
      async chapter(id, idx) {
        const c = D.chapters.find((x) => x.idx === idx);
        if (!c) return null;
        if (c.free || access.has(id)) return c.body ? c : { ...c, body: "В демо-версии текст этой главы не загружен. На настоящем сайте здесь будет полный текст главы." };
        return null;
      },
      async accessList() { return [...access].map((b) => ({ email: session?.user.email || "demo@example.com", book_id: b, source: "stripe", created_at: new Date().toISOString() })); },
      async grant(email, book) { access.add(book); store.set("demo_access", [...access]); },
      async revoke(email, book) { access.delete(book); store.set("demo_access", [...access]); },
      async importBook() {},
      demoBuy(book) { access.add(book); store.set("demo_access", [...access]); },
    };
  }

  const api = DEMO ? demoApi() : supaApi();
  const MANUAL_PAY = (id) => !DEMO && !((CFG.PAYMENT_LINKS || {})[id]);
  let SESSION = null, ACCESS = new Set(), ADMIN = false;

  async function refreshUser() {
    SESSION = await api.session();
    ACCESS = SESSION ? await api.myAccess().catch(() => new Set()) : new Set();
    ADMIN = SESSION ? await api.isAdmin() : false;
  }

  /* ================= Общие элементы ================= */
  function topbar() {
    const user = SESSION
      ? `${ADMIN ? `<a class="link-btn" href="#/admin">Админка</a>` : ""}
         <button class="link-btn" data-act="logout" title="${esc(SESSION.user.email)}">Выйти</button>`
      : `<a class="link-btn" href="#/login">Войти</a>`;
    return `${DEMO ? `<div class="demo-banner">Демо-версия: так будет выглядеть читалка. Вход и оплата здесь не настоящие.</div>` : ""}
      <header class="topbar"><a class="brand" href="#/">${esc(CFG.SITE_NAME || "Книги")}</a><span class="sp"></span>
      <a class="link-btn" href="#/">Мои книги</a>${user}</header>`;
  }
  const foot = () => `<div class="foot">© ${new Date().getFullYear()} Венера Хасанова · Все права защищены · Текст защищен от копирования
     ${CFG.CONTACT_WHATSAPP ? ` · <a href="https://wa.me/${esc(CFG.CONTACT_WHATSAPP)}" target="_blank" rel="noopener">Написать автору</a>` : ""}</div>`;
  function parseTitle(t) {
    const m = /^(Глава\s+\d+)\s*[:.]\s*(.+)$/.exec(t || "");
    return m ? { kicker: m[1], name: m[2] } : { kicker: "", name: t };
  }

  /* ================= Страницы ================= */
  async function pageLibrary() {
    const books = await api.books();
    if (books.length === 1) return pageBook(books[0].id);
    document.body.className = "";
    $app.innerHTML = topbar() + `<div class="section"><h2>Книги</h2><div class="library">${books.map((b) => `
      <a class="lib-card" href="#/book/${esc(b.id)}"><img src="${esc(b.cover_url)}" alt=""><div class="lt">${esc(b.title)}</div>
      <div class="ls">${esc(b.subtitle || "")}${ACCESS.has(b.id) ? " · куплено" : ""}</div></a>`).join("")}</div></div>` + foot();
  }

  async function pageBook(id) {
    const [b, toc] = await Promise.all([api.book(id), api.toc(id)]);
    if (!b) return pageNotFound();
    document.body.className = "";
    const owned = ACCESS.has(id) || ADMIN;
    const last = store.get("last_" + id, null);
    const startIdx = last ?? (toc[0] ? toc[0].idx : 0);
    const desc = String(b.description || "").split("\n").filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join("");
    const freeCount = toc.filter((c) => c.free).length;
    $app.innerHTML = topbar() + `
      <section class="hero"><div class="hero-bg" style="background-image:url('${esc(b.cover_url)}')"></div>
        <div class="hero-in"><img class="cover" src="${esc(b.cover_url)}" alt="Обложка">
        <div><div class="kicker">${esc(b.author || "")}</div>
          <h1 class="h-title">${esc(b.title)}</h1><p class="h-sub">${esc(b.subtitle || "")}</p>
          <div class="desc">${desc}</div>
          <div class="cta">${owned
            ? `<span class="owned">✓ Книга ваша</span><a class="btn btn-fire" href="#/read/${esc(id)}/${startIdx}">${last != null ? "Продолжить чтение" : "Начать читать"}</a>`
            : `<span class="price">${esc(b.price_label || "")}</span>
               <button class="btn btn-fire" data-act="buy" data-book="${esc(id)}">Купить и читать</button>
               ${freeCount ? `<a class="btn btn-ghost" href="#/read/${esc(id)}/${toc[0].idx}">Читать бесплатно</a>` : ""}`}
          </div>
          ${owned ? "" : `<div class="note">${freeCount ? `Первые главы (${freeCount}) — бесплатно. ` : ""}Книга читается онлайн на сайте с телефона или компьютера. Доступ навсегда.${MANUAL_PAY(id) ? " Чтобы купить, зарегистрируйтесь и нажмите «Купить и читать» — откроется WhatsApp для связи с автором." : ""}</div>`}
        </div></div></section>
      <section class="section"><h2>Содержание</h2><ul class="toc">${toc.map((c) => {
        const t = parseTitle(c.title), open = owned || c.free;
        return `<li class="${open ? "" : "locked"}"><a href="#/read/${esc(id)}/${c.idx}">
          <span class="num">${esc(t.kicker || "")}</span><span class="t">${esc(t.name)}</span>
          ${last === c.idx ? `<span class="here">вы здесь</span>` : ""}
          ${!owned && c.free ? `<span class="tag">бесплатно</span>` : ""}${open ? "" : `<span class="lock">🔒</span>`}</a></li>`;
      }).join("")}</ul></section>` + foot();
  }

  async function pageRead(id, idx) {
    idx = Number(idx);
    const [b, toc] = await Promise.all([api.book(id), api.toc(id)]);
    if (!b) return pageNotFound();
    const pos = toc.findIndex((c) => c.idx === idx);
    if (pos < 0) return pageNotFound();
    const ch = await api.chapter(id, idx).catch(() => null);
    const prev = toc[pos - 1], next = toc[pos + 1];
    const t = parseTitle(toc[pos].title);
    const theme = store.get("r_theme", "light"), fs = store.get("r_fs", 19);
    document.body.className = "reading";
    let body;
    if (ch && ch.body) {
      store.set("last_" + id, idx);
      body = ch.body.split("\n").filter((p) => p.trim()).map((p, i) =>
        `<p class="${i === 0 ? "first" : ""}${p.trim().startsWith("—") ? " dlg" : ""}">${esc(p)}</p>`).join("");
    } else {
      body = `<div class="paywall"><h3>Продолжение — в полной версии</h3>
        <p>${MANUAL_PAY(id)
          ? (SESSION ? "Нажмите кнопку — откроется WhatsApp с сообщением автору. После оплаты автор откроет вам все главы." : "Зарегистрируйтесь на сайте, затем нажмите «Купить» — откроется WhatsApp с сообщением автору. После оплаты все главы откроются по вашему email.")
          : (SESSION ? "Купите книгу, и все главы откроются сразу после оплаты." : "Войдите или зарегистрируйтесь, чтобы купить книгу. После оплаты все главы откроются сразу.")}</p>
        <button class="btn btn-fire" data-act="buy" data-book="${esc(id)}">Купить за ${esc(b.price_label || "")}</button></div>`;
    }
    const wm = SESSION ? watermark(SESSION.user.email) : "";
    $app.innerHTML = `<div class="progress" id="prog"></div>
      <div class="reader ${theme === "light" ? "" : theme}" id="reader" style="--fs:${fs}px">
        <div class="rbar"><a class="icon-btn" href="#/book/${esc(id)}" title="К содержанию">←</a>
          <div class="ttl">${esc(b.title)}</div>
          <button class="icon-btn" data-act="settings" title="Настройки">Aa</button></div>
        <div class="settings" id="settings" hidden>
          <div class="lbl">Размер текста</div>
          <div class="row"><button data-fs="-1">A−</button><button data-fs="1">A+</button></div>
          <div class="lbl">Фон</div>
          <div class="row">
            <button data-theme="light" class="${theme === "light" ? "on" : ""}"><span class="sw" style="background:#fbf6ee"></span></button>
            <button data-theme="sepia" class="${theme === "sepia" ? "on" : ""}"><span class="sw" style="background:#f1e4cc"></span></button>
            <button data-theme="dark" class="${theme === "dark" ? "on" : ""}"><span class="sw" style="background:#141011"></span></button>
          </div></div>
        <article class="page">${wm ? `<div class="watermark" style="background-image:url('${wm}')"></div>` : ""}
          ${t.kicker ? `<div class="ch-kicker">${esc(t.kicker)}</div>` : `<div class="ch-kicker">&nbsp;</div>`}
          <h1 class="ch-title">${esc(t.name)}</h1><span class="ch-orn">✦ ✦ ✦</span>
          <div class="text">${body}</div>
          <nav class="ch-nav">
            ${prev ? `<a href="#/read/${esc(id)}/${prev.idx}"><small>← Назад</small>${esc(parseTitle(prev.title).name)}</a>` : `<span></span>`}
            ${next ? `<a class="next" href="#/read/${esc(id)}/${next.idx}"><small>Дальше →</small>${esc(parseTitle(next.title).name)}</a>` : `<a class="next" href="#/book/${esc(id)}"><small>Конец книги</small>К содержанию</a>`}
          </nav></article></div>`;
    window.scrollTo(0, 0);
    const prog = document.getElementById("prog");
    window.onscroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      prog.style.width = (h > 0 ? Math.min(100, (scrollY / h) * 100) : 0) + "%";
    };
  }

  function watermark(email) {
    const txt = esc(email);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="220"><text x="10" y="120" transform="rotate(-24 180 110)" font-family="Arial" font-size="15" fill="#000">${txt}</text></svg>`;
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  function pageLogin(next) {
    document.body.className = "";
    let mode = "in";
    const render = () => {
      $app.innerHTML = topbar() + `<div class="panel">
        <h1>${mode === "in" ? "Вход" : "Регистрация"}</h1>
        <p class="lead">${mode === "in" ? "Войдите, чтобы читать купленные книги." : "Создайте аккаунт — на этот email будет открыт доступ к купленным книгам."}</p>
        <div class="tabs"><button data-mode="in" class="${mode === "in" ? "on" : ""}">Вход</button><button data-mode="up" class="${mode === "up" ? "on" : ""}">Регистрация</button></div>
        <form id="f"><label class="field"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
        <label class="field"><span>Пароль${mode === "up" ? " (минимум 6 символов)" : ""}</span><input name="pw" type="password" required minlength="6" autocomplete="${mode === "in" ? "current-password" : "new-password"}"></label>
        <div class="err" id="err"></div>
        <button class="btn btn-fire full" type="submit">${mode === "in" ? "Войти" : "Зарегистрироваться"}</button></form>
        <p class="small" style="margin-top:16px">Забыли пароль или купили книгу на другой email? ${CFG.CONTACT_WHATSAPP ? `<a href="https://wa.me/${esc(CFG.CONTACT_WHATSAPP)}" target="_blank" rel="noopener">Напишите автору</a>` : "Напишите автору"} — поможем.</p></div>` + foot();
      $app.querySelectorAll("[data-mode]").forEach((b) => (b.onclick = () => { mode = b.dataset.mode; render(); }));
      document.getElementById("f").onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target), err = document.getElementById("err");
        const btn = e.target.querySelector("button"); btn.disabled = true; err.textContent = "";
        try {
          if (mode === "in") await api.signIn(fd.get("email"), fd.get("pw"));
          else await api.signUp(fd.get("email"), fd.get("pw"));
          await refreshUser();
          location.hash = next || "#/";
        } catch (ex) {
          const m = String(ex.message || ex);
          err.textContent = /Invalid login/i.test(m) ? "Неверный email или пароль." :
            /already registered|already exists/i.test(m) ? "Такой email уже зарегистрирован — перейдите на вкладку «Вход»." :
            /Password should/i.test(m) ? "Пароль слишком короткий — минимум 6 символов." : "Ошибка: " + m;
          btn.disabled = false;
        }
      };
    };
    render();
  }

  async function pageThanks(id) {
    document.body.className = "";
    $app.innerHTML = topbar() + `<div class="panel"><h1>Спасибо за покупку!</h1>
      <p class="lead" id="msg">Открываем доступ к книге… Обычно это занимает несколько секунд.</p>
      <a class="btn btn-fire full" id="go" href="#/book/${esc(id)}" style="display:none">Читать</a></div>` + foot();
    for (let i = 0; i < 25; i++) {
      await refreshUser();
      if (ACCESS.has(id)) {
        document.getElementById("msg").textContent = "Готово! Книга открыта. Приятного чтения.";
        document.getElementById("go").style.display = "flex"; return;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    document.getElementById("msg").innerHTML = `Оплата прошла, но доступ еще не открылся. Обновите страницу через минуту или ${CFG.CONTACT_WHATSAPP ? `<a href="https://wa.me/${esc(CFG.CONTACT_WHATSAPP)}" target="_blank">напишите автору</a>` : "напишите автору"}.`;
  }

  async function pageAdmin() {
    if (!ADMIN) return pageLogin("#/admin");
    document.body.className = "";
    const [list, books] = await Promise.all([api.accessList(), api.books()]);
    const bookName = (id) => (books.find((b) => b.id === id) || {}).title || id;
    const stripe = list.filter((r) => r.source === "stripe").length;
    $app.innerHTML = topbar() + `<div class="admin"><h1>Админка</h1><p class="small">Вы вошли как ${esc(SESSION.user.email)}</p>
      <div class="card"><div class="stats">
        <div class="stat"><b>${list.length}</b><span>всего доступов</span></div>
        <div class="stat"><b>${stripe}</b><span>оплачено через Stripe</span></div>
        <div class="stat"><b>${list.length - stripe}</b><span>открыто вручную</span></div></div></div>
      <div class="card"><h2>Открыть доступ вручную</h2>
        <p class="small">Например, если человек оплатил переводом или вы дарите книгу.</p>
        <form id="g" class="grid2"><label class="field" style="margin:0"><span>Email читателя</span><input name="email" type="email" required></label>
          <label class="field" style="margin:0"><span>Книга</span><select name="book">${books.map((b) => `<option value="${esc(b.id)}">${esc(b.title)}</option>`).join("")}</select></label>
          <button class="btn btn-fire" type="submit">Открыть</button></form></div>
      <div class="card"><h2>Читатели</h2>${list.length ? `<table class="list"><tr><th>Email</th><th>Книга</th><th>Как</th><th>Дата</th><th></th></tr>
        ${list.map((r) => `<tr><td>${esc(r.email)}</td><td>${esc(bookName(r.book_id))}</td><td><span class="pill">${r.source === "stripe" ? "Stripe" : "вручную"}</span></td>
          <td>${esc(new Date(r.created_at).toLocaleDateString("ru-RU"))}</td>
          <td><button class="btn btn-ghost btn-small" data-act="revoke" data-email="${esc(r.email)}" data-book="${esc(r.book_id)}">Закрыть</button></td></tr>`).join("")}</table>`
        : `<p class="small">Пока никого нет.</p>`}</div>
      <div class="card"><h2>Загрузить или обновить книгу</h2>
        <p class="small">Выберите файл книги (.json), который подготовил Claude. Если книга уже есть — текст обновится.</p>
        <input type="file" id="bookfile" accept=".json,application/json"> <span class="small" id="imp"></span></div></div>` + foot();
    document.getElementById("g").onsubmit = async (e) => {
      e.preventDefault(); const fd = new FormData(e.target);
      try { await api.grant(fd.get("email"), fd.get("book"), "вручную"); toast("Доступ открыт"); pageAdmin(); } catch (ex) { toast("Ошибка: " + ex.message); }
    };
    document.getElementById("bookfile").onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return; const s = document.getElementById("imp");
      try { s.textContent = "Загружаю…"; const json = JSON.parse(await f.text()); await api.importBook(json);
        s.textContent = `Готово: «${json.book.title}», глав: ${json.chapters.length}`; toast("Книга загружена"); }
      catch (ex) { s.textContent = "Ошибка: " + ex.message; }
    };
  }

  function pageNotFound() {
    document.body.className = "";
    $app.innerHTML = topbar() + `<div class="panel"><h1>Страница не найдена</h1><a class="btn btn-fire full" href="#/">На главную</a></div>`;
  }

  /* ================= Покупка ================= */
  async function buy(bookId) {
    if (!SESSION) { toast("Сначала войдите или зарегистрируйтесь"); location.hash = "#/login?next=" + encodeURIComponent("#/book/" + bookId); return; }
    if (DEMO) { api.demoBuy(bookId); toast("Демо: книга «куплена»"); location.hash = "#/thanks/" + bookId; return; }
    const link = (CFG.PAYMENT_LINKS || {})[bookId];
    if (!link) {
      // Оплата напрямую автору: открываем WhatsApp с готовым сообщением
      const b = await api.book(bookId).catch(() => null);
      const msg = `Здравствуйте! Хочу купить книгу «${b ? b.title : bookId}». Мой email на сайте: ${SESSION.user.email}`;
      if (CFG.CONTACT_WHATSAPP) location.href = `https://wa.me/${CFG.CONTACT_WHATSAPP}?text=${encodeURIComponent(msg)}`;
      else toast("Свяжитесь с автором для покупки");
      return;
    }
    const u = new URL(link);
    u.searchParams.set("prefilled_email", SESSION.user.email);
    u.searchParams.set("client_reference_id", bookId + "__" + SESSION.user.id);
    location.href = u.toString();
  }

  /* ================= Маршруты и события ================= */
  async function route() {
    window.onscroll = null;
    const h = location.hash || "#/";
    const [path, query] = h.slice(1).split("?");
    const parts = path.split("/").filter(Boolean);
    const qs = new URLSearchParams(query || "");
    try {
      if (!parts.length) return await pageLibrary();
      if (parts[0] === "book") return await pageBook(parts[1]);
      if (parts[0] === "read") return await pageRead(parts[1], parts[2]);
      if (parts[0] === "login") return pageLogin(qs.get("next"));
      if (parts[0] === "thanks") return await pageThanks(parts[1]);
      if (parts[0] === "admin") return await pageAdmin();
      pageNotFound();
    } catch (e) {
      console.error(e);
      $app.innerHTML = topbar() + `<div class="panel"><h1>Что-то пошло не так</h1><p class="lead">${esc(e.message || e)}</p><a class="btn btn-fire full" href="#/">На главную</a></div>`;
    }
  }

  document.addEventListener("click", async (e) => {
    const a = e.target.closest("[data-act],[data-fs],[data-theme]"); if (!a) return;
    if (a.dataset.act === "logout") { await api.signOut(); await refreshUser(); location.hash = "#/"; route(); }
    else if (a.dataset.act === "buy") buy(a.dataset.book);
    else if (a.dataset.act === "settings") { const s = document.getElementById("settings"); s.hidden = !s.hidden; }
    else if (a.dataset.act === "revoke") {
      if (confirm(`Закрыть доступ для ${a.dataset.email}?`)) { await api.revoke(a.dataset.email, a.dataset.book); toast("Доступ закрыт"); pageAdmin(); }
    } else if (a.dataset.fs) {
      const fs = Math.max(15, Math.min(28, store.get("r_fs", 19) + Number(a.dataset.fs))); store.set("r_fs", fs);
      document.getElementById("reader").style.setProperty("--fs", fs + "px");
    } else if (a.dataset.theme) {
      store.set("r_theme", a.dataset.theme);
      const r = document.getElementById("reader"); r.classList.remove("sepia", "dark");
      if (a.dataset.theme !== "light") r.classList.add(a.dataset.theme);
      document.querySelectorAll("[data-theme]").forEach((x) => x.classList.toggle("on", x === a));
    }
  });

  // Защита текста от копирования
  ["copy", "cut", "contextmenu", "dragstart", "selectstart"].forEach((ev) =>
    document.addEventListener(ev, (e) => { if (e.target.closest && e.target.closest(".reader") && !e.target.closest("input,textarea")) e.preventDefault(); }));
  document.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && ["c", "x", "p", "s", "a", "u"].includes(k) && document.getElementById("reader")) { e.preventDefault(); toast("Копирование и печать недоступны"); }
  });

  // Возврат со страницы оплаты Stripe: ?thanks=<книга>
  const _q = new URLSearchParams(location.search);
  if (_q.get("thanks")) { history.replaceState(null, "", location.pathname + "#/thanks/" + _q.get("thanks")); }

  window.addEventListener("hashchange", route);
  api.onAuth(async () => {});
  refreshUser().then(route);
})();
