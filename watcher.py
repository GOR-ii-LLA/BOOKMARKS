#!/usr/bin/env python3
"""
BOOKMARKS Watcher — пересобирает entries.js из всех .md файлов в vault/
Новые файлы кладутся в vault/inbox/, watcher перемещает их в vault/.
При каждом цикле entries.js генерируется заново из vault/.
Запуск: python watcher.py
"""

import re
import json
import time
import shutil
import hashlib
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
    "программы":  "программы",
    "лекарство":  "аптечка",
    "лекарства":  "аптечка",
    "аптечка":    "аптечка",
    "бад":        "аптечка",
    "бады":       "аптечка",
    "товар":      "товары",
    "товары":     "товары",
    "идея":       "чердак",
    "идеи":       "чердак",
    "чердак":     "чердак",
    "claude":     "Claude",
    "клод":       "Claude",
    "vibecode":   "Vibecode",
    "вайбкод":    "Vibecode",
    "ai":         "AI",
    "ии":         "AI",
}

# ── Поля, которые watcher распознаёт (в нижнем регистре) ───────────────────────
KNOWN_FIELDS = [
    "категория", "официальная страница", "github", "подробнее",
    "youtube", "ресурсы", "бесплатная версия", "бесплатно",
    "теги", "дата создания",
]

# Файлы с ошибками — логируем warning только один раз
_warned_files = set()

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

# ── Безопасное перемещение файла ───────────────────────────────────────────────
def safe_move(src: Path, dst: Path):
    """Перемещает файл из src в dst. Если dst существует — перезаписывает."""
    try:
        if dst.exists():
            dst.unlink()
        src.rename(dst)
    except Exception:
        shutil.copy2(str(src), str(dst))
        src.unlink()

# ── Парсинг списка name|url ────────────────────────────────────────────────────
def parse_media_list(raw: str) -> list[dict]:
    """Парсит 'название1 | ссылка1, название2 | ссылка2' в список {name, url}"""
    items = []
    if not raw.strip():
        return items
    for part in raw.split(","):
        part = part.strip()
        if "|" in part:
            name, url = part.split("|", 1)
            name = name.strip()
            url = url.strip()
            if name and url:
                items.append({"name": name, "url": url})
    return items

# ── Парсинг .md файла ──────────────────────────────────────────────────────────
def parse_md(path: Path) -> dict | None:
    text = path.read_text(encoding="utf-8")
    lines = text.strip().splitlines()

    name = lines[0].lstrip("#").strip() if lines else path.stem

    # Парсим поля с поддержкой многострочных значений
    fields = {}
    current_key = None
    current_lines = []

    for line in lines[1:]:
        matched_field = None
        for f in KNOWN_FIELDS:
            if line.lower().startswith(f + ":"):
                matched_field = f
                break

        if matched_field:
            if current_key:
                fields[current_key] = "\n".join(current_lines).strip()
            current_key = matched_field
            value_after_colon = line[len(matched_field) + 1:].strip()
            current_lines = [value_after_colon] if value_after_colon else []
        elif current_key:
            current_lines.append(line)

    if current_key:
        fields[current_key] = "\n".join(current_lines).strip()

    def field(key):
        return fields.get(key.lower(), "")

    category_raw = field("Категория").lower().strip(". ")
    desc = field("Подробнее")
    link_raw = field("Официальная страница")
    link = re.sub(r"https?://(www\.)?", "", link_raw).rstrip("/")
    github_raw = field("GitHub")
    github = re.sub(r"https?://(www\.)?", "", github_raw).rstrip("/")
    free = field("Бесплатная версия") or field("Бесплатно")
    tags_raw = field("Теги")
    created = field("Дата создания") or str(date.today())

    youtube = parse_media_list(field("Youtube"))
    resources = parse_media_list(field("Ресурсы"))

    # Normalize category
    cat_id = None
    for key in CATEGORY_IDS:
        if key in category_raw:
            cat_id = CATEGORY_IDS[key]
            break
    if not cat_id:
        if path.name not in _warned_files:
            log(f"  ⚠ Неизвестная категория '{category_raw}' в {path.name}, пропускаю")
            _warned_files.add(path.name)
        return None

    # Tags
    tags = []
    for t in re.split(r"[,،]\s*", tags_raw):
        t = t.strip().lower()
        if t:
            if not t.startswith("#"):
                t = "#" + t
            tags.append(t.replace(" ", "-"))

    return {
        "category": cat_id,
        "name":     name,
        "link":     link,
        "github":   github,
        "desc":     desc,
        "youtube":  youtube,
        "resources": resources,
        "free":     free,
        "tags":     tags,
        "created":  created,
    }

