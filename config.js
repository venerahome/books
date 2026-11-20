// Настройки читалки. Эти значения безопасно хранить на сайте (это публичные ключи).
window.READER_CONFIG = {
  // Из Supabase → Project Settings → API (или Connect)
  SUPABASE_URL: "https://gndyliwmckymeaxtliks.supabase.co",
  SUPABASE_KEY: "sb_publishable_9X7YASJwLCTr7Q1nMgnA9w_Kn7E_Hru",

  // Ссылки на оплату Stripe (Payment Links) для каждой книги
  PAYMENT_LINKS: {
    "phoenix-1": ""        // например "https://buy.stripe.com/xxxxxxxx"
  },

  // Контакт для вопросов и оплаты вручную
  CONTACT_WHATSAPP: "359882593077",
  SITE_NAME: "Книги Венеры Хасановой"
};
