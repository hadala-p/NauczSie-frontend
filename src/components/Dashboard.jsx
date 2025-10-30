import React, { useEffect, useState } from 'react';
import LanguageSelector from './LanguageSelector';
import Categories from './Categories';
import Words from './Words';

export default function Dashboard({ api, token }) {
  const [categories, setCategories] = useState([]);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.categories().then(c => { if (mounted) setCategories(c || []); }).catch(() => {});
    if (token) {
      api.me(token).then(r => { if (r.ok) setUser(r.body); }).catch(() => {});
      api.myWords(token).then(r => { if (r.ok) setWords(r.body || []); }).catch(() => {});
    }
    return () => { mounted = false; };
  }, [api, token]);

  async function handleSaveLangs(payload) {
    if (!token) throw new Error('not authenticated');
    const res = await api.updateLangs(token, payload);
    if (res.ok) { setUser(res.body); return res.body; }
    throw new Error(res.body?.detail || 'error');
  }

  async function handleGenerate(categoryId) {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.generate(token, categoryId);
      if (res.ok) {
        setWords(res.body.words || []);
      }
    } finally { setLoading(false); }
  }

  async function refreshWords() {
    if (!token) return;
    const res = await api.myWords(token);
    if (res.ok) setWords(res.body || []);
  }

  return (
    <div className="dashboard">
      <div className="left">
        <LanguageSelector currentUser={user || {}} onSave={handleSaveLangs} />
        <Categories categories={categories} onGenerate={handleGenerate} loading={loading} />
      </div>
      <div className="right">
        <Words words={words} />
        <div className="actions">
          <button onClick={refreshWords}>Odśwież</button>
        </div>
      </div>
    </div>
  );
}
