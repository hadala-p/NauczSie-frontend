import React, { useState } from 'react';

export default function LanguageSelector({ currentUser, onSave }) {
  const [nativeLang, setNativeLang] = useState(currentUser?.native_lang || 'pl');
  const [targetLang, setTargetLang] = useState(currentUser?.target_lang || 'en');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function save() {
    setLoading(true); setMsg('');
    try {
      await onSave({ native_lang: nativeLang, target_lang: targetLang });
      setMsg('Zapisano');
    } catch (e) {
      setMsg('Błąd zapisu');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3>Języki</h3>
      <label>Ojczysty<input value={nativeLang} onChange={e => setNativeLang(e.target.value)} /></label>
      <label>Docelowy<input value={targetLang} onChange={e => setTargetLang(e.target.value)} /></label>
      <div className="form-actions">
        <button onClick={save} disabled={loading}>{loading ? 'Zapis...' : 'Zapisz języki'}</button>
      </div>
      {msg && <div className="muted">{msg}</div>}
    </div>
  );
}

