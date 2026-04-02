export const entries = [
  {
    "category": "Claude",
    "name": "v2rayN",
    "link": "",
    "github": "github.com/2dust/v2rayN",
    "desc": "v2rayN — это бесплатная программа с графическим интерфейсом для Windows, Linux и macOS, которая позволяет обходить интернет-блокировки через прокси-протоколы, работая поверх движков Xray, sing-box или mihomo.",
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
