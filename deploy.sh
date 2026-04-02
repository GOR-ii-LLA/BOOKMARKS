#!/bin/bash

# Синхронизация SKILL.md в Cowork
SKILL_SRC="plugin/skills/SKILL.md"
SKILL_DST="/c/Users/Work/.claude/skills/bookmarks/SKILL.md"

if [ -f "$SKILL_SRC" ]; then
  cp "$SKILL_SRC" "$SKILL_DST"
  echo "✅ SKILL.md синхронизирован"
else
  echo "⚠️  SKILL.md не найден: $SKILL_SRC"
fi

# Деплой
git pull origin main --rebase 2>/dev/null
git add -A
git diff --cached --quiet && echo "Нечего пушить" && exit 0
git commit -m "Update $(date '+%Y-%m-%d %H:%M')"
git push origin main
echo "✅ Готово"
