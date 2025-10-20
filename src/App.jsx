import React, { useState, useEffect } from 'react';

function App() {
  const [message, setMessage] = useState('Witaj w NauczSie!');
  // Używamy import.meta.env (w Vite) i domyślnie łączymy się z lokalnym backendem
  const defaultApi = import.meta && import.meta.env && import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://127.0.0.1:8000';
  const [apiUrl, setApiUrl] = useState(defaultApi);

  useEffect(() => {
    // Próba pobrania health z backendu, jeśli VITE_API_URL jest ustawione
    if (!apiUrl) return;
    fetch(`${apiUrl.replace(/\/$/, '')}/health`)
      .then((r) => r.json())
      .then((j) => setMessage(`Backend: ${j.detail || JSON.stringify(j)}`))
      .catch(() => setMessage('Nie udało się połączyć z backendem'));
  }, [apiUrl]);

  return (
    <div className="app">
      <header>
        <h1>NauczSie - Frontend (MVP)</h1>
        <p>{message}</p>
      </header>

      <section className="config">
        <label>
          API URL (VITE_API_URL):
          <input
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://your-backend.onrender.com"
          />
        </label>
        <p className="hint">Ustaw adres API rendera lub zostaw pusty aby nie robić zapytania.</p>
      </section>

      <footer>
        <small>Stack: React + Vite → FastAPI → Supabase (Postgres)</small>
      </footer>
    </div>
  );
}

export default App;
