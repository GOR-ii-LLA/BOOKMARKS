export const entries = [
  {
    "category": "Claude",
    "name": "v2rayN",
    "link": "",
    "github": "github.com/2dust/v2rayN",
    "desc": "v2rayN — это бесплатная программа с графическим интерфейсом для Windows, Linux и macOS, которая позволяет обходить интернет-блокировки через прокси-протоколы, работая поверх движков Xray, sing-box или mihomo.\nОна поддерживает множество протоколов — VMess, VLESS, Shadowsocks, Trojan, WireGuard, Hysteria2 — это как набор разных «туннелей»: если один заблокирован, можно переключиться на другой, и провайдер не поймёт, что вы делаете в сети.\nПодписки на серверы обновляются по ссылке одним кликом — достаточно вставить URL от провайдера и нажать «обновить», и список серверов подтягивается автоматически; не нужно вручную добавлять каждый сервер.\nv2rayN не является AI-инструментом и не интегрируется с Claude напрямую, однако может быть полезен для стабильного доступа к claude.ai и API из регионов с блокировками — как прокси-слой перед любыми запросами к Anthropic.\nПрограмма активно развивается (версия 7.19.5, обновление март 2026, 78 тыс. звёзд на GitHub), но интерфейс по умолчанию на китайском — нужно вручную переключить язык в меню; начинающим пользователям настройка может показаться нетривиальной.",
    "free": "Полностью бесплатная и открытая (GPLv3) — никаких платных планов, весь функционал доступен сразу.",
    "tags": [
      "#free",
      "#proxy",
      "#vpn"
    ],
    "created": "2026-04-02",
    "updated": "2026-04-02"
  }
];

export const CATEGORIES = [
  { id: 'Claude',     label: 'Claude',     special: true },
  { id: 'аптечка',    label: 'Аптечка'    },
  { id: 'программы',  label: 'Программы'  },
  { id: 'товары',     label: 'Товары'     },
  { id: 'чердак',     label: 'Чердак'     },
];

export function getActiveCategories() {
  return CATEGORIES;
}

export function getEntriesForCategory(catId) {
  if (catId === 'Claude') {
    return entries.filter(e => e.category === 'Claude').sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }
  return entries.filter(e => e.category === catId).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export function getEntriesForTag(tag) {
  return entries.filter(e => e.tags.includes(tag)).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export function getAllTags() {
  const tagSet = new Set();
  entries.forEach(e => e.tags.forEach(t => tagSet.add(t)));
  const tags = Array.from(tagSet);
  const ru = tags.filter(t => /^#[а-яё]/i.test(t)).sort((a, b) => a.localeCompare(b, 'ru'));
  const en = tags.filter(t => !/^#[а-яё]/i.test(t)).sort();
  return [...ru, ...en];
}
