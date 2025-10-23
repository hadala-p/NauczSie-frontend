import React, { useEffect, useState, useMemo } from 'react';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import { Api } from './lib/api';
import './styles.css';

function App() {
  const defaultApiUrl = import.meta?.env?.VITE_API_URL || 'http://127.0.0.1:8000';
  const [apiUrl, setApiUrl] = useState(defaultApiUrl.replace(/\/$/, ''));
  const api = useMemo(() => Api(apiUrl), [apiUrl]);

  const [view, setView] = useState('home');
  const [token, setToken] = useState(() => localStorage.getItem('nauczsie_token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nauczsie_openai_key') || '');

  useEffect(() => {
    if (!token) { setCurrentUser(null); return; }
    api.me(token).then(r => { if (r.ok) setCurrentUser(r.body); else { setCurrentUser(null); setToken(''); localStorage.removeItem('nauczsie_token'); } }).catch(() => { setCurrentUser(null); });
  }, [token, api]);

  function handleNav(to) { setView(to); }

  function handleLogout() {
    if (token) api.logout(token).catch(() => {});
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('nauczsie_token');
    setView('home');
  }

  function handleLogin(tok) {
    setToken(tok);
    localStorage.setItem('nauczsie_token', tok);
    setView('dashboard');
  }

  function handleRegistered() {
    setView('login');
    setMessage('Zarejestrowano. Możesz się zalogować.');
    setTimeout(() => setMessage(''), 4000);
  }

  function handleApiKeyChange(v) {
    setApiKey(v);
    try { localStorage.setItem('nauczsie_openai_key', v); } catch (e) { /* ignore */ }
  }

  function clearApiKey() {
    setApiKey('');
    try { localStorage.removeItem('nauczsie_openai_key'); } catch (e) { /* ignore */ }
  }

  return (
    <div className="app-root">
      <Header currentUser={currentUser} onNav={handleNav} onLogout={handleLogout} />
      <main className="container">
        <aside className="left-panel">
          <div className="panel card">
            <label>API URL</label>
            <input value={apiUrl} onChange={e => setApiUrl(e.target.value)} />
            <div className="muted small">Ustaw URL backendu (domyślnie http://127.0.0.1:8000)</div>
          </div>

          <div className="panel card">
            <label>OpenAI API Key</label>
            <input value={apiKey} onChange={e => handleApiKeyChange(e.target.value)} placeholder="wklej swój klucz API" />
            <div style={{ marginTop: 8 }}>
              <button onClick={() => navigator.clipboard?.writeText(apiKey).catch(() => {})} disabled={!apiKey}>Kopiuj</button>
              <button onClick={clearApiKey} style={{ marginLeft: 8 }} disabled={!apiKey}>Wyczyść</button>
            </div>
            <div className="muted small">Klucz będzie przechowywany w localStorage i wysyłany do backendu przy generowaniu.</div>
          </div>
        </aside>

        <section className="content">
          {message && <div className="toast">{message}</div>}

          {view === 'home' && (
            <div className="grid">
              <div className="card big">
                <h2>Witaj w NauczSie!</h2>
                <p>Prosty MVP — rejestracja, logowanie, wybór języków, kategorie i generowanie 10 słówek.</p>
                <div className="cta">
                  <button onClick={() => setView('register')}>Zarejestruj</button>
                  <button onClick={() => setView('login')}>Zaloguj</button>
                </div>
              </div>
              <div className="card small muted">
                <h4>Co dalej?</h4>
                <ul>
                  <li>Po rejestracji/zalekowaniu przejdź do Dashboard</li>
                  <li>Wybierz kategorię i wygeneruj słówka</li>
                </ul>
              </div>
            </div>
          )}

          {view === 'login' && (
            <LoginForm api={api} onLogin={handleLogin} defaultUsername={''} />
          )}

          {view === 'register' && (
            <RegisterForm api={api} onRegistered={handleRegistered} />
          )}

          {view === 'dashboard' && (
            <Dashboard api={api} token={token} />
          )}
        </section>
      </main>

      <footer className="footer">© NauczSie • MVP</footer>
    </div>
  );
}

export default App;