# ── Запись entries.js ──────────────────────────────────────────────────────────
def write_entries(entries: list[dict]):
    entries_json = json.dumps(entries, ensure_ascii=False, indent=2)
    entries_block = f"export const entries = {entries_json};"

    template = ENTRIES_FILE.read_text(encoding="utf-8")
    new_text = re.sub(
        r"export const entries = \[.*?\];",
        lambda m: entries_block,
        template,
        flags=re.DOTALL
    )
    ENTRIES_FILE.write_text(new_text, encoding="utf-8")

# ── Хеш entries для сравнения ──────────────────────────────────────────────────
def entries_hash(entries: list[dict]) -> str:
    """Возвращает хеш списка записей для сравнения."""
    return hashlib.md5(json.dumps(entries, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

# ── Git push ───────────────────────────────────────────────────────────────────
def git_push(msg: str):
    cwd = str(SCRIPT_DIR)
    def run(cmd):
        return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)

    run(["git", "add", str(ENTRIES_FILE)])
    result = run(["git", "commit", "-m", msg])
    if "nothing to commit" in result.stdout:
        return
    push = run(["git", "push", "origin", "main"])
    if push.returncode == 0:
        log(f"  ✅ Запушено: {msg}")
    else:
        log(f"  ❌ Ошибка пуша: {push.stderr}")

# ── Перемещение новых файлов из inbox в vault ──────────────────────────────────
def process_inbox():
    """Перемещает .md файлы из inbox в vault."""
    if not INBOX_DIR.exists():
        return []

    moved = []
    for md_file in sorted(INBOX_DIR.glob("*.md")):
        try:
            dst = VAULT_DIR / md_file.name
            log(f"Новый файл: {md_file.name}")
            safe_move(md_file, dst)
            moved.append(md_file.name)
        except Exception as e:
            log(f"  ❌ Ошибка перемещения {md_file.name}: {e}")

    return moved

# ── Сборка entries.js из всех .md в vault ─────────────────────────────────────
def rebuild_entries() -> list[dict]:
    """Парсит все .md файлы в vault и возвращает список записей."""
    entries = []
    for md_file in sorted(VAULT_DIR.glob("*.md")):
        try:
            entry = parse_md(md_file)
            if entry:
                entries.append(entry)
        except Exception as e:
            log(f"  ❌ Ошибка парсинга {md_file.name}: {e}")
    return entries

# ── Главный цикл ───────────────────────────────────────────────────────────────
def main():
    log("BOOKMARKS Watcher запущен")
    log(f"Слежу за: {VAULT_DIR}")
    log(f"Inbox: {INBOX_DIR}")
    log(f"Интервал: {POLL_SECONDS} сек")
    log("Ctrl+C для остановки")
    print()

    INBOX_DIR.mkdir(parents=True, exist_ok=True)

    # Хеш текущего состояния для сравнения
    prev_hash = ""

    while True:
        try:
            # 1. Перемещаем новые файлы из inbox в vault
            moved = process_inbox()

            # 2. Пересобираем entries из всех .md в vault
            entries = rebuild_entries()

            # 3. Сравниваем с предыдущим состоянием
            new_hash = entries_hash(entries)

            if new_hash != prev_hash:
                write_entries(entries)
                prev_hash = new_hash
                names = [e["name"] for e in entries]
                log(f"entries.js обновлён ({len(entries)} записей: {', '.join(names)})")

                # 4. Git push
                if moved:
                    git_push(f"Add: {', '.join(moved)}")
                else:
                    git_push("Update entries")

        except Exception as e:
            log(f"Ошибка: {e}")

        time.sleep(POLL_SECONDS)

if __name__ == "__main__":
    main()
