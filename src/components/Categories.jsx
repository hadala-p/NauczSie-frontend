import React from 'react';

export default function Categories({ categories = [], onGenerate, loading = false }) {
  return (
    <div className="card">
      <h3>Kategorie</h3>
      <div className="cat-list">
        {categories.length === 0 && <div className="muted">Brak kategorii</div>}
        {categories.map((c) => (
          <div key={c.id} className="cat-item">
            <div className="cat-main">
              <strong>{c.name}</strong>
              <div className="muted small">{c.description}</div>
            </div>
            <div className="cat-actions">
              <button onClick={() => onGenerate(c.id)} disabled={loading}>Generuj 10</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

