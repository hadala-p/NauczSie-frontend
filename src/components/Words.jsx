import React from 'react';

export default function Words({ words = [] }) {
  return (
    <div className="card">
      <h3>Moje słówka</h3>
      {words.length === 0 && <div className="muted">Brak słówek</div>}
      <div className="word-list">
        {words.map(w => (
          <div className="word-item" key={w.id}>
            <div className="pair"><span className="source">{w.source}</span> → <span className="target">{w.target}</span></div>
            <div className="meta">kategoria: {w.category_id} • {new Date(w.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

