export const entries = [
  {
    id: 1,
    name: 'Cursor',
    category: 'программы',
    icon: '💻',
    link: 'cursor.com',
    tags: ['#ai', '#claude', '#код', '#продуктивность'],
    desc: 'AI-редактор кода на базе VS Code. Понимает контекст всего проекта, пишет и рефакторит код по описанию на русском и английском.',
    extra: 'Бесплатный триал 14 дней, платный план — $20/мес.',
    note: 'Альтернативы: GitHub Copilot, Windsurf',
  },
  {
    id: 2,
    name: 'Figma',
    category: 'программы',
    icon: '💻',
    link: 'figma.com',
    tags: ['#бесплатно', '#дизайн'],
    desc: 'Браузерный редактор для UI/UX-дизайна и прототипирования. Поддерживает совместную работу в реальном времени.',
    extra: 'Бесплатный план — 3 проекта. Платный — от $15/мес.',
    note: 'Альтернативы: Sketch, Penpot',
  },
  {
    id: 3,
    name: 'Notion',
    category: 'программы',
    icon: '💻',
    link: 'notion.so',
    tags: ['#бесплатно', '#продуктивность'],
    desc: 'Всё-в-одном для заметок, баз данных и управления проектами. Гибкие блоки, шаблоны, встроенный AI.',
    extra: 'Бесплатный план — безлимитные страницы. Платный — от $10/мес.',
    note: 'Альтернативы: Obsidian, Coda',
  },
  {
    id: 4,
    name: 'Claude',
    category: 'программы',
    icon: '💻',
    link: 'claude.ai',
    tags: ['#ai', '#claude', '#продуктивность'],
    desc: 'AI-ассистент от Anthropic. Отлично справляется с анализом текста, кодом, исследованиями и длинными диалогами.',
    extra: 'Бесплатный план доступен. Pro — $20/мес.',
    note: 'Альтернативы: ChatGPT, Gemini',
  },
  {
    id: 5,
    name: 'Глицин',
    category: 'лекарства',
    icon: '💊',
    link: 'pharmstd.ru',
    tags: ['#здоровье', '#ноотроп', '#сон'],
    desc: 'Аминокислота с мягким ноотропным действием. Улучшает сон, снижает тревожность, улучшает концентрацию.',
    extra: '0.1 г под язык 2–3 раза в день. Курс — 30 дней.',
    note: '⚠️ Проконсультируйтесь с врачом',
  },
];

export const CATEGORIES = [
  { id: 'claude',      label: 'Claude',     icon: null, special: true },
  { id: 'бады',        label: 'БАДы',       icon: '🌿' },
  { id: 'идеи',        label: 'Идеи',       icon: '💡' },
  { id: 'лекарства',   label: 'Лекарства',  icon: '💊' },
  { id: 'программы',   label: 'Программы',  icon: '💻' },
  { id: 'товары',      label: 'Товары',     icon: '📦' },
];

export function getEntriesForCategory(catId) {
  if (catId === 'claude') {
    return entries.filter(e => e.tags.includes('#claude')).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
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
