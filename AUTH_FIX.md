# Fix dla problemów z logowaniem

## Problem
Po zarejestrowaniu się użytkownik dostaje email z Supabase, ale nie może się zalogować.

## Rozwiązanie

### 1. Potwierdzenie emaila

W Supabase domyślnie wymagane jest potwierdzenie emaila. Po kliknięciu w link z emaila:

1. **Sprawdź w Supabase Dashboard**:
   - Authentication → Settings → Email Auth
   - Upewnij się, że "Confirm email" jest włączone (lub wyłączone jeśli chcesz testować bez potwierdzenia)

2. **Konfiguracja URL-e w Supabase**:
   - Authentication → URL Configuration
   - Site URL: `http://localhost:3000` (lub twój URL)
   - Redirect URLs: Dodaj `http://localhost:3000/auth/callback`

### 2. Wyłączanie wymagania potwierdzenia emaila (dla testów)

Jeśli chcesz przetestować bez potwierdzenia emaila:

1. W Supabase Dashboard: Authentication → Settings
2. Znajdź "Email Auth" → "Confirm email"
3. Wyłącz "Confirm email"
4. Zapisz zmiany

**UWAGA**: To tylko dla testów! W produkcji zawsze włącz potwierdzenie emaila.

### 3. Co zostało poprawione

1. **Signup Form**:
   - Pokazuje komunikat o sprawdzeniu emaila po rejestracji
   - Nie przekierowuje od razu, jeśli wymagane jest potwierdzenie

2. **Login Form**:
   - Lepsze komunikaty błędów
   - Informuje o potrzebie potwierdzenia emaila

3. **Auth Callback**:
   - Obsługuje potwierdzenie emaila przez token_hash
   - Przekierowuje do dashboard po potwierdzeniu

### 4. Kroki do rozwiązania

1. **Kliknij w link z emaila** - to potwierdzi twoje konto
2. **Spróbuj się zalogować** - powinno działać

Jeśli nadal nie działa:

1. Sprawdź w Supabase Dashboard → Authentication → Users
2. Znajdź swojego użytkownika
3. Sprawdź czy email jest potwierdzony (Confirmed column)
4. Jeśli nie, możesz potwierdzić ręcznie klikając "Confirm" w dashboard

### 5. Testowanie bez emaila

Dla szybkich testów możesz:

1. Wyłączyć "Confirm email" w Supabase Settings
2. Albo użyć Supabase Dashboard → Authentication → Users → "Confirm" dla swojego użytkownika

### 6. Sprawdzenie konfiguracji

Upewnij się, że w `.env.local` masz:
```env
NEXT_PUBLIC_SUPABASE_URL=twoj_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=twoj_klucz
```

### 7. Debugowanie

Jeśli nadal masz problemy:

1. Sprawdź konsolę przeglądarki (F12) - mogą być błędy
2. Sprawdź Network tab - zobacz jakie requesty są wysyłane
3. Sprawdź Supabase Dashboard → Logs - zobacz błędy po stronie serwera






