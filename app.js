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

  /* ================= Языки интерфейса ================= */
  const LANGS = ["ru", "en", "bg"];
  const pluralRu = (n, one, few, many) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many; };
  const DICT = {
    ru: {
      locale: "ru-RU", siteName: "Книги Венеры Хасановой", logoSub: "книги", author: "Венера Хасанова",
      admin: "Админка", logout: "Выйти", login: "Войти",
      demo: "Демо-версия: так будет выглядеть сайт. Вход и оплата здесь не настоящие.",
      navBook: "О книге", navAuthor: "Кто я", navReviews: "Отзывы",
      hello: "Здравствуйте, Венера!",
      rights: "Все права защищены. Текст книг защищен от копирования.",
      starsOf: (n) => `${n} из 5`, more: "Подробнее →", books: "Книги", bought: "куплено",
      continueReading: "Продолжить чтение", startReading: "Начать читать", owned: "✓ Книга ваша",
      buyRead: "Купить и читать", readFree: "Читать отрывок бесплатно ↗",
      reviewsN: (n) => `${n} ${pluralRu(n, "отзыв", "отзыва", "отзывов")}`,
      coverAlt: (t) => `Обложка книги «${t}»`, scrollDown: "ЛИСТАЙТЕ ВНИЗ ↓",
      aboutBook: "О книге", aboutTitle: "История, которую нельзя забыть",
      perk1: ["Онлайн", "читайте на телефоне, планшете или компьютере"], perk2: ["Навсегда", "доступ к книге остается у вас"], perk3: ["Закладка", "сайт помнит, где вы остановились"],
      ebook: "Электронная версия", free: "Бесплатно", q: (s) => `«${s}»`,
      noteManual: "Чтобы купить, зарегистрируйтесь и нажмите «Купить» — откроется WhatsApp для связи со мной. После оплаты я открою вам книгу по email.",
      noteAuto: "После оплаты все главы откроются сразу.",
      contents: "Содержание", here: "вы здесь", freeTag: "бесплатно",
      authorEyebrow: "Автор", readersReviews: "Отзывы читателей", whatReaders: "Что говорят читатели",
      noReviews: "Отзывов пока нет — станьте первым, кто поделится впечатлениями.",
      leaveReview: "Оставить отзыв", reviewModeration: "Отзыв появится на сайте после проверки автором.", rating: "Оценка",
      yourName: "Ваше имя *", city: "Город", reviewField: "Отзыв *", reviewPh: "Что вас тронуло, какой момент запомнился…",
      sendReview: "Отправить отзыв", reviewThanks: "Спасибо! Ваш отзыв отправлен и появится после проверки.",
      errName: "Укажите, пожалуйста, имя.", errShort: "Напишите, пожалуйста, хотя бы пару предложений.", errTooSoon: "Вы только что отправили отзыв. Попробуйте чуть позже.", errSend: "Не получилось отправить: ",
      paywallTitle: "Продолжение — в полной версии",
      payManualIn: "Нажмите кнопку — откроется WhatsApp с сообщением автору. После оплаты автор откроет вам все главы.",
      payManualOut: "Зарегистрируйтесь на сайте, затем нажмите «Купить» — откроется WhatsApp с сообщением автору. После оплаты все главы откроются по вашему email.",
      payAutoIn: "Купите книгу, и все главы откроются сразу после оплаты.", payAutoOut: "Войдите или зарегистрируйтесь, чтобы купить книгу. После оплаты все главы откроются сразу.",
      buyFor: (p) => `Купить за ${p}`, toContents: "К содержанию", settings: "Настройки", textSize: "Размер текста", bg: "Фон",
      back: "← Назад", next: "Дальше →", endOfBook: "Конец книги",
      loginTitle: "Вход", signupTitle: "Регистрация", loginLead: "Войдите, чтобы читать купленные книги.", signupLead: "Создайте аккаунт — на этот email будет открыт доступ к купленным книгам.",
      password: "Пароль", pwMin: " (минимум 6 символов)", signupBtn: "Зарегистрироваться",
      forgot: "Забыли пароль или купили книгу на другой email?", writeAuthor: "Напишите автору", weHelp: " — поможем.",
      errLogin: "Неверный email или пароль.", errExists: "Такой email уже зарегистрирован — перейдите на вкладку «Вход».", errPw: "Пароль слишком короткий — минимум 6 символов.", error: "Ошибка: ",
      thanks: "Спасибо за покупку!", opening: "Открываем доступ к книге… Обычно это занимает несколько секунд.", read: "Читать", ready: "Готово! Книга открыта. Приятного чтения.",
      paidNotOpen: (a) => `Оплата прошла, но доступ еще не открылся. Обновите страницу через минуту или ${a}.`, writeAuthorL: "напишите автору",
      notFound: "Страница не найдена", home: "На главную", oops: "Что-то пошло не так",
      buyMsg: (title, price, email) => `Здравствуйте, Венера!\n\nЯ хочу купить книгу «${title}»${price}.\nМой email на сайте: ${email}\n\nПодскажите, пожалуйста, варианты оплаты.\n\nСпасибо!`,
      close: "Закрыть", buying: "Покупка книги", writeToAuthor: "Напишите автору",
      buyLead: "Выберите мессенджер — сообщение уже готово. Венера ответит и подскажет удобный способ оплаты. После оплаты книга откроется по вашему email.",
      writeWa: "Написать в WhatsApp", writeVb: "Написать в Viber",
      vbNote: "Текст скопирован. В открывшемся чате Viber вставьте его: долгое нажатие → «Вставить» (на компьютере — Ctrl+V).",
      loginFirst: "Сначала войдите или зарегистрируйтесь", noCopy: "Копирование и печать недоступны",
    },
    en: {
      locale: "en-GB", siteName: "Books by Venera Khassanova", logoSub: "books", author: "Venera Khassanova",
      admin: "Admin", logout: "Log out", login: "Log in",
      demo: "Demo version: this is how the site will look. Login and payment are not real here.",
      navBook: "The book", navAuthor: "About me", navReviews: "Reviews",
      hello: "Hello, Venera!",
      rights: "All rights reserved. Book texts are protected from copying.",
      starsOf: (n) => `${n} out of 5`, more: "Details →", books: "Books", bought: "purchased",
      continueReading: "Continue reading", startReading: "Start reading", owned: "✓ This book is yours",
      buyRead: "Buy and read", readFree: "Read a free excerpt ↗",
      reviewsN: (n) => `${n} ${n === 1 ? "review" : "reviews"}`,
      coverAlt: (t) => `Cover of “${t}”`, scrollDown: "SCROLL DOWN ↓",
      aboutBook: "About the book", aboutTitle: "A story you won’t forget",
      perk1: ["Online", "read on your phone, tablet or computer"], perk2: ["Forever", "the book stays in your account"], perk3: ["Bookmark", "the site remembers where you stopped"],
      ebook: "E-book", free: "Free", q: (s) => `“${s}”`,
      noteManual: "To buy, sign up and press “Buy” — WhatsApp will open so you can message me. Once you have paid, I will unlock the book for your email.",
      noteAuto: "All chapters open right after payment.",
      contents: "Contents", here: "you are here", freeTag: "free",
      authorEyebrow: "The author", readersReviews: "Reader reviews", whatReaders: "What readers say",
      noReviews: "No reviews yet — be the first to share your impressions.",
      leaveReview: "Leave a review", reviewModeration: "Your review will appear after the author approves it.", rating: "Rating",
      yourName: "Your name *", city: "City", reviewField: "Review *", reviewPh: "What touched you, which moment stayed with you…",
      sendReview: "Send review", reviewThanks: "Thank you! Your review has been sent and will appear after approval.",
      errName: "Please enter your name.", errShort: "Please write at least a couple of sentences.", errTooSoon: "You have just sent a review. Please try again a little later.", errSend: "Could not send: ",
      paywallTitle: "Continue in the full version",
      payManualIn: "Press the button — WhatsApp will open with a message to the author. After payment, the author will unlock all chapters for you.",
      payManualOut: "Sign up on the site, then press “Buy” — WhatsApp will open with a message to the author. After payment, all chapters will open for your email.",
      payAutoIn: "Buy the book and all chapters will open right after payment.", payAutoOut: "Log in or sign up to buy the book. All chapters open right after payment.",
      buyFor: (p) => `Buy for ${p}`, toContents: "To contents", settings: "Settings", textSize: "Text size", bg: "Background",
      back: "← Back", next: "Next →", endOfBook: "End of the book",
      loginTitle: "Log in", signupTitle: "Sign up", loginLead: "Log in to read the books you have bought.", signupLead: "Create an account — the books you buy will be unlocked for this email.",
      password: "Password", pwMin: " (at least 6 characters)", signupBtn: "Sign up",
      forgot: "Forgot your password or bought the book with a different email?", writeAuthor: "Message the author", weHelp: " — we will help.",
      errLogin: "Wrong email or password.", errExists: "This email is already registered — switch to the “Log in” tab.", errPw: "The password is too short — at least 6 characters.", error: "Error: ",
      thanks: "Thank you for your purchase!", opening: "Unlocking the book… This usually takes a few seconds.", read: "Read", ready: "Done! The book is unlocked. Enjoy reading.",
      paidNotOpen: (a) => `The payment went through, but access has not opened yet. Refresh the page in a minute or ${a}.`, writeAuthorL: "message the author",
      notFound: "Page not found", home: "Home", oops: "Something went wrong",
      buyMsg: (title, price, email) => `Hello, Venera!\n\nI would like to buy the book “${title}”${price}.\nMy email on the site: ${email}\n\nCould you please tell me the payment options?\n\nThank you!`,
      close: "Close", buying: "Buying the book", writeToAuthor: "Message the author",
      buyLead: "Choose a messenger — the message is ready. Venera will reply and suggest a convenient way to pay. After payment, the book will open for your email.",
      writeWa: "Message on WhatsApp", writeVb: "Message on Viber",
      vbNote: "The text has been copied. Paste it into the Viber chat that opens: long press → “Paste” (on a computer — Ctrl+V).",
      loginFirst: "Please log in or sign up first", noCopy: "Copying and printing are disabled",
    },
    bg: {
      locale: "bg-BG", siteName: "Книгите на Венера Хасанова", logoSub: "книги", author: "Венера Хасанова",
      admin: "Админ", logout: "Изход", login: "Вход",
      demo: "Демо версия: така ще изглежда сайтът. Входът и плащането тук не са истински.",
      navBook: "За книгата", navAuthor: "За мен", navReviews: "Отзиви",
      hello: "Здравейте, Венера!",
      rights: "Всички права запазени. Текстът на книгите е защитен от копиране.",
      starsOf: (n) => `${n} от 5`, more: "Подробно →", books: "Книги", bought: "закупена",
      continueReading: "Продължи четенето", startReading: "Започни да четеш", owned: "✓ Книгата е ваша",
      buyRead: "Купи и чети", readFree: "Прочети откъс безплатно ↗",
      reviewsN: (n) => `${n} ${n === 1 ? "отзив" : "отзива"}`,
      coverAlt: (t) => `Корица на книгата „${t}“`, scrollDown: "ПРЕВЪРТЕТЕ НАДОЛУ ↓",
      aboutBook: "За книгата", aboutTitle: "История, която не се забравя",
      perk1: ["Онлайн", "четете на телефон, таблет или компютър"], perk2: ["Завинаги", "достъпът до книгата остава при вас"], perk3: ["Отметка", "сайтът помни докъде сте стигнали"],
      ebook: "Електронна версия", free: "Безплатно", q: (s) => `„${s}“`,
      noteManual: "За да купите, регистрирайте се и натиснете „Купи“ — ще се отвори WhatsApp, за да се свържете с мен. След плащането ще отключа книгата за вашия имейл.",
      noteAuto: "След плащането всички глави се отварят веднага.",
      contents: "Съдържание", here: "тук сте", freeTag: "безплатно",
      authorEyebrow: "Авторът", readersReviews: "Отзиви на читатели", whatReaders: "Какво казват читателите",
      noReviews: "Все още няма отзиви — бъдете първият, който ще сподели впечатленията си.",
      leaveReview: "Оставете отзив", reviewModeration: "Отзивът ще се появи на сайта след проверка от автора.", rating: "Оценка",
      yourName: "Вашето име *", city: "Град", reviewField: "Отзив *", reviewPh: "Какво ви докосна, кой момент ви остана в сърцето…",
      sendReview: "Изпрати отзив", reviewThanks: "Благодаря! Отзивът ви е изпратен и ще се появи след проверка.",
      errName: "Моля, напишете името си.", errShort: "Моля, напишете поне няколко изречения.", errTooSoon: "Току-що изпратихте отзив. Опитайте отново малко по-късно.", errSend: "Неуспешно изпращане: ",
      paywallTitle: "Продължението е в пълната версия",
      payManualIn: "Натиснете бутона — ще се отвори WhatsApp със съобщение до автора. След плащането авторът ще ви отключи всички глави.",
      payManualOut: "Регистрирайте се в сайта, след това натиснете „Купи“ — ще се отвори WhatsApp със съобщение до автора. След плащането всички глави ще се отворят за вашия имейл.",
      payAutoIn: "Купете книгата и всички глави ще се отворят веднага след плащането.", payAutoOut: "Влезте или се регистрирайте, за да купите книгата. След плащането всички глави се отварят веднага.",
      buyFor: (p) => `Купи за ${p}`, toContents: "Към съдържанието", settings: "Настройки", textSize: "Размер на текста", bg: "Фон",
      back: "← Назад", next: "Напред →", endOfBook: "Край на книгата",
      loginTitle: "Вход", signupTitle: "Регистрация", loginLead: "Влезте, за да четете закупените книги.", signupLead: "Създайте профил — закупените книги ще се отключат за този имейл.",
      password: "Парола", pwMin: " (поне 6 символа)", signupBtn: "Регистрирай се",
      forgot: "Забравили сте паролата или сте купили книгата с друг имейл?", writeAuthor: "Пишете на автора", weHelp: " — ще помогнем.",
      errLogin: "Грешен имейл или парола.", errExists: "Този имейл вече е регистриран — минете в раздел „Вход“.", errPw: "Паролата е твърде кратка — поне 6 символа.", error: "Грешка: ",
      thanks: "Благодаря за покупката!", opening: "Отключваме книгата… Обикновено отнема няколко секунди.", read: "Чети", ready: "Готово! Книгата е отключена. Приятно четене.",
      paidNotOpen: (a) => `Плащането е минало, но достъпът още не е отворен. Обновете страницата след минута или ${a}.`, writeAuthorL: "пишете на автора",
      notFound: "Страницата не е намерена", home: "Към началото", oops: "Нещо се обърка",
      buyMsg: (title, price, email) => `Здравейте, Венера!\n\nИскам да купя книгата „${title}“${price}.\nМоят имейл в сайта: ${email}\n\nМоля, кажете ми какви са вариантите за плащане.\n\nБлагодаря!`,
      close: "Затвори", buying: "Покупка на книга", writeToAuthor: "Пишете на автора",
      buyLead: "Изберете месинджър — съобщението е готово. Венера ще отговори и ще предложи удобен начин за плащане. След плащането книгата ще се отвори за вашия имейл.",
      writeWa: "Пиши в WhatsApp", writeVb: "Пиши във Viber",
      vbNote: "Текстът е копиран. Поставете го в отворения чат във Viber: задръжте пръст → „Постави“ (на компютър — Ctrl+V).",
      loginFirst: "Първо влезте или се регистрирайте", noCopy: "Копирането и печатът са забранени",
    },
  };
  function detectLang() {
    const saved = store.get("lang", null); if (LANGS.includes(saved)) return saved;
    const n = (navigator.language || "en").slice(0, 2).toLowerCase();
    return n === "bg" ? "bg" : ["ru", "kk", "uk", "be", "ky", "uz"].includes(n) ? "ru" : "en";
  }
  let LANG = detectLang(), L = DICT[LANG];
  function setLang(l) { if (!LANGS.includes(l)) return; LANG = l; L = DICT[l]; store.set("lang", l); applyLangMeta(); route(); }
  function applyLangMeta() { document.documentElement.lang = LANG; document.title = L.siteName; }
  const langSwitch = () => `<div class="lang">${LANGS.map((l) => `<button class="${l === LANG ? "on" : ""}" data-lang="${l}">${l.toUpperCase()}</button>`).join("")}</div>`;
  // Язык книги (по id): книги показываются всем, но на своей странице сортируются первыми
  const bookLang = (b) => b.lang || (/-en$/.test(b.id) ? "en" : /-bg$/.test(b.id) ? "bg" : "ru");

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
      async reviews(book) { return ok(await sb.from("reviews").select("id,name,city,rating,body,created_at").eq("book_id", book).eq("approved", true).order("created_at", { ascending: false })); },
      async addReview(r) { ok(await sb.from("reviews").insert(r)); },
      async allReviews() { return ok(await sb.from("reviews").select("*").order("created_at", { ascending: false })); },
      async setReview(id, approved) { ok(await sb.from("reviews").update({ approved }).eq("id", id)); },
      async delReview(id) { ok(await sb.from("reviews").delete().eq("id", id)); },
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
      async reviews(book) { return store.get("demo_reviews", D.reviews || []).filter((r) => r.approved && r.book_id === book); },
      async addReview(r) { const a = store.get("demo_reviews", D.reviews || []); a.unshift({ ...r, id: String(Date.now()), approved: false, created_at: new Date().toISOString() }); store.set("demo_reviews", a); },
      async allReviews() { return store.get("demo_reviews", D.reviews || []); },
      async setReview(id, approved) { const a = store.get("demo_reviews", D.reviews || []); a.forEach((r) => { if (r.id === id) r.approved = approved; }); store.set("demo_reviews", a); },
      async delReview(id) { store.set("demo_reviews", store.get("demo_reviews", D.reviews || []).filter((r) => r.id !== id)); },
      demoBuy(book) { access.add(book); store.set("demo_access", [...access]); },
    };
  }

  const api = DEMO ? demoApi() : supaApi();
  const MANUAL_PAY = (id) => !DEMO && !((CFG.PAYMENT_LINKS || {})[id]);
  // Книги, которые продаются в другом магазине (Amazon): вместо оплаты — кнопка-ссылка
  const EXT = (id) => (CFG.EXTERNAL_BUY || {})[id];
  const extLabel = (id) => { const l = EXT(id).label; return typeof l === "object" ? (l[LANG] || l.en || "") : l; };
  const buyBtn = (id, cls, text) => EXT(id)
    ? (EXT(id).url
      ? `<a class="${cls}" href="${esc(EXT(id).url)}" target="_blank" rel="noopener">${esc(extLabel(id))}</a>`
      : `<span class="${cls} soon" aria-disabled="true">${esc(extLabel(id))}</span>`)
    : `<button class="${cls}" data-act="buy" data-book="${esc(id)}">${text}</button>`;
  let SESSION = null, ACCESS = new Set(), ADMIN = false, HOME_BOOK = null;

  async function refreshUser() {
    SESSION = await api.session();
    ACCESS = SESSION ? await api.myAccess().catch(() => new Set()) : new Set();
    ADMIN = SESSION ? await api.isAdmin() : false;
  }

  /* ================= Общие элементы ================= */
  const waUrl = (text) => `https://wa.me/${CFG.CONTACT_WHATSAPP}${text ? "?text=" + encodeURIComponent(text) : ""}`;
  const viberUrl = () => `viber://chat?number=${encodeURIComponent("+" + CFG.CONTACT_VIBER)}`;
  const IC = {
    wa: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.27.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c.01-4.54 3.7-8.25 8.25-8.25M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01"/></svg>`,
    vb: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.4 0C9.47.03 5.33.35 3.02 2.47 1.30 4.18.7 6.70.63 9.82c-.06 3.11-.13 8.95 5.5 10.54v2.42s-.04.97.6 1.17c.79.25 1.24-.5 1.99-1.3l1.4-1.58c3.85.32 6.80-.42 7.14-.53.78-.25 5.19-.81 5.91-6.65.74-6.02-.36-9.82-2.34-11.54l-.01-.01C20.22 1.83 17.88.07 12.61.03c0 0-.39-.03-1.03-.02zm.06 1.62c.55 0 .88.01.88.01 4.46.03 6.6 1.36 7.1 1.81 1.64 1.40 2.48 4.77 1.86 9.71-.59 4.78-4.09 5.08-4.74 5.29-.27.09-2.82.72-6.01.51 0 0-2.38 2.87-3.12 3.62-.12.12-.26.17-.35.14-.13-.03-.17-.19-.16-.41l.02-3.92c-4.77-1.32-4.49-6.29-4.44-8.89.06-2.60.55-4.74 2-6.17 1.96-1.77 5.48-2.03 7.06-2.03zm.33 2.51a.39.39 0 0 0 0 .77c1.30.01 2.37.43 3.22 1.25.85.83 1.29 1.95 1.30 3.38a.39.39 0 1 0 .78 0c-.02-1.60-.53-2.93-1.53-3.93-1-.98-2.28-1.47-3.77-1.48zm-3.14.67c-.21-.03-.43.01-.62.13l-.02.01c-.41.24-.79.54-1.12.89-.27.31-.42.63-.46.94a1.2 1.2 0 0 0 .05.54l.01.01c.31.90.7 1.77 1.18 2.59.62 1.12 1.39 2.17 2.28 3.09l.03.04.04.03.03.03.03.03c.93.89 1.97 1.66 3.1 2.29 1.28.70 2.06 1.03 2.53 1.17v.01c.14.04.27.06.40.06.43-.03.84-.21 1.17-.49.35-.33.64-.71.88-1.13v-.01c.23-.42.15-.83-.17-1.10a12.9 12.9 0 0 0-1.68-1.21c-.43-.24-.88-.10-1.06.15l-.39.49c-.20.24-.56.21-.56.21l-.01.01c-2.70-.69-3.42-3.42-3.42-3.42s-.03-.37.22-.56l.48-.39c.23-.19.39-.63.14-1.07a12.4 12.4 0 0 0-1.20-1.68.86.86 0 0 0-.52-.31zm3.42.84a.39.39 0 0 0 0 .78c.89.01 1.56.30 2.04.78.48.49.71 1.13.72 1.99a.39.39 0 1 0 .78-.01c-.01-1.04-.31-1.89-.94-2.53-.62-.64-1.51-.99-2.60-1.01zm.38 1.58a.39.39 0 0 0-.04.78c.68.03 1.03.36 1.07 1.07a.39.39 0 1 0 .78-.04c-.05-1.09-.71-1.77-1.81-1.81z"/></svg>`,
  };
  function topbar(transparent) {
    const user = SESSION
      ? `${ADMIN ? `<a class="nav-a" href="#/admin">${L.admin}</a>` : ""}<button class="nav-a" data-act="logout" title="${esc(SESSION.user.email)}">${L.logout}</button>`
      : `<a class="nav-a" href="#/login">${L.login}</a>`;
    return `${DEMO ? `<div class="demo-banner">${L.demo}</div>` : ""}
      <header class="site-head ${transparent ? "on-hero" : ""}"><a class="logo" href="#/">VENI<span>${L.logoSub}</span></a>
      <nav class="nav"><button class="nav-a hide-m" data-scroll="book">${L.navBook}</button><button class="nav-a hide-m" data-scroll="author">${L.navAuthor}</button>
      <button class="nav-a hide-m" data-scroll="reviews">${L.navReviews}</button>${langSwitch()}${user}</nav></header>`;
  }
  const floating = () => `<div class="fab">
      <a class="fab-b wa" href="${waUrl(L.hello)}" target="_blank" rel="noopener" aria-label="WhatsApp">${IC.wa}</a>
      <a class="fab-b vb" href="${viberUrl()}" aria-label="Viber">${IC.vb}</a></div>`;
  const foot = () => `<footer class="site-foot"><div class="foot-in">
      <div><div class="logo dark">VENI<span>${L.logoSub}</span></div><p class="muted">© ${new Date().getFullYear()} ${L.author}. ${L.rights}</p></div>
      <div class="foot-links"><a href="${waUrl()}" target="_blank" rel="noopener">WhatsApp</a><a href="${viberUrl()}">Viber</a>
      ${CFG.CONTACT_EMAIL ? `<a href="mailto:${esc(CFG.CONTACT_EMAIL)}">${esc(CFG.CONTACT_EMAIL)}</a>` : ""}<a href="https://venihomes.eu/" target="_blank" rel="noopener">venihomes.eu</a></div>
    </div></footer>` + floating();
  const stars = (n) => `<span class="stars" aria-label="${L.starsOf(n)}">${"★".repeat(n)}<i>${"★".repeat(5 - n)}</i></span>`;
  function parseTitle(t) {
    const m = /^((?:Глава|Chapter)\s+\d+)\s*[:.]\s*(.+)$/.exec(t || "");
    return m ? { kicker: m[1], name: m[2] } : { kicker: "", name: t };
  }

  /* ================= Страницы ================= */
  async function pageLibrary() {
    const books = (await api.books()).slice().sort((a, b) => { const w = (x) => (bookLang(x) === LANG ? 0 : bookLang(x) === "ru" ? 1 : 2); return w(a) - w(b) || (a.sort || 0) - (b.sort || 0); });
    HOME_BOOK = books[0] ? books[0].id : null;
    if (books.length === 1) return pageBook(books[0].id);
    document.body.className = "";
    $app.innerHTML = topbar() + `<div class="section"><h2>${L.books}</h2><div class="library">${books.map((b) => `
      <a class="lib-card" href="#/book/${esc(b.id)}"><img src="${esc(b.cover_url)}" alt="${esc(L.coverAlt(b.title))}"><div class="li">
      <div class="lt">${esc(b.title)}</div>
      <div class="ls">${esc(b.subtitle || "")}${ACCESS.has(b.id) ? " · " + L.bought : ""}</div>
      <p class="ld">${esc(String(b.description || "").split("\n")[0])}</p>
      <div class="lp">${ACCESS.has(b.id) ? "" : `<b>${esc(EXT(b.id) ? extLabel(b.id) : b.price_label || "")}</b>`}<span>${L.more}</span></div></div></a>`).join("")}</div></div>` + foot();
  }

  async function pageBook(id) {
    const [b, toc, reviews] = await Promise.all([api.book(id), api.toc(id), api.reviews(id).catch(() => [])]);
    if (!b) return pageNotFound();
    document.body.className = "";
    const owned = ACCESS.has(id) || ADMIN;
    const last = store.get("last_" + id, null);
    const exIdx = (CFG.EXCERPT || {})[id];
    const firstFree = (exIdx != null && toc.find((c) => c.idx === exIdx)) || toc.find((c) => c.free);
    const startIdx = last ?? (toc[0] ? toc[0].idx : 0);
    const paras = String(b.description || "").split("\n").filter(Boolean);
    const freeNames = toc.filter((c) => c.free).map((c) => parseTitle(c.title));
    const A0 = CFG.AUTHOR || {}, A = A0[LANG] || A0.ru || A0;
    const avg = reviews.length ? (reviews.reduce((a, r) => a + (r.rating || 5), 0) / reviews.length) : 0;
    $app.innerHTML = topbar(true) + `
      <section class="hero">
        <div class="hero-bg" style="background-image:url('${esc(b.cover_url)}')"></div><div class="shade"></div>
        <div class="hero-in">
          <div class="hero-text">
            <span class="small">${esc(b.author || "")} · ${esc(b.subtitle || "")}</span>
            <h1>${esc(b.title)}</h1>
            <p class="lead">${esc(paras[0] || "")}</p>
            <div class="cta">${owned
              ? `<a class="primary" href="#/read/${esc(id)}/${startIdx}">${last != null ? L.continueReading : L.startReading}</a><span class="owned">${L.owned}</span>`
              : `${buyBtn(id, "primary", `${L.buyRead} · ${esc(b.price_label || "")}`)}
                 ${firstFree ? `<a class="ghost-l" href="#/read/${esc(id)}/${firstFree.idx}">${L.readFree}</a>` : ""}`}
            </div>
            ${reviews.length ? `<div class="hero-rating">${stars(Math.round(avg))} <span>${avg.toFixed(1)} · ${L.reviewsN(reviews.length)}</span></div>` : ""}
          </div>
          <img class="cover" src="${esc(b.cover_url)}" alt="${esc(L.coverAlt(b.title))}">
        </div>
        <button class="down" data-scroll="book">${L.scrollDown}</button>
      </section>
      <main>
        <section class="block" id="book">
          <div class="two">
            <div><span class="small gold">${L.aboutBook}</span><h2>${L.aboutTitle}</h2>
              ${paras.slice(1).map((p) => `<p class="muted big">${esc(p)}</p>`).join("")}
              <ul class="perks">${[L.perk1, L.perk2, L.perk3].map((p) => `<li><b>${p[0]}</b><span>${p[1]}</span></li>`).join("")}</ul>
              ${owned ? "" : `<div class="buy-box"><div><span class="small">${L.ebook}</span><div class="price">${EXT(id) ? "" : esc(b.price_label || "")}</div></div>
                ${buyBtn(id, "primary", L.buyRead)}</div>
                <p class="note">${freeNames.length ? `${L.free}: ${freeNames.map((t) => esc(t.kicker ? t.kicker + " " + L.q(t.name) : t.name)).join(", ")}. ` : ""}${EXT(id) ? (EXT(id).url ? "" : esc(EXT(id).note ? (EXT(id).note[LANG] || EXT(id).note.en) : "")) : MANUAL_PAY(id) ? L.noteManual : L.noteAuto}</p>`}
            </div>
            <div><span class="small gold">${L.contents}</span>
              <ol class="toc">${toc.map((c) => {
                const t = parseTitle(c.title), open = owned || c.free;
                return `<li class="${open ? "" : "locked"}"><a href="#/read/${esc(id)}/${c.idx}"><span class="num">${esc(t.kicker ? t.kicker.replace(/^(Глава|Chapter)\s+/, "") : "—")}</span>
                  <span class="t">${esc(t.name)}</span>${last === c.idx ? `<span class="here">${L.here}</span>` : ""}
                  ${!owned && c.free ? `<span class="tag">${L.freeTag}</span>` : ""}${open ? "" : `<span class="lock">🔒</span>`}</a></li>`;
              }).join("")}</ol></div>
          </div>
        </section>

        <section class="about" id="author">
          ${(A0.photo || A.photo) ? `<img class="portrait" src="${esc(A0.photo || A.photo)}" alt="${esc(L.author)}">` : ""}
          <div><span class="small gold">${esc(A.eyebrow || L.authorEyebrow)}</span><h2>${esc(A.title || L.author)}</h2>
            ${(A.text || []).map((p) => `<p class="muted">${esc(p)}</p>`).join("")}
            ${(A.facts || []).length ? `<ul class="about-list">${A.facts.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
            <div class="cta"><a class="primary wa-btn" href="${waUrl(L.hello)}" target="_blank" rel="noopener">${IC.wa} WhatsApp</a>
              <a class="primary vb-btn" href="${viberUrl()}">${IC.vb} Viber</a></div>
          </div>
        </section>

        <section class="block" id="reviews">
          <div class="rev-head"><div><span class="small gold">${L.readersReviews}</span><h2>${L.whatReaders}</h2></div>
            ${reviews.length ? `<div class="rev-avg"><b>${avg.toFixed(1)}</b>${stars(Math.round(avg))}<span>${L.reviewsN(reviews.length)}</span></div>` : ""}</div>
          <div class="rev-grid">${reviews.length ? reviews.map((r) => `<article class="rev">${stars(r.rating || 5)}<p>${esc(r.body)}</p>
              <div class="rev-by"><b>${esc(r.name)}</b>${r.city ? ` · ${esc(r.city)}` : ""}<span>${esc(new Date(r.created_at).toLocaleDateString(L.locale, { day: "numeric", month: "long", year: "numeric" }))}</span></div></article>`).join("")
            : `<p class="muted">${L.noReviews}</p>`}</div>
          <form class="rev-form" id="revForm" novalidate>
            <h3>${L.leaveReview}</h3><p class="muted">${L.reviewModeration}</p>
            <div class="rate" role="radiogroup" aria-label="${L.rating}">${[5, 4, 3, 2, 1].map((n) => `<input type="radio" name="rating" id="r${n}" value="${n}" ${n === 5 ? "checked" : ""}><label for="r${n}" title="${n}">★</label>`).join("")}</div>
            <div class="f2"><label class="field"><span>${L.yourName}</span><input name="name" maxlength="60" required></label>
              <label class="field"><span>${L.city}</span><input name="city" maxlength="60"></label></div>
            <label class="field"><span>${L.reviewField}</span><textarea name="body" rows="5" maxlength="2000" required placeholder="${L.reviewPh}"></textarea></label>
            <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
            <div class="err" id="revErr"></div>
            <button class="primary" type="submit">${L.sendReview}</button>
            <p class="form-ok" id="revOk" hidden>${L.reviewThanks}</p>
          </form>
        </section>
      </main>` + foot();
    const f = document.getElementById("revForm");
    f.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(f), err = document.getElementById("revErr"), btn = f.querySelector("button[type=submit]");
      err.textContent = "";
      if (fd.get("website")) return;
      const name = String(fd.get("name") || "").trim(), body = String(fd.get("body") || "").trim();
      if (!name) { err.textContent = L.errName; return; }
      if (body.length < 10) { err.textContent = L.errShort; return; }
      const lastSent = store.get("rev_sent", 0);
      if (Date.now() - lastSent < 60000) { err.textContent = L.errTooSoon; return; }
      btn.disabled = true;
      try {
        await api.addReview({ book_id: id, name, city: String(fd.get("city") || "").trim() || null, rating: Number(fd.get("rating") || 5), body });
        store.set("rev_sent", Date.now());
        f.querySelectorAll(".field,.rate,.f2,button[type=submit]").forEach((x) => (x.style.display = "none"));
        document.getElementById("revOk").hidden = false;
      } catch (ex) { err.textContent = L.errSend + (ex.message || ex); btn.disabled = false; }
    };
  }
  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? few : many;
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
        `<p class="${i === 0 ? "first" : ""}${/^[—“"]/.test(p.trim()) ? " dlg" : ""}">${esc(p).replace(/\*([^*]+)\*/g, "<em>$1</em>")}</p>`).join("");
    } else {
      body = `<div class="paywall"><h3>${L.paywallTitle}</h3>
        ${EXT(id) ? (EXT(id).note ? `<p>${esc(EXT(id).note[LANG] || EXT(id).note.en)}</p>` : "") : `<p>${MANUAL_PAY(id)
          ? (SESSION ? L.payManualIn : L.payManualOut)
          : (SESSION ? L.payAutoIn : L.payAutoOut)}</p>`}
        ${buyBtn(id, "btn btn-fire", esc(L.buyFor(b.price_label || "")))}</div>`;
    }
    const wm = SESSION ? watermark(SESSION.user.email) : "";
    $app.innerHTML = `<div class="progress" id="prog"></div>
      <div class="reader ${theme === "light" ? "" : theme}" id="reader" style="--fs:${fs}px">
        <div class="rbar"><a class="icon-btn" href="#/book/${esc(id)}" title="${L.toContents}">←</a>
          <div class="ttl">${esc(b.title)}</div>
          <button class="icon-btn" data-act="settings" title="${L.settings}">Aa</button></div>
        <div class="settings" id="settings" hidden>
          <div class="lbl">${L.textSize}</div>
          <div class="row"><button data-fs="-1">A−</button><button data-fs="1">A+</button></div>
          <div class="lbl">${L.bg}</div>
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
            ${prev ? `<a href="#/read/${esc(id)}/${prev.idx}"><small>${L.back}</small>${esc(parseTitle(prev.title).name)}</a>` : `<span></span>`}
            ${next ? `<a class="next" href="#/read/${esc(id)}/${next.idx}"><small>${L.next}</small>${esc(parseTitle(next.title).name)}</a>` : `<a class="next" href="#/book/${esc(id)}"><small>${L.endOfBook}</small>${L.toContents}</a>`}
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
        <h1>${mode === "in" ? L.loginTitle : L.signupTitle}</h1>
        <p class="lead">${mode === "in" ? L.loginLead : L.signupLead}</p>
        <div class="tabs"><button data-mode="in" class="${mode === "in" ? "on" : ""}">${L.loginTitle}</button><button data-mode="up" class="${mode === "up" ? "on" : ""}">${L.signupTitle}</button></div>
        <form id="f"><label class="field"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
        <label class="field"><span>${L.password}${mode === "up" ? L.pwMin : ""}</span><input name="pw" type="password" required minlength="6" autocomplete="${mode === "in" ? "current-password" : "new-password"}"></label>
        <div class="err" id="err"></div>
        <button class="btn btn-fire full" type="submit">${mode === "in" ? L.login : L.signupBtn}</button></form>
        <p class="small" style="margin-top:16px">${L.forgot} ${CFG.CONTACT_WHATSAPP ? `<a href="https://wa.me/${esc(CFG.CONTACT_WHATSAPP)}" target="_blank" rel="noopener">${L.writeAuthor}</a>` : L.writeAuthor}${L.weHelp}</p></div>` + foot();
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
          err.textContent = /Invalid login/i.test(m) ? L.errLogin :
            /already registered|already exists/i.test(m) ? L.errExists :
            /Password should/i.test(m) ? L.errPw : L.error + m;
          btn.disabled = false;
        }
      };
    };
    render();
  }

  async function pageThanks(id) {
    document.body.className = "";
    $app.innerHTML = topbar() + `<div class="panel"><h1>${L.thanks}</h1>
      <p class="lead" id="msg">${L.opening}</p>
      <a class="btn btn-fire full" id="go" href="#/book/${esc(id)}" style="display:none">${L.read}</a></div>` + foot();
    for (let i = 0; i < 25; i++) {
      await refreshUser();
      if (ACCESS.has(id)) {
        document.getElementById("msg").textContent = L.ready;
        document.getElementById("go").style.display = "flex"; return;
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    document.getElementById("msg").innerHTML = L.paidNotOpen(CFG.CONTACT_WHATSAPP ? `<a href="https://wa.me/${esc(CFG.CONTACT_WHATSAPP)}" target="_blank">${L.writeAuthorL}</a>` : L.writeAuthorL);
  }

  async function pageAdmin() {
    if (!ADMIN) return pageLogin("#/admin");
    document.body.className = "";
    const [list, books, revs] = await Promise.all([api.accessList(), api.books(), api.allReviews().catch(() => [])]);
    const pending = revs.filter((r) => !r.approved), shown = revs.filter((r) => r.approved);
    const bookName = (id) => (books.find((b) => b.id === id) || {}).title || id;
    const stripe = list.filter((r) => r.source === "stripe").length;
    $app.innerHTML = topbar() + `<div class="admin"><h1>Админка</h1><p class="small">Вы вошли как ${esc(SESSION.user.email)}</p>
      <div class="card"><div class="stats">
        <div class="stat"><b>${list.length}</b><span>всего доступов</span></div>
        <div class="stat"><b>${stripe}</b><span>оплачено через Stripe</span></div>
        <div class="stat"><b>${list.length - stripe}</b><span>открыто вручную</span></div>
        <div class="stat"><b>${pending.length}</b><span>отзывов ждут проверки</span></div></div></div>
      <div class="card"><h2>Открыть доступ вручную</h2>
        <p class="small">Например, если человек оплатил переводом или вы дарите книгу.</p>
        <form id="g" class="grid2"><label class="field" style="margin:0"><span>Email читателя</span><input name="email" type="email" required></label>
          <label class="field" style="margin:0"><span>Книга</span><select name="book">${books.map((b) => `<option value="${esc(b.id)}">${esc(b.title)}</option>`).join("")}</select></label>
          <button class="btn btn-fire" type="submit">Открыть</button></form>
        <div id="sent" class="sent" hidden></div></div>
      <div class="card"><h2>Читатели</h2>${list.length ? `<table class="list"><tr><th>Email</th><th>Книга</th><th>Как</th><th>Дата</th><th></th></tr>
        ${list.map((r) => `<tr><td>${esc(r.email)}</td><td>${esc(bookName(r.book_id))}</td><td><span class="pill">${r.source === "stripe" ? "Stripe" : "вручную"}</span></td>
          <td>${esc(new Date(r.created_at).toLocaleDateString("ru-RU"))}</td>
          <td style="white-space:nowrap"><a class="btn btn-ghost btn-small" title="Отправить письмо" target="_blank" rel="noopener" href="${mailLink(r.email, bookName(r.book_id), r.book_id)}">✉</a>
          <button class="btn btn-ghost btn-small" data-act="revoke" data-email="${esc(r.email)}" data-book="${esc(r.book_id)}">Закрыть</button></td></tr>`).join("")}</table>`
        : `<p class="small">Пока никого нет.</p>`}</div>
      <div class="card" id="mod"><h2>Отзывы на проверке ${pending.length ? `<span class="badge">${pending.length}</span>` : ""}</h2>
        ${pending.length ? pending.map((r) => `<div class="mrev">${stars(r.rating || 5)} <b>${esc(r.name)}</b>${r.city ? " · " + esc(r.city) : ""} <span class="small-d">${esc(new Date(r.created_at).toLocaleString("ru-RU"))}</span>
          <p>${esc(r.body)}</p><button class="btn btn-fire btn-small" data-act="rev-ok" data-id="${esc(r.id)}">Опубликовать</button>
          <button class="btn btn-ghost btn-small" data-act="rev-del" data-id="${esc(r.id)}">Удалить</button></div>`).join("") : `<p class="small">Новых отзывов нет.</p>`}
        ${shown.length ? `<details class="pub"><summary>Опубликованные отзывы (${shown.length})</summary>${shown.map((r) => `<div class="mrev">${stars(r.rating || 5)} <b>${esc(r.name)}</b>
          <p>${esc(r.body)}</p><button class="btn btn-ghost btn-small" data-act="rev-hide" data-id="${esc(r.id)}">Скрыть</button>
          <button class="btn btn-ghost btn-small" data-act="rev-del" data-id="${esc(r.id)}">Удалить</button></div>`).join("")}</details>` : ""}</div>
      <div class="card"><h2>Загрузить или обновить книгу</h2>
        <p class="small">Выберите файл книги (.json), который подготовил Claude. Если книга уже есть — текст обновится.</p>
        <input type="file" id="bookfile" accept=".json,application/json"> <span class="small" id="imp"></span></div></div>` + foot();
    document.getElementById("g").onsubmit = async (e) => {
      e.preventDefault(); const fd = new FormData(e.target);
      const email = String(fd.get("email")).toLowerCase().trim(), book = fd.get("book");
      try {
        await api.grant(email, book, "вручную");
        await pageAdmin();
        const box = document.getElementById("sent");
        box.hidden = false;
        box.innerHTML = `<b>Доступ для ${esc(email)} открыт.</b> Отправьте читателю письмо с инструкцией:
          <a class="btn btn-fire btn-small" target="_blank" rel="noopener" href="${mailLink(email, bookName(book), book)}">✉ Отправить письмо читателю</a>`;
        box.scrollIntoView({ behavior: "smooth", block: "center" });
      } catch (ex) { toast("Ошибка: " + ex.message); }
    };
    document.getElementById("bookfile").onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return; const s = document.getElementById("imp");
      try { s.textContent = "Загружаю…"; const json = JSON.parse(await f.text()); await api.importBook(json);
        s.textContent = `Готово: «${json.book.title}», глав: ${json.chapters.length}`; toast("Книга загружена"); }
      catch (ex) { s.textContent = "Ошибка: " + ex.message; }
    };
  }


  function mailLink(email, bookTitle, bookId) {
    const site = location.origin + location.pathname;
    const wa = CFG.CONTACT_WHATSAPP ? "+" + CFG.CONTACT_WHATSAPP : "";
    const en = /-en$/.test(bookId || ""), bg = /-bg$/.test(bookId || "");
    const subject = en ? `Your access to “${bookTitle}” is open` : bg ? `Достъпът до книгата „${bookTitle}“ е отворен` : `Доступ к книге «${bookTitle}» открыт`;
    const body = bg ? `Здравейте!

Благодаря, че избрахте книгата „${bookTitle}“. Достъпът ви е отворен.

Как да започнете да четете:
1. Отворете сайта: ${site}
2. Натиснете „Вход“ → „Регистрация“ и се регистрирайте с този имейл: ${email}
   (ако вече сте регистрирани, просто влезте).
   Езикът на сайта се сменя горе: RU / EN / BG.
3. Натиснете „Започни да четеш“.

Книгата се чете онлайн от телефон или компютър, а сайтът помни докъде сте стигнали.

Приятно четене! Ако имате въпроси, просто отговорете на този имейл${wa ? " или ми пишете в WhatsApp: " + wa : ""}.

С обич,
Венера Хасанова` : en ? `Hello!

Thank you for choosing “${bookTitle}”. Your access is now open.

How to start reading:
1. Open the site: ${site}
2. Press “Log in” → “Sign up” and register with this email: ${email}
   (if you are already registered, simply log in).
   You can switch the site language at the top: RU / EN / BG.
3. Press “Start reading”.

The book is read online from your phone or computer, and the site remembers where you stopped.

Enjoy reading! If you have any questions, just reply to this email${wa ? " or message me on WhatsApp: " + wa : ""}.

Warmly,
Venera Khassanova` : `Здравствуйте!

Спасибо, что выбрали книгу «${bookTitle}». Доступ для вас открыт.

Как начать читать:
1. Откройте сайт: ${site}
2. Нажмите «Войти» → «Регистрация» и зарегистрируйтесь с этим email: ${email}
   (если вы уже зарегистрированы — просто войдите).
3. Нажмите «Начать читать».

Книга читается онлайн с телефона или компьютера, а сайт запоминает место, где вы остановились.

Приятного чтения! Если будут вопросы — просто ответьте на это письмо${wa ? " или напишите мне в WhatsApp: " + wa : ""}.

С теплом,
Венера Хасанова`;
    return "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(email) +
      "&su=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function pageNotFound() {
    document.body.className = "";
    $app.innerHTML = topbar() + `<div class="panel"><h1>${L.notFound}</h1><a class="btn btn-fire full" href="#/">${L.home}</a></div>`;
  }

  /* ================= Покупка ================= */

  async function buyDialog(bookId) {
    const b = await api.book(bookId).catch(() => null);
    const title = b ? b.title : bookId, price = b && b.price_label ? ` (${b.price_label})` : "";
    const msg = L.buyMsg(title, price, SESSION.user.email);
    const d = document.createElement("div");
    d.className = "modal-wrap";
    d.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
        <button class="m-close" aria-label="${L.close}">✕</button>
        <span class="small gold">${L.buying}</span><h3 id="mTitle">${L.writeToAuthor}</h3>
        <p class="muted">${L.buyLead}</p>
        <pre class="m-msg">${esc(msg)}</pre>
        <div class="m-btns"><a class="primary wa-btn" href="https://wa.me/${esc(CFG.CONTACT_WHATSAPP)}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${IC.wa} ${L.writeWa}</a>
          <button class="primary vb-btn" data-vb>${IC.vb} ${L.writeVb}</button></div>
        <p class="note" id="vbNote" hidden>${L.vbNote}</p>
      </div>`;
    document.body.appendChild(d);
    const close = () => d.remove();
    d.addEventListener("click", (e) => { if (e.target === d || e.target.closest(".m-close")) close(); });
    d.querySelector("[data-vb]").onclick = async () => {
      try { await navigator.clipboard.writeText(msg); } catch (e) {}
      document.getElementById("vbNote").hidden = false;
      setTimeout(() => { location.href = viberUrl(); }, 600);
    };
  }

  async function buy(bookId) {
    if (!SESSION) { toast(L.loginFirst); location.hash = "#/login?next=" + encodeURIComponent("#/book/" + bookId); return; }
    const link = (CFG.PAYMENT_LINKS || {})[bookId];
    if (!link || DEMO) return buyDialog(bookId);
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
      $app.innerHTML = topbar() + `<div class="panel"><h1>${L.oops}</h1><p class="lead">${esc(e.message || e)}</p><a class="btn btn-fire full" href="#/">${L.home}</a></div>`;
    }
  }

  document.addEventListener("click", async (e) => {
    const sc = e.target.closest("[data-scroll]");
    if (sc) {
      const id = sc.dataset.scroll, el = document.getElementById(id);
      if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
      let bookId = HOME_BOOK;
      if (!bookId) { try { const bs = await api.books(); const m = bs.find((b) => bookLang(b) === LANG) || bs[0]; bookId = m && m.id; } catch (x) {} }
      if (bookId) location.hash = "#/book/" + bookId;
      for (let i = 0; i < 40; i++) { await new Promise((r) => setTimeout(r, 100)); const x = document.getElementById(id); if (x) { x.scrollIntoView({ behavior: "smooth" }); break; } }
      return;
    }
    if (sc) { const el = document.getElementById(sc.dataset.scroll); if (el) el.scrollIntoView({ behavior: "smooth" }); else { location.hash = "#/"; setTimeout(() => { const x = document.getElementById(sc.dataset.scroll); if (x) x.scrollIntoView({ behavior: "smooth" }); }, 700); } return; }
    const lb = e.target.closest("[data-lang]"); if (lb) { setLang(lb.dataset.lang); return; }
    const a = e.target.closest("[data-act],[data-fs],[data-theme]"); if (!a) return;
    if (a.dataset.act === "logout") { await api.signOut(); await refreshUser(); location.hash = "#/"; route(); }
    else if (a.dataset.act === "buy") buy(a.dataset.book);
    else if (a.dataset.act === "rev-ok" || a.dataset.act === "rev-hide") { await api.setReview(a.dataset.id, a.dataset.act === "rev-ok"); toast(a.dataset.act === "rev-ok" ? "Отзыв опубликован" : "Отзыв скрыт"); pageAdmin(); }
    else if (a.dataset.act === "rev-del") { if (confirm("Удалить этот отзыв?")) { await api.delReview(a.dataset.id); toast("Отзыв удален"); pageAdmin(); } }
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
    if ((e.ctrlKey || e.metaKey) && ["c", "x", "p", "s", "a", "u"].includes(k) && document.getElementById("reader")) { e.preventDefault(); toast(L.noCopy); }
  });

  // Возврат со страницы оплаты Stripe: ?thanks=<книга>
  const _q = new URLSearchParams(location.search);
  if (_q.get("thanks")) { history.replaceState(null, "", location.pathname + "#/thanks/" + _q.get("thanks")); }

  window.addEventListener("scroll", () => { const h = document.querySelector(".site-head.on-hero"); if (h) h.classList.toggle("solid", scrollY > 60); }, { passive: true });
  window.addEventListener("hashchange", route);
  api.onAuth(async () => {});
  applyLangMeta();
  refreshUser().then(route);
})();
