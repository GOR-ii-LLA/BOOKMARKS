import { useState, useMemo } from 'react';
import { getActiveCategories, getAllEntries, getEntriesForCategory, getEntriesForTag, getAllTags } from './data/entries.js';
import './App.css';

function sortTags(tags) {
  const cyr = tags.filter(t => /^#[а-яё]/i.test(t)).sort((a, b) => a.localeCompare(b, 'ru'));
  const lat = tags.filter(t => !/^#[а-яё]/i.test(t)).sort();
  return [...cyr, ...lat];
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
  const [dark, setDark] = useState(false);
  const [cat, setCat] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [search, setSearch] = useState('');

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

  return (
    <div className={`app ${dark ? 'dark' : ''}`}>
      <div className="container">
        <header className="header">
          <div className="logo">B<span className="logo-o">OO</span>KMARKS<span className="count-badge">{getAllEntries().length}</span></div>
          <button className="theme-btn" onClick={() => setDark(v => !v)}>
            {dark ? '☀ светлая' : '◑ тёмная'}
          </button>
        </header>

        <input className="search" type="text" placeholder="Поиск..."
               value={search} onChange={e => setSearch(e.target.value)} />

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
