# Fix dla problemu z logowaniem

## Problem
Po próbie zalogowania się, użytkownik nie może się zalogować, mimo że konto jest potwierdzone w Supabase.

## Co zostało poprawione

### 1. Login Form
- Dodano weryfikację sesji po logowaniu
- Dodano opóźnienie przed przekierowaniem (daje czas na ustawienie cookies)
- Użyto `window.location.href` zamiast `router.push` dla hard redirect
- Dodano logowanie do konsoli dla debugowania

### 2. Middleware
- Dodano obsługę błędów przy pobieraniu użytkownika
- Dodano logowanie błędów

### 3. Test Endpoint
- Utworzono `/api/auth/test` do sprawdzania statusu autoryzacji

## Jak przetestować

### 1. Sprawdź konsolę przeglądarki
Po próbie zalogowania sprawdź konsolę (F12) - powinieneś zobaczyć:
- "Login successful, session created"
- "Session verified, redirecting..."

### 2. Sprawdź cookies
W DevTools → Application → Cookies sprawdź czy są:
- `sb-<project>-auth-token`
- `sb-<project>-auth-token.code_verifier`

### 3. Sprawdź endpoint testowy
Otwórz w przeglądarce: `http://localhost:3000/api/auth/test`
Powinieneś zobaczyć JSON z informacją o sesji.

## Możliwe przyczyny problemu

### 1. Cookies nie są zapisywane
- Sprawdź czy przeglądarka nie blokuje cookies
- Sprawdź czy nie masz włączonego trybu incognito
- Sprawdź czy domena jest poprawna

### 2. CORS issues
- Sprawdź czy `NEXT_PUBLIC_SUPABASE_URL` jest poprawny
- Sprawdź czy `NEXT_PUBLIC_SUPABASE_ANON_KEY` jest poprawny

### 3. Middleware blokuje
- Sprawdź logi serwera (terminal gdzie uruchomiłeś `npm run dev`)
- Zobacz czy są błędy w middleware

## Debugowanie

### Krok 1: Sprawdź czy logowanie działa
1. Otwórz konsolę przeglądarki (F12)
2. Spróbuj się zalogować
3. Zobacz czy są błędy w konsoli

### Krok 2: Sprawdź sesję
1. Po logowaniu otwórz: `http://localhost:3000/api/auth/test`
2. Sprawdź czy `authenticated: true`

### Krok 3: Sprawdź cookies
1. DevTools → Application → Cookies
2. Sprawdź czy są cookies z Supabase

### Krok 4: Sprawdź logi serwera
1. Terminal gdzie uruchomiłeś `npm run dev`
2. Zobacz czy są błędy

## Jeśli nadal nie działa

### Sprawdź konfigurację Supabase
1. Supabase Dashboard → Authentication → Settings
2. Sprawdź czy "Confirm email" jest wyłączone (jeśli testujesz)
3. Sprawdź URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### Sprawdź zmienne środowiskowe
Upewnij się, że w `.env.local` masz:
```env
NEXT_PUBLIC_SUPABASE_URL=twoj_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=twoj_klucz
```

### Wyczyść cache
1. Wyczyść cookies przeglądarki
2. Wyczyść cache Next.js: `rm -rf .next`
3. Restart serwera: `npm run dev`

### Sprawdź czy użytkownik istnieje
1. Supabase Dashboard → Authentication → Users
2. Sprawdź czy użytkownik jest potwierdzony
3. Sprawdź czy email jest poprawny

## Najszybsze rozwiązanie

Jeśli wszystko inne nie działa:
1. Wyczyść cookies przeglądarki
2. Wyczyść cache Next.js (`rm -rf .next`)
3. Restart serwera (`npm run dev`)
4. Spróbuj się zalogować ponownie



