import { useState, useMemo, useEffect } from 'react';
import { getActiveCategories, getAllEntries, getEntriesForCategory, getEntriesForTag, getAllTags } from './data/entries.js';
import './App.css';

function sortTags(tags) {
  const cyr = tags.filter(t => /^#[а-яё]/i.test(t)).sort((a, b) => a.localeCompare(b, 'ru'));
  const lat = tags.filter(t => !/^#[а-яё]/i.test(t)).sort();
  return [...cyr, ...lat];
}

function CurrencyFlag({ code, size = 16 }) {
  return (
    <img
      src={`https://flagcdn.com/24x18/${code}.png`}
      srcSet={`https://flagcdn.com/48x36/${code}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt=""
      style={{ verticalAlign: 'middle', marginRight: 4, borderRadius: 2 }}
    />
  );
}

function CurrencyBar() {
  const [rates, setRates] = useState({ usd: null, eur: null, cny: null });

  useEffect(() => {
    fetch('https://www.cbr-xml-daily.ru/daily_json.js')
      .then(r => r.json())
      .then(data => {
        setRates({
          usd: data.Valute.USD.Value,
          eur: data.Valute.EUR.Value,
          cny: data.Valute.CNY.Value,
        });
      })
      .catch(() => {});
  }, []);

  const fmt2 = v => v != null ? v.toFixed(2).replace('.', ',') : '—';
  const fmt4 = v => v != null ? v.toFixed(4).replace('.', ',') : '—';
  const cross = rates.eur && rates.usd ? rates.eur / rates.usd : null;

  const today = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <div className="currency-bar">
      <span className="currency-date">{today}</span>
      <span className="currency-sep">|</span>
      <span className="currency-item"><CurrencyFlag code="us" />USD <span className="currency-value">{fmt2(rates.usd)}</span></span>
      <span className="currency-sep">|</span>
      <span className="currency-item"><CurrencyFlag code="eu" />EUR <span className="currency-value">{fmt2(rates.eur)}</span></span>
      <span className="currency-sep">|</span>
      <span className="currency-item"><CurrencyFlag code="cn" />CNY <span className="currency-value">{fmt2(rates.cny)}</span></span>
      <span className="currency-sep">|</span>
      <span className="currency-item"><CurrencyFlag code="eu" /><span style={{margin: '0 1px'}}>/</span><CurrencyFlag code="us" /><span className="currency-value">{fmt4(cross)}</span></span>
    </div>
  );
}

function SparkleIcon({ size = 13, color = '#D97757' }) {
  const c = size / 2;
  const r = size * 0.46;
  const d = size * 0.326;
  const w = size * 0.22;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
         xmlns="http://www.w3.org/2000/svg"
         style={{ display: 'inline-block', verticalAlign: 'middle',
                  marginRight: 6, flexShrink: 0, marginTop: -1 }}>
      <line x1={c} y1={c-r} x2={c} y2={c+r} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <line x1={c-r} y1={c} x2={c+r} y2={c} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <line x1={c-d} y1={c-d} x2={c+d} y2={c+d} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <line x1={c+d} y1={c-d} x2={c-d} y2={c+d} stroke={color} strokeWidth={w} strokeLinecap="round" />
    </svg>
  );
}

function Swatch({ color, name, value, border }) {
  return (
    <div className="uikit-swatch">
      <div className="uikit-dot" style={{ background: color, border: border ? '1px solid var(--border)' : 'none' }} />
      <div className="uikit-dotname">{name}</div>
      <div className="uikit-dotval">{value}</div>
    </div>
  );
}

function UIKitPanel() {
  return (
    <div className="uikit-panel">
      <div className="uikit-title">UI Kit — BOOKMARKS</div>

      <div className="uikit-group">
        <div className="uikit-label">1. Шрифт</div>
        <div className="uikit-row">
          <span style={{ fontSize: 16, fontWeight: 500 }}>Inter — Regular & Medium</span>
        </div>
        <div className="uikit-hint" style={{ marginBottom: 8 }}>Единственный шрифт · wght 400, 500 · Google Fonts</div>
        <div className="uikit-specimen">ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz</div>
        <div className="uikit-specimen">АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ абвгдеёжзийклмнопрстуфхцчшщъыьэюя</div>
        <div className="uikit-specimen">0123456789 !@#$%^&*()—–</div>
      </div>

      <div className="uikit-group">
        <div className="uikit-label">2. Размеры текста</div>
        <div className="uikit-row"><span style={{ fontSize: 20, fontWeight: 500 }}>Логотип — 20px</span><span className="uikit-hint">weight 500</span></div>
        <div className="uikit-row"><span style={{ fontSize: 17, fontWeight: 500 }}>Заголовок тега — 17px</span><span className="uikit-hint">weight 500</span></div>
        <div className="uikit-row"><span style={{ fontSize: 15 }}>Поиск, ввод — 15px</span><span className="uikit-hint">weight 400</span></div>
        <div className="uikit-row"><span style={{ fontSize: 14, fontWeight: 500 }}>Название записи — 14px</span><span className="uikit-hint">weight 500</span></div>
        <div className="uikit-row"><span style={{ fontSize: 14 }}>Кнопка перевода — 14px</span><span className="uikit-hint">weight 400</span></div>
        <div className="uikit-row"><span style={{ fontSize: 13 }}>Табы, описание, валюты — 13px</span><span className="uikit-hint">weight 400</span></div>
        <div className="uikit-row"><span style={{ fontSize: 12 }}>Теги, ссылки — 12px</span><span className="uikit-hint">weight 400</span></div>
        <div className="uikit-row"><span style={{ fontSize: 11, fontWeight: 500 }}>Бейджи, даты, мета — 11px</span><span className="uikit-hint">weight 500</span></div>
      </div>

      <div className="uikit-group">
        <div className="uikit-label">3. Основные цвета</div>
        <div className="uikit-colors">
          <Swatch color="#8a7762" name="bg" value="#8a7762" />
          <Swatch color="#f0ede8" name="surface" value="#f0ede8" border />
          <Swatch color="#3a2e22" name="text" value="#3a2e22" />
          <Swatch color="#8a7762" name="muted" value="#8a7762" />
          <Swatch color="#a09580" name="faint" value="#a09580" />
          <Swatch color="#f7f2eb" name="on-bg" value="#f7f2eb" border />
        </div>
      </div>

      <div className="uikit-group">
        <div className="uikit-label">4. Акцентные цвета</div>
        <div className="uikit-colors">
          <Swatch color="#1D9E75" name="accent" value="#1D9E75" />
          <Swatch color="#0F6E56" name="dark" value="#0F6E56" />
          <Swatch color="#E1F5EE" name="light" value="#E1F5EE" border />
          <Swatch color="#0F6E56" name="text" value="#0F6E56" />
        </div>
      </div>

      <div className="uikit-group">
        <div className="uikit-label">5. Claude цвета</div>
        <div className="uikit-colors">
          <Swatch color="#D97757" name="claude" value="#D97757" />
          <Swatch color="#FAECE7" name="light" value="#FAECE7" border />
          <Swatch color="#993C1D" name="text" value="#993C1D" />
        </div>
      </div>

      <div className="uikit-group">
        <div className="uikit-label">6. YouTube цвета</div>
        <div className="uikit-colors">
          <Swatch color="#cc3333" name="yt" value="#cc3333" />
          <Swatch color="#fdeaea" name="light" value="#fdeaea" border />
          <Swatch color="#a22" name="text" value="#aa2222" />
        </div>
      </div>

      <div className="uikit-group">
        <div className="uikit-label">7. Ресурсы цвета</div>
        <div className="uikit-colors">
          <Swatch color="#5b7fb5" name="res" value="#5b7fb5" />
          <Swatch color="#eaf0f8" name="light" value="#eaf0f8" border />
          <Swatch color="#3a5a8a" name="text" value="#3a5a8a" />
        </div>
      </div>
    </div>
  );
}

function EntryRow({ entry, onTagClick }) {
  const [open, setOpen] = useState(false);
  const sortedTags = useMemo(() => sortTags(entry.tags), [entry.tags]);

  return (
    <>
      <div className={`entry-row ${open ? 'open' : ''}`} onClick={() => setOpen(v => !v)}>
        <div className="entry-meta">
          <span className="entry-name">{entry.name}</span>
          <span className="entry-tags">{sortedTags.join(' · ')}</span>
        </div>
        <a className="entry-link" href={`https://${entry.link}`}
           target="_blank" rel="noopener noreferrer"
           onClick={e => e.stopPropagation()}>
          {entry.link} →
        </a>
      </div>

      {open && (
        <div className="entry-expand">
          {entry.link && (
            <p className="entry-site">
              <span className="entry-field-label">Официальная страница: </span>
              <a href={`https://${entry.link}`} target="_blank" rel="noopener noreferrer"
                 onClick={e => e.stopPropagation()}>{entry.link}</a>
            </p>
          )}
          {entry.github && (
            <p className="entry-site">
              <span className="entry-field-label">GitHub: </span>
              <a href={`https://${entry.github}`} target="_blank" rel="noopener noreferrer"
                 onClick={e => e.stopPropagation()}>{entry.github}</a>
            </p>
          )}
          <p className="entry-desc">{entry.desc}</p>
          {entry.free && <p className="entry-free">{entry.free}</p>}

          {entry.youtube?.length > 0 && (
            <div className="entry-media-block">
              <span className="entry-media-title">Youtube:</span>
              {entry.youtube.map((v, i) => (
                <a key={i} className="entry-media-link entry-media-link--yt"
                   href={v.url} target="_blank" rel="noopener noreferrer"
                   onClick={e => e.stopPropagation()}>{v.name}</a>
              ))}
            </div>
          )}

          {entry.resources?.length > 0 && (
            <div className="entry-media-block">
              <span className="entry-media-title">Ресурсы:</span>
              {entry.resources.map((v, i) => (
                <a key={i} className="entry-media-link entry-media-link--res"
                   href={v.url} target="_blank" rel="noopener noreferrer"
                   onClick={e => e.stopPropagation()}>{v.name}</a>
              ))}
            </div>
          )}

          <div className="entry-expand-tags">
            {sortedTags.map(tag => (
              <button key={tag} className="tag-pill"
                      onClick={e => { e.stopPropagation(); onTagClick(tag); }}>
                {tag}
              </button>
            ))}
          </div>

          <div className="entry-dates">
            <span>Дата создания: {entry.created}</span>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  const [cat, setCat] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [search, setSearch] = useState('');
  const [translateText, setTranslateText] = useState('');
  const [showKit, setShowKit] = useState(false);

  const allTags = useMemo(() => getAllTags(), []);
  const cats = getActiveCategories();
  const row1 = cats.filter(c => c.row === 1);
  const row2 = cats.filter(c => c.row === 2);

  const filtered = useMemo(() => {
    if (activeTag) return getEntriesForTag(activeTag);
    const list = cat ? getEntriesForCategory(cat) : getAllEntries();
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q)) ||
      e.desc.toLowerCase().includes(q)
    );
  }, [cat, activeTag, search]);

  function selectCat(id) { setCat(id); setActiveTag(null); setSearch(''); }
  function selectTag(tag) { setActiveTag(tag); setCat(null); setSearch(''); }

  const searchInput = (
    <input className="search" type="text" placeholder="Поиск..."
           value={search} onChange={e => setSearch(e.target.value)} />
  );

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="logo">B<span className="logo-o">OO</span>KMARKS<span className="count-badge">{getAllEntries().length}</span></div>
          <button className="uikit-btn" onClick={() => setShowKit(v => !v)}>
            UI Kit
          </button>
        </header>

        {showKit && <UIKitPanel />}

        <CurrencyBar />

        <div className="translate-bar">
          <input
            className="translate-input"
            type="text"
            placeholder="Введите текст для перевода..."
            value={translateText}
            onChange={e => setTranslateText(e.target.value)}
          />
          <button
            className="translate-btn"
            onClick={() => {
              const url = translateText.trim()
                ? `https://translate.yandex.ru/?text=${encodeURIComponent(translateText)}`
                : 'https://translate.yandex.ru/';
              window.open(url, '_blank');
            }}
          >
            Перевести в Яндексе
          </button>
        </div>

        <div className="search-mobile">
          {searchInput}
        </div>

        <div className="cat-tabs-wrap">
          <div className="cat-tabs">
            {row1.map(c => (
              <button key={c.id}
                className={`cat-tab ${c.special ? 'cat-tab--special' : ''} ${cat === c.id && !activeTag ? 'active' : ''}`}
                onClick={() => selectCat(c.id)}>
                {c.special ? <SparkleIcon size={13} color={cat === c.id && !activeTag ? '#fff' : '#D97757'} /> : ''}
                {c.label}<span className="count-badge">{getEntriesForCategory(c.id).length}</span>
              </button>
            ))}
          </div>
          <div className="cat-tabs">
            {row2.map(c => (
              <button key={c.id}
                className={`cat-tab ${cat === c.id && !activeTag ? 'active' : ''}`}
                onClick={() => selectCat(c.id)}>
                {c.label}<span className="count-badge">{getEntriesForCategory(c.id).length}</span>
              </button>
            ))}
            <button
              className={`tag-pill ${activeTag === '#frontend' ? 'active' : ''}`}
              onClick={() => selectTag('#frontend')}>
              #frontend
            </button>
          </div>
        </div>

        <div className="tag-bar">
          {allTags.filter(t => t !== '#frontend').map(t => (
            <button key={t} className={`tag-pill ${activeTag === t ? 'active' : ''}`}
                    onClick={() => selectTag(t)}>{t}</button>
          ))}
        </div>

        <div className="search-desktop">
          {searchInput}
        </div>

        {activeTag && <div className="tag-page-title">{activeTag}</div>}

        <div className="entry-list">
          {filtered.length === 0
            ? <div className="empty">Пока пусто</div>
            : filtered.map(e => <EntryRow key={e.name} entry={e} onTagClick={selectTag} />)
          }
        </div>
      </div>
    </div>
  );
}

export default App;
