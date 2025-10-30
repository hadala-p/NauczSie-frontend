import React, { useState } from 'react';

export default function RegisterForm({ api, onRegistered, defaultNative = 'pl', defaultTarget = 'en' }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nativeLang, setNativeLang] = useState(defaultNative);
  const [targetLang, setTargetLang] = useState(defaultTarget);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const res = await api.register({ username, password, email, native_lang: nativeLang, target_lang: targetLang });
    setLoading(false);
    if (!res.ok) {
      setError(res.body?.detail || 'Rejestracja nie powiodła się');
      return;
    }
    setSuccess('Zarejestrowano — możesz się zalogować');
    onRegistered && onRegistered();
  }

  return (
    <div className="card form-card">
      <h3>Rejestracja</h3>
      <form onSubmit={submit}>
        <label>Username<input value={username} onChange={e => setUsername(e.target.value)} /></label>
        <label>Email<input value={email} onChange={e => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <label>Native<input value={nativeLang} onChange={e => setNativeLang(e.target.value)} /></label>
        <label>Target<input value={targetLang} onChange={e => setTargetLang(e.target.value)} /></label>
        <div className="form-actions"><button type="submit" disabled={loading}>{loading ? 'Przetwarzanie...' : 'Zarejestruj'}</button></div>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </form>
    </div>
  );
}

