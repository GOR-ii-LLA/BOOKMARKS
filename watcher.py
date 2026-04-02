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
from datetime import datetime, date

# ── Настройки ──────────────────────────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
VAULT_DIR    = SCRIPT_DIR / "vault"
INBOX_DIR    = VAULT_DIR / "inbox"
ENTRIES_FILE = SCRIPT_DIR / "app" / "src" / "data" / "entries.js"
POLL_SECONDS = 10

# ── Категории ──────────────────────────────────────────────────────────────────
CATEGORY_IDS = {
    "программа":  "программы",
    "лекарство":  "лекарства",
    "бад":        "бады",
    "товар":      "товары",
    "идея":       "идеи",
    "claude":     "Claude",
    "клод":       "Claude",
}

# ── Поля, после которых начинается новый ключ ─────────────────────────────────
KNOWN_FIELDS = [
    "категория", "официальная страница", "github", "подробнее",
    "бесплатная версия", "бесплатно", "теги", "дата создания", "дата изменения",
]

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

# ── Парсинг .md файла ──────────────────────────────────────────────────────────
def parse_md(path: Path) -> dict | None:
    text = path.read_text(encoding="utf-8")
    lines = text.strip().splitlines()

    def field(key):
        """Однострочное поле: возвращает текст после 'Ключ:'"""
        for line in lines:
            if line.lower().startswith(key.lower() + ":"):
                return line[len(key)+1:].strip()
        return ""

    def multiline_field(key):
        """Многострочное поле: собирает все строки от 'Ключ:' до следующего известного поля."""
        result_lines = []
        collecting = False
        for line in lines:
            # Если встретили наш ключ — начинаем собирать
            if line.lower().startswith(key.lower() + ":"):
                first_part = line[len(key)+1:].strip()
                if first_part:
                    result_lines.append(first_part)
                collecting = True
                continue
            # Если собираем и встретили другой известный ключ — стоп
            if collecting:
                is_new_field = False
                for f in KNOWN_FIELDS:
                    if line.lower().startswith(f + ":"):
                        is_new_field = True
                        break
                if is_new_field:
                    break
                # Пропускаем пустые строки, добавляем непустые
                stripped = line.strip()
                if stripped:
                    result_lines.append(stripped)
        return "\n".join(result_lines)

    name = lines[0].lstrip("#").strip() if lines else path.stem
    category_raw = field("Категория").lower().strip(". ")
    desc = multiline_field("Подробнее")
    link_raw = field("Официальная страница")
    link = re.sub(r"https?://(www\.)?", "", link_raw).rstrip("/")
    github_raw = field("GitHub")
    github = re.sub(r"https?://(www\.)?", "", github_raw).rstrip("/")
    free = field("Бесплатная версия") or field("Бесплатно")
    tags_raw = field("Теги")
    created = field("Дата создания") or str(date.today())
    updated = field("Дата изменения") or str(date.today())

    # Normalize category
    cat_id = None
    for key in CATEGORY_IDS:
        if key in category_raw:
            cat_id = CATEGORY_IDS[key]
            break
    if not cat_id:
        log(f"  ⚠ Неизвестная категория '{category_raw}' в {path.name}, пропускаю")
        return None

    # Tags: split by comma or space, add # prefix
    tags = []
    for t in re.split(r"[,،]\s*", tags_raw):
        t = t.strip().lower()
        if t:
            tags.append("#" + t.replace(" ", "-"))

    return {
        "category": cat_id,
        "name":     name,
        "link":     link,
        "github":   github,
        "desc":     desc,
        "free":     free,
        "tags":     tags,
        "created":  created,
        "updated":  updated,
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
    entries_json = json.dumps(entries, ensure_ascii=False, indent=2)

    template = ENTRIES_FILE.read_text(encoding="utf-8")
    # Find the position of the entries array and replace it directly
    start_marker = "export const entries = "
    start_idx = template.find(start_marker)
    if start_idx == -1:
        return
    # Find the closing "];" after the start
    bracket_start = template.find("[", start_idx)
    depth = 0
    end_idx = bracket_start
    for i in range(bracket_start, len(template)):
        if template[i] == "[":
            depth += 1
        elif template[i] == "]":
            depth -= 1
            if depth == 0:
                end_idx = i
                break
    # Skip the ";" after "]"
    if end_idx + 1 < len(template) and template[end_idx + 1] == ";":
        end_idx += 1

    new_text = template[:start_idx] + f"export const entries = {entries_json};" + template[end_idx + 1:]
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
            # Обновляем существующую запись
            entries = [e for e in entries if e["name"].lower() != entry["name"].lower()]
            log(f"  ♻ Обновляю: {entry['name']}")
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
