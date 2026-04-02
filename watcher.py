#!/usr/bin/env python3
"""
BOOKMARKS Watcher — следит за vault/, парсит новые .md файлы и обновляет entries.js
Запуск: python watcher.py
"""

import os
import re
import json
import time
import subprocess
from pathlib import Path
from datetime import datetime

# ── Настройки ──────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
VAULT_DIR    = SCRIPT_DIR / "vault"
INBOX_DIR    = VAULT_DIR / "inbox"
ENTRIES_FILE = SCRIPT_DIR / "app" / "src" / "data" / "entries.js"
GIT_TOKEN    = None  # токен хранится в git config
GIT_REMOTE   = None  # токен хранится в git config, не здесь
POLL_SECONDS = 10

# ── Иконки категорий ───────────────────────────────────────────────────────────
CATEGORY_ICONS = {
    "программа":  "💻",
    "лекарство":  "💊",
    "бад":        "🌿",
    "товар":      "📦",
    "идея":       "💡",
    "claude":     "✦",
    "клод":       "✦",
}

CATEGORY_IDS = {
    "программа":  "программы",
    "лекарство":  "лекарства",
    "бад":        "бады",
    "товар":      "товары",
    "идея":       "идеи",
    "claude":     "claude",
    "клод":       "claude",
}

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

# ── Парсинг .md файла ──────────────────────────────────────────────────────────
def parse_md(path: Path) -> dict | None:
    text = path.read_text(encoding="utf-8")
    lines = text.strip().splitlines()

    def field(key):
        for line in lines:
            if line.lower().startswith(key.lower() + ":"):
                return line[len(key)+1:].strip()
        return ""

    name = lines[0].lstrip("#").strip() if lines else path.stem
    category_raw = field("Категория").lower().strip(". ")
    desc = field("Подробнее")
    link_raw = field("Официальная страница")
    link = re.sub(r"https?://(www\.)?", "", link_raw).rstrip("/")
    free = field("Бесплатная версия") or field("Бесплатно")
    paid = field("Платная версия") or field("Платный план")
    tags_raw = field("Теги")
    note = field("Аналоги") or field("Альтернативы")

    # Normalize category
    cat_id = None
    for key in CATEGORY_IDS:
        if key in category_raw:
            cat_id = CATEGORY_IDS[key]
            break
    if not cat_id:
        log(f"  ⚠ Неизвестная категория '{category_raw}' в {path.name}, пропускаю")
        return None

    icon = CATEGORY_ICONS.get(category_raw.split()[0], "📌")

    # Tags: split by comma or space, add # prefix
    tags = []
    for t in re.split(r"[,،]\s*", tags_raw):
        t = t.strip().lower()
        if t:
            tags.append("#" + t.replace(" ", "-"))

    # Extra info
    extra_parts = []
    if free:
        extra_parts.append(f"Бесплатно: {free}")
    if paid:
        extra_parts.append(f"Платно: {paid}")
    extra = " · ".join(extra_parts) if extra_parts else ""

    return {
        "name":     name,
        "category": cat_id,
        "icon":     icon,
        "link":     link,
        "tags":     tags,
        "desc":     desc,
        "extra":    extra,
        "note":     f"Альтернативы: {note}" if note else "",
    }

# ── Чтение текущего entries.js ─────────────────────────────────────────────────
def read_entries() -> list[dict]:
    text = ENTRIES_FILE.read_text(encoding="utf-8")
    match = re.search(r"export const entries = (\[.*?\]);", text, re.DOTALL)
    if not match:
        return []
    try:
        return json.loads(match.group(1))
    except Exception:
        return []

# ── Запись entries.js ──────────────────────────────────────────────────────────
def write_entries(entries: list[dict]):
    # Assign IDs
    for i, e in enumerate(entries):
        e["id"] = i + 1

    entries_json = json.dumps(entries, ensure_ascii=False, indent=2)

    template = ENTRIES_FILE.read_text(encoding="utf-8")
    # Replace only the entries array
    new_text = re.sub(
        r"export const entries = \[.*?\];",
        f"export const entries = {entries_json};",
        template,
        flags=re.DOTALL
    )
    ENTRIES_FILE.write_text(new_text, encoding="utf-8")

# ── Git push ───────────────────────────────────────────────────────────────────
def git_push(names: list[str]):
    cwd = str(SCRIPT_DIR)
    def run(cmd):
        return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)

    run(["git", "add", str(ENTRIES_FILE)])
    msg = "Add: " + ", ".join(names)
    result = run(["git", "commit", "-m", msg])
    if "nothing to commit" in result.stdout:
        log("  Git: нечего коммитить")
        return
    push = run(["git", "push", "origin", "main"])
    if push.returncode == 0:
        log(f"  ✅ Запушено: {msg}")
    else:
        log(f"  ❌ Ошибка пуша: {push.stderr}")

# ── Обработка новых файлов ─────────────────────────────────────────────────────
def process_inbox():
    if not INBOX_DIR.exists():
        return

    md_files = list(INBOX_DIR.glob("*.md"))
    if not md_files:
        return

    entries = read_entries()
    existing_names = {e["name"].lower() for e in entries}
    added = []

    for md_file in sorted(md_files):
        log(f"Обрабатываю: {md_file.name}")
        entry = parse_md(md_file)
        if not entry:
            continue
        if entry["name"].lower() in existing_names:
            log(f"  Уже есть: {entry['name']}, пропускаю")
            md_file.rename(VAULT_DIR / md_file.name)
            continue

        entries.append(entry)
        existing_names.add(entry["name"].lower())
        added.append(entry["name"])
        log(f"  ✅ Добавлено: {entry['name']} [{entry['category']}]")

        # Move from inbox to vault
        md_file.rename(VAULT_DIR / md_file.name)

    if added:
        write_entries(entries)
        log(f"entries.js обновлён ({len(entries)} записей)")
        git_push(added)

# ── Главный цикл ───────────────────────────────────────────────────────────────
def main():
    log("BOOKMARKS Watcher запущен")
    log(f"Слежу за: {INBOX_DIR}")
    log(f"Интервал: {POLL_SECONDS} сек")
    log("Ctrl+C для остановки")
    print()

    INBOX_DIR.mkdir(parents=True, exist_ok=True)

    while True:
        try:
            process_inbox()
        except Exception as e:
            log(f"Ошибка: {e}")
        time.sleep(POLL_SECONDS)

if __name__ == "__main__":
    main()
