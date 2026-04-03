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
        <a
          className="entry-link"
          href={`https://${entry.link}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
        >
          {entry.link} →
        </a>
      </div>
      {open && (
        <div className="entry-expand">
          {entry.link && (
            <p className="entry-site">
              <span className="entry-field-label">Официальная страница: </span>
              <a
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
            <p className="entry-site">
              <span className="entry-field-label">GitHub: </span>
              <a
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

          {entry.youtube && entry.youtube.length > 0 && (
            <div className="entry-media-block">
              <span className="entry-media-title">Youtube:</span>
              {entry.youtube.map((item, i) => (
                <a
                  key={i}
                  className="entry-media-link entry-media-link--yt"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                >
                  {item.name}
                </a>
              ))}
            </div>
          )}

          {entry.resources && entry.resources.length > 0 && (
            <div className="entry-media-block">
              <span className="entry-media-title">Ресурсы:</span>
              {entry.resources.map((item, i) => (
                <a
                  key={i}
                  className="entry-media-link entry-media-link--res"
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                >
                  {item.name}
                </a>
              ))}
            </div>
          )}

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
          <div className="entry-dates">
            <span>Дата создания: {entry.created}</span>
            <span>Дата изменения: {entry.updated}</span>
          </div>
        </div>
      )}
    </>
  );
}
