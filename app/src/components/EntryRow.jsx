import { useState, useMemo } from 'react';

function sortTags(tags) {
  const ru = tags.filter(t => /^#[а-яё]/i.test(t)).sort((a, b) => a.localeCompare(b, 'ru'));
  const en = tags.filter(t => !/^#[а-яё]/i.test(t)).sort();
  return [...ru, ...en];
}

export default function EntryRow({ entry, onTagClick }) {
  const [open, setOpen] = useState(false);
  const sorted = useMemo(() => sortTags(entry.tags), [entry.tags]);

  return (
    <>
      <div
        className={`entry-row ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <div className="entry-meta">
          <span className="entry-name">{entry.name}</span>
          <span className="entry-tags">
            {sorted.join(' · ')}
          </span>
        </div>
        {entry.link && (
          <a
            className="entry-link"
            href={`https://${entry.link}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            {entry.link} →
          </a>
        )}
      </div>
      {open && (
        <div className="entry-expand">
          <p className="entry-field">
            <span className="entry-field-label">Официальная страница: </span>
            {entry.link ? (
              <a
                className="entry-field-link"
                href={`https://${entry.link}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                {entry.link}
              </a>
            ) : null}
          </p>
          <p className="entry-field">
            <span className="entry-field-label">GitHub: </span>
            {entry.github ? (
              <a
                className="entry-field-link"
                href={`https://${entry.github}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                {entry.github}
              </a>
            ) : null}
          </p>
          <p className="entry-desc">{entry.desc}</p>
          {entry.free && <p className="entry-free">{entry.free}</p>}
          <div className="entry-expand-tags">
            {sorted.map(tag => (
              <button
                key={tag}
                className="tag-pill"
                onClick={e => { e.stopPropagation(); onTagClick(tag); }}
              >
                {tag}
              </button>
            ))}
          </div>
          {entry.created && (
            <p className="entry-dates">Дата создания: {entry.created}</p>
          )}
          {entry.updated && (
            <p className="entry-dates">Дата изменения: {entry.updated}</p>
          )}
        </div>
      )}
    </>
  );
}
