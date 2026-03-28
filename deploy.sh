#!/bin/bash
git pull origin main --rebase 2>/dev/null
git add -A
git diff --cached --quiet && echo "Нечего пушить" && exit 0
git commit -m "Update $(date '+%Y-%m-%d %H:%M')"
git push origin main
echo "✅ Готово"
