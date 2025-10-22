import React from 'react';

export default function Header({ currentUser, onNav, onLogout }) {
  return (
    <header className="header">
      <div className="brand">
        <h1>NauczSie</h1>
        <small>MVP — ucz się słówek</small>
      </div>

      <nav className="nav">
        <button onClick={() => onNav('home')}>Home</button>
        {currentUser ? (
          <>
            <span className="user">{currentUser.username}</span>
            <button onClick={() => onNav('dashboard')}>Dashboard</button>
            <button onClick={onLogout}>Wyloguj</button>
          </>
        ) : (
          <>
            <button onClick={() => onNav('login')}>Zaloguj</button>
            <button onClick={() => onNav('register')}>Zarejestruj</button>
          </>
        )}
      </nav>
    </header>
  );
}

