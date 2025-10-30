# NauczSie - Frontend (React + Vite)

Prosty frontend dla projektu NauczSie. Zawiera minimalny React + Vite, który łączy się z backendem (FastAPI) przez zmienną środowiskową `VITE_API_URL`.

Quickstart
1. Zainstaluj zależności:
   ```bash
   cd NauczSie-frontend
   npm install
   ```

2. Uruchom w trybie deweloperskim:
   ```bash
   npm run dev
   ```

3. Zbuduj produkcyjnie:
   ```bash
   npm run build
   npm run preview    # podgląd builda na porcie 4173
   ```

Konfiguracja
- Aplikacja domyślnie używa URL `http://127.0.0.1:8000`.
- Możesz zmienić backend URL bezpośrednio w UI (pole "API URL" po lewej) lub ustawić zmienną środowiskową `VITE_API_URL` podczas buildu/deployu.
  - Na Vercel ustaw `VITE_API_URL` w sekcji Environment Variables przed pierwszym buildem.

OpenAI i klucz API
- Backend został zmodyfikowany tak, aby NIE polegać na automatycznym fallbacku do `OPENAI_API_KEY`.
- Generowanie słówek wymaga dostarczenia klucza OpenAI w nagłówku `X-OpenAI-Key`. Frontend ma prosty panel (po lewej) gdzie możesz wkleić swój klucz — jest on zapisywany w `localStorage` pod kluczem `nauczsie_openai_key` i przy generowaniu wysyłany do backendu.
- Alternatywnie, jeśli chcesz, aby backend korzystał z centralnego serwerowego klucza, dodaj `OPENAI_API_KEY` jako zmienną środowiskową w konfiguracji serwera (np. w panelu Render). W obecnej konfiguracji backend będzie wymagał nagłówka, więc jeśli nie chcesz, by użytkownicy wklejali własne klucze, skonfiguruj serwerowo `OPENAI_API_KEY`.

Deployment na Vercel
- Importuj repo do Vercel i ustaw:
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Environment Variable przed buildem: `VITE_API_URL` = `https://<TWÓJ_BACKEND_URL>` (np. adres serwisu na Render)
- Po wdrożeniu odwiedź stronę i upewnij się, że pole API URL zawiera prawidłowy adres backendu.

Testy i sprawdzenia
- Lokalnie możesz testować generowanie, wkleiwszy swój klucz OpenAI w polu po lewej, a następnie zalogować się i wybrać kategorię → Generate.
- Możesz też testować backend bezpośrednio przy pomocy curl (przykłady w README backendu). Przykład żądania generate:
  ```bash
  curl -X POST https://<BACKEND_URL>/categories/1/generate \
    -H "Authorization: Bearer <TOKEN>" \
    -H "X-OpenAI-Key: <TWÓJ_OPENAI_KEY>"
  ```

Uwagi bezpieczeństwa
- Klucz OpenAI wklejany do UI jest przechowywany w `localStorage` i wysyłany do backendu przy żądaniu generowania. To oznacza, że użytkownik udostępnia swój klucz serwisowi, a klucz może być widoczny lokalnie — poinformuj użytkowników o konsekwencjach.
- Jeśli chcesz, aby użytkownicy nie wklejali swoich kluczy, skonfiguruj `OPENAI_API_KEY` po stronie serwera i zmodyfikuj backend tak, by używał tylko serwerowego klucza.

Pliki
- `index.html` - wejście aplikacji
- `src/main.jsx` - punkt wejścia React
- `src/App.jsx` - główny komponent
- `src/lib/api.js` - klient API (korzysta z `VITE_API_URL` lub pola API URL w UI)
