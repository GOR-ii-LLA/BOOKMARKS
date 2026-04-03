export const entries = [
  {
    "category": "Claude",
    "name": "Claude Code",
    "link": "code.claude.com/docs/en/overview",
    "github": "github.com/anthropics/claude-code",
    "desc": "Claude Code — это AI-помощник для программирования, который работает прямо в терминале, понимает весь твой проект и помогает писать код, исправлять ошибки и автоматизировать рутину через обычные команды на человеческом языке.\nНапример, можно просто написать «добавь тесты для модуля авторизации, запусти их и исправь ошибки» — и Claude Code сам найдёт нужные файлы, напишет код, запустит и починит, как опытный напарник-разработчик.\nClaude Code работает не только в терминале — есть расширения для VS Code, JetBrains, десктоп-приложение и веб-версия на claude.ai/code, так что можно пользоваться из любого удобного места.\nЧерез протокол MCP можно подключить внешние инструменты — Google Drive, Jira, Slack — и Claude Code будет работать с ними напрямую, например читать техзадание из Google Docs и сразу писать код по нему.\nClaude Code не входит в бесплатный план — нужна подписка Pro ($20/мес) или выше; на репозитории 65 000+ звёзд, проект активно развивается Anthropic.",
    "youtube": [],
    "resources": [],
    "free": "Нет, требуется подписка Claude Pro ($20/мес) или выше. Код проекта открыт на GitHub.",
    "tags": [
      "#разработка",
      "#code",
      "#vibecode"
    ],
    "created": "2026-04-03",
    "updated": "2026-04-03"
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
