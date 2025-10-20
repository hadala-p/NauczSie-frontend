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
- Skopiuj `.env.example` do `.env` i ustaw `VITE_API_URL` (np. adres z Rendera). Vite wczytuje zmienne zaczynające się od `VITE_`.

Uwaga dotycząca deployu
- Repozytorium frontendowe możesz podpiąć do Vercel — domyślny build command: `npm run build`, output dir: `dist`.

Pliki
- `index.html` - wejście aplikacji
- `src/main.jsx` - punkt wejścia React
- `src/App.jsx` - prosty komponent z polem API URL i próbą odpytywania `/health`



