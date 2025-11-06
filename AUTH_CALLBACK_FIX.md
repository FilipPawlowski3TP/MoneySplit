# Fix dla Authentication Error

## Problem
Po rejestracji i kliknięciu w link z emaila, użytkownik trafia na stronę "Authentication Error".

## Rozwiązanie

### 1. Sprawdź konfigurację Supabase

**Najważniejsze:**
1. Otwórz Supabase Dashboard
2. Przejdź do **Authentication** → **URL Configuration**
3. Upewnij się, że:
   - **Site URL**: `http://localhost:3000` (lub twój URL)
   - **Redirect URLs**: Dodaj `http://localhost:3000/auth/callback`

### 2. Sprawdź format linku z emaila

Link z emaila Supabase może wyglądać tak:
```
https://your-project.supabase.co/auth/v1/verify?token=xxx&type=signup&redirect_to=http://localhost:3000/auth/callback
```

Lub:
```
http://localhost:3000/auth/callback?code=xxx&type=signup
```

### 3. Co zostało poprawione

1. **Callback Route** - obsługuje różne formaty:
   - `code` parameter (PKCE flow)
   - `token_hash` parameter
   - `token` parameter (starszy format)
   - Różne typy: `signup`, `recovery`, `email`

2. **Error Page** - lepsze komunikaty:
   - Instrukcje co zrobić
   - Debug info w trybie development
   - Przyciski do logowania

### 4. Alternatywne rozwiązanie - wyłącz potwierdzenie emaila

**Tylko dla testów!**

1. Supabase Dashboard → **Authentication** → **Settings**
2. Znajdź **"Email Auth"** → **"Confirm email"**
3. **Wyłącz** "Confirm email"
4. Zapisz zmiany

Teraz możesz się logować od razu po rejestracji.

### 5. Sprawdź czy link działa

1. Otwórz email z Supabase
2. **Kliknij prawym przyciskiem** na link → **"Copy link address"**
3. Sprawdź czy link zawiera:
   - `token=` lub `token_hash=` lub `code=`
   - `type=signup`
   - `redirect_to=http://localhost:3000/auth/callback`

### 6. Debugowanie

W trybie development, strona error pokazuje:
- Jakie parametry zostały otrzymane
- Czy są `code`, `token`, `token_hash`

### 7. Manualne potwierdzenie

Jeśli nadal nie działa:

1. Supabase Dashboard → **Authentication** → **Users**
2. Znajdź swojego użytkownika
3. Kliknij **"Confirm"** przy użytkowniku
4. Spróbuj się zalogować

### 8. Sprawdź logi

W konsoli przeglądarki (F12) zobaczysz:
- Błędy z callback route
- Parametry które zostały otrzymane

### 9. Najprostsze rozwiązanie

**Tymczasowo wyłącz potwierdzenie emaila:**

1. Supabase → Authentication → Settings
2. Wyłącz "Confirm email"
3. Zarejestruj się ponownie
4. Zaloguj się od razu

**UWAGA**: W produkcji zawsze włącz potwierdzenie emaila!






