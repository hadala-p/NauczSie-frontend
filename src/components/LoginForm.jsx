import React, { useState } from 'react';

export default function LoginForm({ api, onLogin, defaultUsername = '' }) {
  const [username, setUsername] = useState(defaultUsername);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await api.login({ username, password });
    setLoading(false);
    if (!res.ok) {
      setError(res.body?.detail || 'Błąd logowania');
      return;
    }
    onLogin(res.body.access_token);
  }

  return (
    <div className="card form-card">
      <h3>Logowanie</h3>
      <form onSubmit={submit}>
        <label>Username<input value={username} onChange={e => setUsername(e.target.value)} /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
        <div className="form-actions">
          <button type="submit" disabled={loading}>{loading ? 'Logowanie...' : 'Zaloguj'}</button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

