export const entries = [
  {
    "name": "Notion",
    "category": "claude",
    "icon": "✦",
    "link": "notion.com",
    "tags": [
      "#продуктивность",
      "#инструменты",
      "#база-знаний",
      "#заметки",
      "#задачи"
    ],
    "desc": "Notion — это рабочее пространство «всё в одном»: заметки, задачи, базы данных и вики живут в одном месте вместо десятка разных приложений. Всё строится из блоков — текст, таблица, список, картинка — их можно свободно перетаскивать и комбинировать как конструктор. Подходит студентам, командам и фрилансерам, которые хотят собрать свою систему с нуля под себя. Notion AI (встроен) помогает писать, резюмировать заметки, переводить и генерировать структуру — работает прямо внутри документа. Главный минус — крутая кривая обучения: новички часто теряются в гибкости и тратят больше времени на настройку, чем на работу.",
    "extra": "Бесплатно: базовые страницы и блоки, до 10 гостей, ограниченный доступ к Notion AI (20 запросов в месяц)",
    "note": "",
    "id": 1
  }
];

export const CATEGORIES = [
  { id: 'claude',      label: 'Claude',     icon: null, special: true },
  { id: 'бады',        label: 'БАДы',       icon: '🌿' },
  { id: 'идеи',        label: 'Идеи',       icon: '💡' },
  { id: 'лекарства',   label: 'Лекарства',  icon: '💊' },
  { id: 'программы',   label: 'Программы',  icon: '💻' },
  { id: 'товары',      label: 'Товары',     icon: '📦' },
];

export function getActiveCategories() {
  const usedCats = new Set(entries.map(e => e.category));
  return CATEGORIES.filter(c => c.special || usedCats.has(c.id));
}

export function getEntriesForCategory(catId) {
  if (catId === 'claude') {
    return entries.filter(e => e.category === 'claude').sort((a, b) => a.name.localeCompare(b.name, 'ru'));
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
