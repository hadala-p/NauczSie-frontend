import React, { useState, useEffect, useCallback } from 'react';
import authService from './services/authService';

function App() {
  // Stan aplikacji
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const [openaiKey, setOpenaiKey] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('polish');
  const [targetLanguage, setTargetLanguage] = useState('english');
  const [selectedCategory, setSelectedCategory] = useState('basic_words');
  const [selectedTense, setSelectedTense] = useState('present_simple');
  const [words, setWords] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('words');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Dane z API
  const [languages, setLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tenses, setTenses] = useState([]);

  useEffect(() => {
    loadLanguages();
    loadCategories();
    loadTenses();
  }, [loadLanguages, loadCategories, loadTenses]);

  useEffect(() => {
    if (window.location.pathname === '/auth/callback') {
      setTimeout(() => {
        window.history.replaceState({}, '', '/');
        checkAuthState();
      }, 500);
    }
    
    checkAuthState();
    
    const handleAuthStateChange = (event) => {
      setIsLoggedIn(event.detail.isLoggedIn);
      setUser(event.detail.user);
    };
    
    window.addEventListener('authStateChanged', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, []);

  const checkAuthState = () => {
    const loggedIn = authService.isLoggedIn();
    const currentUser = authService.getCurrentUser();
    setIsLoggedIn(loggedIn);
    setUser(currentUser);
  };

  const loadLanguages = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/languages`);
      const data = await response.json();
      setLanguages(data.languages);
    } catch (err) {
      console.error('Błąd ładowania języków:', err);
    }
  }, [apiUrl]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/categories`);
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      console.error('Błąd ładowania kategorii:', err);
    }
  }, [apiUrl]);

  const loadTenses = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/tenses`);
      const data = await response.json();
      setTenses(data.tenses);
    } catch (err) {
      console.error('Błąd ładowania czasów:', err);
    }
  }, [apiUrl]);

  const generateWords = async () => {
    if (!openaiKey.trim()) {
      setError('Proszę wprowadzić klucz API OpenAI');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/words/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          native_language: nativeLanguage,
          target_language: targetLanguage,
          category: selectedCategory,
          openai_api_key: openaiKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Błąd generowania słówek');
      }

      const data = await response.json();
      setWords(data.words);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSentences = async () => {
    if (!openaiKey.trim()) {
      setError('Proszę wprowadzić klucz API OpenAI');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiUrl}/sentences/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          native_language: nativeLanguage,
          target_language: targetLanguage,
          tense: selectedTense,
          openai_api_key: openaiKey
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Błąd generowania zdań');
      }

      const data = await response.json();
      setSentences(data.sentences);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      setError('');
      await authService.loginWithGoogle();
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
  };

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <div className="header-main">
            <h1>🌍 NauczSie</h1>
            <p>Ucz się języków obcych z pomocą AI</p>
          </div>
          <div className="header-auth">
            {isLoggedIn ? (
              <div className="user-info">
                <div className="user-details">
                  {user?.avatar_url && (
                    <img src={user.avatar_url} alt="Avatar" className="user-avatar" />
                  )}
                  <span className="user-name">{user?.full_name || user?.email}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                  Wyloguj
                </button>
              </div>
            ) : (
              <button 
                onClick={handleGoogleLogin} 
                className="google-login-btn"
                disabled={authLoading}
              >
                {authLoading ? 'Logowanie...' : '🔐 Zaloguj przez Google'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Konfiguracja */}
      <section className="config-section">
        <h2>⚙️ Konfiguracja</h2>
        
        <div className="config-grid">
          <div className="config-item">
            <label>Klucz API OpenAI:</label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="api-key-input"
            />
          </div>

          <div className="config-item">
            <label>Język ojczysty:</label>
            <select 
              value={nativeLanguage} 
              onChange={(e) => setNativeLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="config-item">
            <label>Język docelowy:</label>
            <select 
              value={targetLanguage} 
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'words' ? 'active' : ''}`}
          onClick={() => setActiveTab('words')}
        >
          📚 Słówka
        </button>
        <button 
          className={`tab ${activeTab === 'sentences' ? 'active' : ''}`}
          onClick={() => setActiveTab('sentences')}
        >
          📝 Zdania
        </button>
      </div>

      {/* Sekcja słówek */}
      {activeTab === 'words' && (
        <section className="words-section">
          <h2>📚 Generowanie słówek</h2>
          
          <div className="category-selector">
            <label>Kategoria:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.code} value={cat.code}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="generate-btn" 
            onClick={generateWords}
            disabled={loading}
          >
            {loading ? 'Generuję...' : 'Generuj słówka'}
          </button>

          {words.length > 0 && (
            <div className="results">
              <h3>Wygenerowane słówka:</h3>
              <div className="words-grid">
                {words.map((word, index) => (
                  <div key={index} className="word-card">
                    <div className="word-main">
                      <span className="word">{word.word}</span>
                      <span className="translation">{word.translation}</span>
                    </div>
                    {word.example_sentence && (
                      <div className="example">
                        <em>"{word.example_sentence}"</em>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Sekcja zdań */}
      {activeTab === 'sentences' && (
        <section className="sentences-section">
          <h2>📝 Generowanie zdań</h2>
          
          <div className="tense-selector">
            <label>Czas gramatyczny:</label>
            <select 
              value={selectedTense} 
              onChange={(e) => setSelectedTense(e.target.value)}
            >
              {tenses.map(tense => (
                <option key={tense.code} value={tense.code}>
                  {tense.name}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="generate-btn" 
            onClick={generateSentences}
            disabled={loading}
          >
            {loading ? 'Generuję...' : 'Generuj zdania'}
          </button>

          {sentences.length > 0 && (
            <div className="results">
              <h3>Wygenerowane zdania:</h3>
              <div className="sentences-list">
                {sentences.map((sentence, index) => (
                  <div key={index} className="sentence-card">
                    <div className="sentence-main">
                      <span className="sentence">{sentence.sentence}</span>
                      <span className="translation">{sentence.translation}</span>
                    </div>
                    {sentence.explanation && (
                      <div className="explanation">
                        <strong>Wyjaśnienie:</strong> {sentence.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Błędy */}
      {error && (
        <div className="error">
          <strong>Błąd:</strong> {error}
        </div>
      )}

      <footer>
        <small>Stack: React + Vite → FastAPI → OpenAI</small>
      </footer>
    </div>
  );
}

export default App;
