# NauczSie - Frontend (React + Vite)

Prosty frontend dla projektu NauczSie. Zawiera minimalny React + Vite, który łączy się z backendem (FastAPI) przez zmienną środowiskową VITE_API_URL.

Quickstart
1. Zainstaluj zależności:
   cd NauczSie-frontend
   npm install

2. Uruchom w trybie deweloperskim:
   npm run dev

3. Zbuduj produkcyjnie:
   npm run build
   npm run preview    # podgląd builda na porcie 4173

Konfiguracja
- Aplikacja domyślnie używa URL `http://127.0.0.1:8000`. Możesz zmienić backend URL bezpośrednio w UI (pole "API URL" po lewej) lub ustawić zmienną środowiskową `VITE_API_URL` podczas buildu/deployu na platformie hostingowej — Vite wystawia zmienne zaczynające się od `VITE_` do aplikacji klienckiej podczas budowania.

Uwaga dotycząca deployu
- Repozytorium frontendowe możesz podpiąć do Vercel — domyślny build command: `npm run build`, output dir: `dist`.

Pliki
- `index.html` - wejście aplikacji
- `src/main.jsx` - punkt wejścia React
- `src/App.jsx` - prosty komponent z polem API URL i próbą odpytywania `/health`
