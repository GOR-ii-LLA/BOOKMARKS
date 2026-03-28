import { useState } from 'react';

export default function EntryRow({ entry, onTagClick }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className={`entry-row ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="entry-icon">{entry.icon}</span>
        <div className="entry-meta">
          <span className="entry-name">{entry.name}</span>
          <span className="entry-tags">
            {entry.tags.join(' · ')}
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
          <p className="entry-desc">{entry.desc}</p>
          {entry.extra && <p className="entry-extra">{entry.extra}</p>}
          {entry.note && <p className="entry-note">{entry.note}</p>}
          <div className="entry-expand-tags">
            {entry.tags.map(tag => (
              <button
                key={tag}
                className="tag-pill"
                onClick={e => { e.stopPropagation(); onTagClick(tag); }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
