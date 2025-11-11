import React, { useState, useEffect } from 'react';
import authService from './services/authService';

function App() {
  // Stan aplikacji
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [openaiKey, setOpenaiKey] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('polish');
  const [targetLanguage, setTargetLanguage] = useState('english');
  const [selectedCategory, setSelectedCategory] = useState('basic_words');
  const [selectedTense, setSelectedTense] = useState('present_simple');
  const [words, setWords] = useState([]);
  const [sentences, setSentences] = useState([]);
  const [sentenceAnswers, setSentenceAnswers] = useState({});
  const [sentenceResults, setSentenceResults] = useState({});
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);
  const [flashcardResults, setFlashcardResults] = useState({});
  const [isSessionComplete, setIsSessionComplete] = useState(false);
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

  const resolveLanguageName = (code) => {
    const match = languages.find((lang) => lang.code === code);
    return match ? match.name : code;
  };

  const findNextUnseenIndex = (startIndex, total, results) => {
    for (let offset = 1; offset <= total; offset += 1) {
      const candidate = (startIndex + offset) % total;
      if (!Object.prototype.hasOwnProperty.call(results, candidate)) {
        return candidate;
      }
    }
    return startIndex;
  };

  // Ładowanie danych z API
  useEffect(() => {
    loadLanguages();
    loadCategories();
    loadTenses();
    
    // Obsługa callbacku z OAuth - Supabase automatycznie przetwarza hash fragment
    // Sprawdzamy czy jesteśmy na stronie callbacku
    if (window.location.pathname === '/auth/callback') {
      // Supabase przetworzy callback automatycznie w authService.initializeAuth()
      // Usuwamy hash z URL i przekierowujemy na główną stronę
      setTimeout(() => {
        window.history.replaceState({}, '', '/');
        checkAuthState();
      }, 500);
    }
    
    // Sprawdzamy stan autoryzacji
    checkAuthState();
    
    // Nasłuchujemy na zmiany stanu autoryzacji
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

  const loadLanguages = async () => {
    try {
      const response = await fetch(`${apiUrl}/languages`);
      const data = await response.json();
      setLanguages(data.languages);
    } catch (err) {
      console.error('Błąd ładowania języków:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}/categories`);
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      console.error('Błąd ładowania kategorii:', err);
    }
  };

  const loadTenses = async () => {
    try {
      const response = await fetch(`${apiUrl}/tenses`);
      const data = await response.json();
      setTenses(data.tenses);
    } catch (err) {
      console.error('Błąd ładowania czasów:', err);
    }
  };

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
      setSentenceAnswers({});
      setSentenceResults({});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFlashcards = async () => {
    setFlashcardsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        native_language: nativeLanguage,
        target_language: targetLanguage,
        limit: '10',
      });

      const response = await fetch(`${apiUrl}/words/flashcards?${params.toString()}`);

      if (!response.ok) {
        let errorMessage = 'Błąd ładowania fiszek';

        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            if (typeof errorData.detail === 'string') {
              errorMessage = errorData.detail;
            } else if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail
                .map((item) => item.msg || JSON.stringify(item))
                .join(', ');
            } else if (typeof errorData.detail === 'object') {
              errorMessage = errorData.detail.msg || JSON.stringify(errorData.detail);
            }
          }
        } catch (parseError) {
          const text = await response.text();
          if (text) {
            errorMessage = text;
          }
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFlashcards(data.words);
      setFlashcardResults({});
      setIsSessionComplete(false);
      setFlashcardIndex(0);
      setIsFlashcardFlipped(false);

      if (data.words.length === 0) {
        setError('Brak zapisanych słówek dla wybranych języków. Wygeneruj nowe słówka, aby stworzyć fiszki.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFlashcardsLoading(false);
    }
  };

  const handleFlipFlashcard = () => {
    if (!flashcards.length) return;
    setIsFlashcardFlipped((prev) => !prev);
  };

  const handleNextFlashcard = () => {
    if (!flashcards.length) return;
    setFlashcardIndex((prev) => (prev + 1) % flashcards.length);
    setIsFlashcardFlipped(false);
  };

  const handlePreviousFlashcard = () => {
    if (!flashcards.length) return;
    setFlashcardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setIsFlashcardFlipped(false);
  };

  const handleMarkFlashcard = (resultType) => {
    if (!flashcards.length) return;

    setFlashcardResults((prev) => {
      const alreadyRated = Object.prototype.hasOwnProperty.call(prev, flashcardIndex);
      const updated = {
        ...prev,
        [flashcardIndex]: resultType,
      };

      if (!alreadyRated) {
        if (Object.keys(updated).length === flashcards.length) {
          setIsSessionComplete(true);
        } else {
          const nextIndex = findNextUnseenIndex(flashcardIndex, flashcards.length, updated);
          setFlashcardIndex(nextIndex);
        }
      }

      setIsFlashcardFlipped(false);
      return updated;
    });
  };

  const handleResetFlashcardSession = () => {
    if (!flashcards.length) return;
    setFlashcardResults({});
    setIsSessionComplete(false);
    setFlashcardIndex(0);
    setIsFlashcardFlipped(false);
  };

  const totalFlashcards = flashcards.length;
  const reviewedFlashcards = Object.keys(flashcardResults).length;
  const flashcardResultValues = Object.values(flashcardResults);
  const knownFlashcards = flashcardResultValues.filter((value) => value === 'known').length;
  const unknownFlashcards = flashcardResultValues.filter((value) => value === 'unknown').length;
  const currentFlashcard = totalFlashcards > 0 ? flashcards[flashcardIndex] : null;
  const currentFlashcardResult = currentFlashcard ? flashcardResults[flashcardIndex] : undefined;
  const showTranslation = isFlashcardFlipped;
  const activeLanguageLabel = showTranslation
    ? resolveLanguageName(nativeLanguage)
    : resolveLanguageName(targetLanguage);
  const flashcardCategoryLabel = currentFlashcard?.category
    ? currentFlashcard.category.replace(/_/g, ' ')
    : 'brak kategorii';

  const normalizeAnswer = (value) => value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/g, '')
    .toLowerCase();

  const handleSentenceAnswerChange = (index, value) => {
    setSentenceAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const checkSentenceAnswer = (index) => {
    const currentSentence = sentences[index];
    if (!currentSentence) {
      return;
    }

    const rawAnswer = sentenceAnswers[index] ?? '';
    if (!rawAnswer.trim()) {
      setSentenceResults((prev) => ({
        ...prev,
        [index]: { status: 'empty' },
      }));
      return;
    }

    const acceptedAnswers = (currentSentence.acceptable_answers && currentSentence.acceptable_answers.length > 0
      ? currentSentence.acceptable_answers
      : [currentSentence.correct_answer]
    );

    const normalizedAccepted = acceptedAnswers.map(normalizeAnswer);
    const isCorrect = normalizedAccepted.includes(normalizeAnswer(rawAnswer));

    setSentenceResults((prev) => ({
      ...prev,
      [index]: {
        status: isCorrect ? 'correct' : 'incorrect',
        userAnswer: rawAnswer,
      },
    }));
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
        <button 
          className={`tab ${activeTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => setActiveTab('flashcards')}
        >
          🃏 Fiszki
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
                {sentences.map((sentence, index) => {
                  const result = sentenceResults[index];
                  const answerValue = sentenceAnswers[index] ?? '';

                  return (
                    <div key={index} className="sentence-card">
                      <p className="sentence-cloze">{sentence.cloze_sentence}</p>

                      {sentence.verb_infinitive && (
                        <p className="sentence-hint">
                          Czasownik do uzupełnienia:{' '}
                          <strong>{sentence.verb_infinitive}</strong>
                        </p>
                      )}

                      <div className="sentence-input-row">
                        <input
                          type="text"
                          value={answerValue}
                          onChange={(event) => handleSentenceAnswerChange(index, event.target.value)}
                          placeholder="Wpisz brakującą formę czasownika"
                        />
                        <button
                          className="outline-btn"
                          onClick={() => checkSentenceAnswer(index)}
                        >
                          Sprawdź
                        </button>
                      </div>

                      {result?.status === 'empty' && (
                        <div className="sentence-result info">
                          Wpisz odpowiedź, aby sprawdzić.
                        </div>
                      )}

                      {result?.status === 'correct' && (
                        <div className="sentence-result correct">
                          Świetnie! Poprawna odpowiedź:{' '}
                          <strong>{sentence.correct_answer}</strong>
                        </div>
                      )}

                      {result?.status === 'incorrect' && (
                        <div className="sentence-result incorrect">
                          Poprawna odpowiedź to:{' '}
                          <strong>{sentence.correct_answer}</strong>
                        </div>
                      )}

                      <div className="sentence-extra">
                        <p className="sentence-full">
                          Pełne zdanie:{' '}
                          <strong>{sentence.sentence}</strong>
                        </p>
                        <p className="sentence-translation">
                          Tłumaczenie: {sentence.translation}
                        </p>
                      </div>

                      {sentence.explanation && (
                        <div className="explanation">
                          <strong>Wyjaśnienie:</strong> {sentence.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {activeTab === 'flashcards' && (
        <section className="flashcards-section">
          <h2>🃏 Nauka z fiszkami</h2>
          <p className="flashcards-description">
            Fiszki powstają na podstawie zapisanych wcześniej słówek. Kliknij kartę, aby zobaczyć tłumaczenie.
          </p>

          <button 
            className="generate-btn"
            onClick={loadFlashcards}
            disabled={flashcardsLoading}
          >
            {flashcardsLoading ? 'Ładuję fiszki...' : 'Pobierz fiszki'}
          </button>

          {flashcards.length > 0 ? (
            <>
              <div className="flashcard-wrapper">
                {currentFlashcard && (
                  <div
                    className={`flashcard ${showTranslation ? 'flipped' : ''}`}
                    onClick={handleFlipFlashcard}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleFlipFlashcard();
                      }
                    }}
                  >
                    <span className="flashcard-label">{activeLanguageLabel}</span>
                    <span className="flashcard-word">
                      {showTranslation
                        ? currentFlashcard.translation
                        : currentFlashcard.word}
                    </span>
                    <span className="flashcard-hint">
                      {showTranslation ? 'Tłumaczenie' : 'Kliknij, aby zobaczyć tłumaczenie'}
                    </span>
                    {showTranslation && currentFlashcard?.example_sentence && (
                      <div className="flashcard-example">
                        <strong>Przykład:</strong>
                        <em>{currentFlashcard.example_sentence}</em>
                      </div>
                    )}
                    {currentFlashcardResult && (
                      <span className={`flashcard-status ${currentFlashcardResult}`}>
                        {currentFlashcardResult === 'known' ? 'Znam to słówko' : 'Do powtórki'}
                      </span>
                    )}
                    <span className="flashcard-category">
                      {flashcardCategoryLabel}
                    </span>
                  </div>
                )}
              </div>

              <div className="flashcard-actions">
                <button 
                  className="flashcard-action-btn known"
                  onClick={() => handleMarkFlashcard('known')}
                  disabled={!currentFlashcard}
                >
                  ✅ Znam
                </button>
                <button 
                  className="flashcard-action-btn unknown"
                  onClick={() => handleMarkFlashcard('unknown')}
                  disabled={!currentFlashcard}
                >
                  ❓ Nie znam
                </button>
              </div>

              <div className="flashcard-controls">
                <button 
                  className="outline-btn"
                  onClick={handlePreviousFlashcard}
                  disabled={flashcards.length <= 1}
                >
                  ◀ Poprzednia
                </button>
                <span className="flashcard-progress">
                  {flashcardIndex + 1} / {flashcards.length}
                </span>
                <button 
                  className="outline-btn"
                  onClick={handleNextFlashcard}
                  disabled={flashcards.length <= 1}
                >
                  Następna ▶
                </button>
              </div>

              <div className="flashcard-session-info">
                <div>
                  Zapamiętane: <strong>{knownFlashcards}</strong> • Do powtórki: <strong>{unknownFlashcards}</strong> • Przerobione: <strong>{reviewedFlashcards}</strong> / {totalFlashcards}
                </div>
                {isSessionComplete && (
                  <div className="flashcard-summary">
                    <span>Świetnie! Ukończono sesję fiszek.</span>
                    <button className="outline-btn" onClick={handleResetFlashcardSession}>
                      Powtórz sesję
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            !flashcardsLoading && (
              <div className="flashcards-empty">
                Brak fiszek do wyświetlenia. Wygeneruj słówka, aby zapisać je w bazie i wróć do tej zakładki.
              </div>
            )
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
