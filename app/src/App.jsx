import { useState, useMemo } from 'react';
import EntryRow from './components/EntryRow';
import ClaudeIcon from './components/ClaudeIcon';
import { CATEGORIES, getAllTags, getActiveCategories, getEntriesForCategory, getEntriesForTag } from './data/entries';
import './App.css';

export default function App() {
  const [dark, setDark] = useState(false);
  const [activeCat, setActiveCat] = useState('claude');
  const [activeTag, setActiveTag] = useState(null);
  const [search, setSearch] = useState('');

  const tags = useMemo(() => getAllTags(), []);

  const currentEntries = useMemo(() => {
    const pool = activeTag
      ? getEntriesForTag(activeTag)
      : getEntriesForCategory(activeCat);

    if (!search.trim()) return pool;
    const q = search.toLowerCase();
    return pool.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q)) ||
      e.desc.toLowerCase().includes(q)
    );
  }, [activeCat, activeTag, search]);

  function handleCatClick(catId) {
    setActiveCat(catId);
    setActiveTag(null);
    setSearch('');
  }

  function handleTagClick(tag) {
    setActiveTag(tag);
    setSearch('');
  }

  return (
    <div className={`app ${dark ? 'dark' : ''}`}>
      <div className="container">

        {/* Header */}
        <header className="header">
          <div className="logo">
            B<span className="logo-o">O</span>OK
          </div>
          <button className="theme-btn" onClick={() => setDark(d => !d)}>
            {dark ? '☀ светлая' : '◑ тёмная'}
          </button>
        </header>

        {/* Search */}
        <input
          className="search"
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {/* Category tabs */}
        <div className="cat-tabs">
          {getActiveCategories().map(cat => (
            <button
              key={cat.id}
              className={`cat-tab ${cat.special ? 'cat-tab--special' : ''} ${activeCat === cat.id && !activeTag ? 'active' : ''}`}
              onClick={() => handleCatClick(cat.id)}
            >
              {cat.special ? <ClaudeIcon size={13} /> : cat.icon ? `${cat.icon} ` : ''}{cat.label}
            </button>
          ))}
        </div>

        {/* Tag bar */}
        <div className="tag-bar">
          {tags.map(tag => (
            <button
              key={tag}
              className={`tag-pill ${activeTag === tag ? 'active' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Page title when tag active */}
        {activeTag && (
          <div className="tag-page-title">{activeTag}</div>
        )}

        {/* Entries list */}
        <div className="entry-list">
          {currentEntries.length === 0 ? (
            <div className="empty">Пока пусто</div>
          ) : (
            currentEntries.map(entry => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onTagClick={handleTagClick}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
