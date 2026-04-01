export const entries = [];

export const CATEGORIES = [
  { id: 'claude',      label: 'Claude',     icon: null, special: true },
  { id: 'аптечка',     label: 'Аптечка',    icon: '💊' },
  { id: 'программы',   label: 'Программы',  icon: '💻' },
  { id: 'товары',      label: 'Товары',     icon: '📦' },
  { id: 'чердак',      label: 'Чердак',     icon: '📥' },
];

export function getActiveCategories() {
  return CATEGORIES;
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
