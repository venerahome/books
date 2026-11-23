// Настройки читалки. Эти значения безопасно хранить на сайте (это публичные ключи).
window.READER_CONFIG = {
  // Из Supabase → Project Settings → API Keys
  SUPABASE_URL: "https://gndyliwmckymeaxtliks.supabase.co",
  SUPABASE_KEY: "sb_publishable_9X7YASJwLCTr7Q1nMgnA9w_Kn7E_Hru",

  // Ссылки на оплату Stripe (Payment Links). Пусто = покупка через WhatsApp автору
  PAYMENT_LINKS: {
    "phoenix-1": "",
    "phoenix-1-en": "",
    "phoenix-1-bg": ""
  },

  // Какую главу открывает кнопка «Читать отрывок бесплатно» (номер главы)
  // Книги, которые покупают в другом магазине: вместо кнопки оплаты — ссылка
  EXTERNAL_BUY: {
    // Английская версия пока не продаётся. Когда появится ссылка на Amazon, замените этот блок на:
    // "phoenix-1-en": { label: "Buy on Amazon", url: "https://www.amazon.com/dp/B0HSPDJBRV" }
    "phoenix-1-en": {
      label: { en: "Coming soon", ru: "Скоро в продаже", bg: "Очаквайте скоро" },
      note: {
        en: "The English edition is being prepared and is not on sale yet. Meanwhile, enjoy the free excerpt.",
        ru: "Английская версия готовится к выходу и пока не продаётся. А пока читайте бесплатный отрывок.",
        bg: "Английското издание се подготвя и все още не се продава. Междувременно прочетете безплатния откъс."
      }
    }
  },

  EXCERPT: {
    "phoenix-1": 6,
    "phoenix-1-en": 6,
    "phoenix-1-bg": 6
  },

  // Контакты (номер без +)
  CONTACT_WHATSAPP: "359882593077",
  CONTACT_VIBER: "359882593077",
  CONTACT_EMAIL: "khassanovav@gmail.com",
  SITE_NAME: "Книги Венеры Хасановой",

  // Язык сайта выбирается кнопками RU / EN / BG вверху. Все книги видны на любом языке.

  // Раздел «Кто я» — можно менять текст прямо здесь
  AUTHOR: {
    photo: "https://venihomes.eu/assets/venera.jpg",
    ru: {
      eyebrow: "Автор",
      title: "Меня зовут Венера Хасанова",
      text: [
        "Я из Казахстана. В 2013 году переехала в Болгарию с тремя маленькими детьми и начала всё с нуля.",
        "Создала первую в Болгарии школу неформального образования — за восемь лет она выросла до 34 офисов по всей стране. По образованию я магистр трудовой и организационной психологии.",
        "Я автор многих методик на болгарском языке: ментальная арифметика, скорочтение, основы предпринимательства для подростков, волшебные сказки и другие.",
        "Сегодня живу между Болгарией и Грецией, работаю в недвижимости, рисую и веду YouTube-канал. «Огонь под кожей Феникса» — моя первая автобиографическая книга: о девушке из Казахстана, о девяностых и о силе, которая помогает подниматься после каждого падения."
      ],
      facts: [
        "Из Казахстана, с 2013 года — в Болгарии",
        "Основатель сети из 34 школ неформального образования",
        "Автор методик по ментальной арифметике, скорочтению и предпринимательству для подростков",
        "Магистр организационной психологии",
        "Business Lady Awards 2020"
      ]
    },
    en: {
      eyebrow: "The author",
      title: "My name is Venera Khassanova",
      text: [
        "I am from Kazakhstan. In 2013 I moved to Bulgaria with three small children and started everything from scratch.",
        "I founded the first non-formal education school in Bulgaria — in eight years it grew to 34 offices across the country. I hold a master’s degree in work and organizational psychology.",
        "I am the author of many teaching methods in Bulgarian: mental arithmetic, speed reading, entrepreneurship basics for teenagers, magical fairy tales and more.",
        "Today I live between Bulgaria and Greece, work in real estate, paint and run a YouTube channel. Fire Under the Phoenix’s Skin is my first autobiographical book — about a girl from Kazakhstan, about the nineties, and about the strength that helps you rise after every fall."
      ],
      facts: [
        "From Kazakhstan, living in Bulgaria since 2013",
        "Founder of a network of 34 non-formal education schools",
        "Author of methods in mental arithmetic, speed reading and entrepreneurship for teenagers",
        "Master’s degree in organizational psychology",
        "Business Lady Awards 2020"
      ]
    },
    bg: {
      eyebrow: "Авторът",
      title: "Казвам се Венера Хасанова",
      text: [
        "Родом съм от Казахстан. През 2013 г. се преместих в България с три малки деца и започнах всичко от нулата.",
        "Създадох първото в България училище за неформално образование — за осем години то се разрасна до 34 офиса в цялата страна. Магистър съм по трудова и организационна психология.",
        "Автор съм на много методики на български език: ментална аритметика, бързо четене, основи на предприемачеството за тийнейджъри, вълшебни приказки и други.",
        "Днес живея между България и Гърция, работя в сферата на недвижимите имоти, рисувам и водя YouTube канал. „Огън под кожата на Феникса“ е първата ми автобиографична книга — за едно момиче от Казахстан, за деветдесетте години и за силата, която помага да се изправиш след всяко падане."
      ],
      facts: [
        "От Казахстан, от 2013 г. — в България",
        "Основател на мрежа от 34 училища за неформално образование",
        "Автор на методики по ментална аритметика, бързо четене и предприемачество за тийнейджъри",
        "Магистър по организационна психология",
        "Business Lady Awards 2020"
      ]
    }
  }
};
