// Serwis autoryzacji dla frontendu
import { createClient } from '@supabase/supabase-js';

class AuthService {
  constructor() {
    
    // Inicjalizacja Supabase client
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY muszą być skonfigurowane w .env');
    }
    
    this.supabase = supabaseUrl && supabaseAnonKey 
      ? createClient(supabaseUrl, supabaseAnonKey)
      : null;
    
    this.token = null;
    this.user = null;
    
    // Sprawdzamy sesję Supabase przy starcie
    this.initializeAuth();
  }

  async initializeAuth() {
    if (!this.supabase) return;
    
    // Sprawdzamy aktywną sesję
    const { data: { session } } = await this.supabase.auth.getSession();
    
    if (session) {
      await this.handleSession(session);
    }
    
    // Nasłuchujemy na zmiany stanu autoryzacji
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await this.handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        // Czyścimy stan lokalny bez wywoływania signOut() (żeby uniknąć rekurencji)
        this.token = null;
        this.user = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.dispatchEvent(new CustomEvent('authStateChanged', { 
          detail: { user: null, isLoggedIn: false } 
        }));
      }
    });
  }

  async handleSession(session) {
    // Tworzymy token JWT dla backendu z sesji Supabase
    this.token = session.access_token;
    
    // Pobieramy dane użytkownika z Supabase
    const userData = session.user;
    this.user = {
      id: userData.id,
      email: userData.email,
      full_name: userData.user_metadata?.full_name || userData.user_metadata?.name,
      avatar_url: userData.user_metadata?.avatar_url || userData.user_metadata?.picture
    };
    
    localStorage.setItem('auth_token', this.token);
    localStorage.setItem('user_data', JSON.stringify(this.user));
    
    window.dispatchEvent(new CustomEvent('authStateChanged', {
      detail: { user: this.user, isLoggedIn: true }
    }));
  }


  // Logowanie przez Google używając Supabase OAuth
  async loginWithGoogle() {
    if (!this.supabase) {
      throw new Error('Supabase nie jest skonfigurowany. Sprawdź VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY w .env');
    }

    const redirectTo = `${window.location.origin}/auth/callback`;
    
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo
      }
    });

    if (error) {
      throw new Error(`Błąd logowania: ${error.message}`);
    }

    // redirectTo zostanie wykonane przez Supabase - użytkownik zostanie przekierowany
    // Po powrocie z OAuth, handleSession zostanie wywołane automatycznie przez onAuthStateChange
  }

  // Wylogowanie
  async logout() {
    if (this.supabase) {
      await this.supabase.auth.signOut();
    }
    
    this.token = null;
    this.user = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Emitujemy event o wylogowaniu
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { user: null, isLoggedIn: false } 
    }));
  }

  // Sprawdza czy użytkownik jest zalogowany
  isLoggedIn() {
    return !!this.token && !!this.user;
  }

  // Pobiera aktualnego użytkownika
  getCurrentUser() {
    return this.user;
  }

  // Pobiera token autoryzacji
  getToken() {
    return this.token;
  }

  // Wykonuje zapytanie z autoryzacją
  async authenticatedFetch(url, options = {}) {
    if (!this.token) {
      throw new Error('Użytkownik nie jest zalogowany');
    }

    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`
      }
    };

    const response = await fetch(url, authOptions);
    
    // Jeśli token wygasł, Supabase automatycznie odświeży sesję przez onAuthStateChange
    if (response.status === 401) {
      // Sprawdzamy czy sesja Supabase jest nadal aktywna
      if (this.supabase) {
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session && session.access_token !== this.token) {
          // Token został odświeżony przez Supabase
          this.token = session.access_token;
          authOptions.headers['Authorization'] = `Bearer ${this.token}`;
          return fetch(url, authOptions);
        }
      }
      this.logout();
      throw new Error('Sesja wygasła');
    }

    return response;
  }
}

// Eksportujemy singleton
export default new AuthService();
