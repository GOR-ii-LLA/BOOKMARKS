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
          {entry.link && (
            <p className="entry-field">
              <span className="entry-field-label">Официальная страница: </span>
              <a
                className="entry-field-link"
                href={`https://${entry.link}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                {entry.link}
              </a>
            </p>
          )}
          {entry.github && (
            <p className="entry-field">
              <span className="entry-field-label">GitHub: </span>
              <a
                className="entry-field-link"
                href={`https://${entry.github}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                {entry.github}
              </a>
            </p>
          )}
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
          {(entry.created || entry.updated) && (
            <p className="entry-dates">
              {entry.created && <>Создано: {entry.created}</>}
              {entry.created && entry.updated && ' · '}
              {entry.updated && <>Изменено: {entry.updated}</>}
            </p>
          )}
        </div>
      )}
    </>
  );
}
