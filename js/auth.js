/**
 * AIDynamic.pro — Authentication Module
 * Supabase Auth with Magic Link (passwordless)
 *
 * Usage:
 *   const auth = new AuthManager();
 *   await auth.init();
 *
 *   // Check if logged in
 *   if (auth.isAuthenticated()) { ... }
 *
 *   // Send magic link
 *   await auth.sendMagicLink('user@email.com');
 *
 *   // Logout
 *   auth.logout();
 */

// ── CONFIG ──
// TODO: Replace with your AIDynamic.pro Supabase project credentials
const SUPABASE_URL = 'https://uakiregrnzcwuwqjkaxr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2lyZWdybnpjd3V3cWprYXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcwNjI0MDAsImV4cCI6MjAzMjYzODQwMH0.ANONYMOUS_KEY_PLACEHOLDER';

// ── AIDynamic Brand Colors ──
const BRAND = {
  primary: '#3b82f6',
  primaryGlow: 'rgba(59, 130, 246, 0.4)',
  cyan: '#06b6d4',
  purple: '#8b5cf6',
  midnight: '#0a0e1a',
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  accentGradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #8b5cf6 100%)'
};

class AuthManager {
  constructor() {
    this.baseUrl = SUPABASE_URL;
    this.apiKey = SUPABASE_ANON_KEY;
    this.user = null;
    this.session = null;
    this._initialized = false;
    this.headers = {
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  // ── Initialize ──
  async init() {
    // Check for existing session in localStorage
    const savedSession = localStorage.getItem('aidynamic-session');
    if (savedSession) {
      try {
        this.session = JSON.parse(savedSession);
        this.headers.Authorization = `Bearer ${this.session.access_token}`;
        await this.refreshUser();
      } catch (e) {
        this.clearSession();
      }
    }
    this._initialized = true;
    // Notify auth-guard and other listeners
    document.dispatchEvent(new CustomEvent('auth:ready', { detail: { user: this.user } }));
    return this.user;
  }

  // ── Send Magic Link ──
  async sendMagicLink(email) {
    const response = await fetch(`${this.baseUrl}/auth/v1/otp`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        email: email,
        create_user: true,
        data: {
          source: 'aidynamic.pro'
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to send magic link');
    }

    return { success: true, message: 'Magic link sent! Check your email.' };
  }

  // ── Verify OTP (Magic Link Code) ──
  async verifyOTP(email, token) {
    const response = await fetch(`${this.baseUrl}/auth/v1/verify`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        type: 'email',
        email: email,
        token: token
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Invalid code');
    }

    const data = await response.json();
    this.setSession(data);
    await this.ensureProfile(data.user);
    return data.user;
  }

  // ── Set Session ──
  setSession(sessionData) {
    this.session = {
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
      user: sessionData.user
    };
    this.user = sessionData.user;
    this.headers.Authorization = `Bearer ${sessionData.access_token}`;
    localStorage.setItem('aidynamic-session', JSON.stringify(this.session));
  }

  // ── Refresh User Data ──
  async refreshUser() {
    if (!this.session) return null;

    const response = await fetch(`${this.baseUrl}/auth/v1/user`, {
      headers: this.headers
    });

    if (response.ok) {
      const data = await response.json();
      this.user = data;
      return data;
    } else {
      this.clearSession();
      return null;
    }
  }

  // ── Ensure User Profile Exists ──
  async ensureProfile(user) {
    if (!user) return;

    const checkRes = await fetch(
      `${this.baseUrl}/rest/v1/profiles?id=eq.${user.id}&select=*`,
      { headers: this.headers }
    );

    const profiles = await checkRes.json();

    if (!profiles || profiles.length === 0) {
      await fetch(`${this.baseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers: { ...this.headers, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          role: 'user',
          created_at: new Date().toISOString()
        })
      });
    }
  }

  // ── Get Profile ──
  async getProfile() {
    if (!this.user) return null;

    const response = await fetch(
      `${this.baseUrl}/rest/v1/profiles?id=eq.${this.user.id}&select=*`,
      { headers: this.headers }
    );

    const profiles = await response.json();
    return profiles?.[0] || null;
  }

  // ── Update Profile ──
  async updateProfile(updates) {
    if (!this.user) throw new Error('Not authenticated');

    const response = await fetch(
      `${this.baseUrl}/rest/v1/profiles?id=eq.${this.user.id}`,
      {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify(updates)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return true;
  }

  // ── Check Auth Status ──
  isAuthenticated() {
    return !!this.user && !!this.session;
  }

  // ── Get Current User ──
  getUser() {
    return this.user;
  }

  // ── Get User Email ──
  getEmail() {
    return this.user?.email || null;
  }

  // ── Get Auth Headers ──
  getHeaders() {
    return { ...this.headers };
  }

  // ── Logout ──
  logout() {
    this.clearSession();
    window.location.href = '/';
  }

  // ── Clear Session ──
  clearSession() {
    this.user = null;
    this.session = null;
    this.headers.Authorization = `Bearer ${this.apiKey}`;
    localStorage.removeItem('aidynamic-session');
  }

  // ── Require Auth (redirect if not logged in) ──
  requireAuth(redirectUrl = '/login.html') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }

  // ── Update Navigation UI ──
  updateNav() {
    const navAuth = document.getElementById('nav-auth');
    if (!navAuth) return;

    const isTailwind = document.querySelector('[class*="max-w-7xl"]') !== null;

    if (this.isAuthenticated()) {
      const initial = this.user.email?.charAt(0).toUpperCase() || 'U';
      const name = this.user.email?.split('@')[0] || 'User';

      if (isTailwind) {
        navAuth.innerHTML = `
          <div class="relative group">
            <button class="flex items-center gap-2 text-gray-300 hover:text-white transition">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                ${initial}
              </div>
              <span class="hidden md:inline text-sm">${name}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div class="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
                 style="background:#0a0e1a;border:1px solid rgba(59,130,246,0.15);">
              <a href="/dashboard.html" class="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-t-xl transition">Dashboard</a>
              <a href="/profile.html" class="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition">Profile</a>
              <div style="border-top:1px solid rgba(255,255,255,0.06);"></div>
              <button onclick="window.auth.logout()" class="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 rounded-b-xl transition">Logout</button>
            </div>
          </div>
        `;
      } else {
        navAuth.innerHTML = `
          <div style="position:relative;" class="nav-auth-dropdown" onmouseenter="this.querySelector('.nav-auth-menu').style.display='block'" onmouseleave="this.querySelector('.nav-auth-menu').style.display='none'">
            <button style="display:flex;align-items:center;gap:0.5rem;color:var(--text-secondary);background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-size:0.85rem;">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--accent-gradient);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:0.8rem;">${initial}</div>
              <span style="display:none;" class="nav-auth-name">${name}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div class="nav-auth-menu" style="display:none;position:absolute;right:0;top:calc(100% + 8px);width:180px;background:var(--midnight);border:1px solid rgba(59,130,246,0.15);border-radius:12px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);z-index:100;">
              <a href="/dashboard.html" style="display:block;padding:0.65rem 1rem;color:var(--text-secondary);text-decoration:none;font-size:0.8rem;font-family:'Inter',sans-serif;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.04)';this.style.color='var(--text-primary)'" onmouseout="this.style.background='transparent';this.style.color='var(--text-secondary)'">Dashboard</a>
              <a href="/profile.html" style="display:block;padding:0.65rem 1rem;color:var(--text-secondary);text-decoration:none;font-size:0.8rem;font-family:'Inter',sans-serif;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.04)';this.style.color='var(--text-primary)'" onmouseout="this.style.background='transparent';this.style.color='var(--text-secondary)'">Profile</a>
              <div style="border-top:1px solid rgba(255,255,255,0.06);"></div>
              <button onclick="window.auth.logout()" style="display:block;width:100%;text-align:left;padding:0.65rem 1rem;color:#f87171;background:none;border:none;cursor:pointer;font-size:0.8rem;font-family:'Inter',sans-serif;transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.04)';this.style.color='#ef4444'" onmouseout="this.style.background='transparent';this.style.color='#f87171'">Logout</button>
            </div>
          </div>
        `;
      }
    } else {
      if (isTailwind) {
        navAuth.innerHTML = `
          <a href="/login.html" class="text-gray-300 hover:text-white transition text-sm font-medium hidden sm:inline">Log In</a>
          <a href="/signup.html" class="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition" style="background:linear-gradient(135deg, #3b82f6, #06b6d4);">Get Started</a>
        `;
      } else {
        navAuth.innerHTML = `
          <a href="/login.html" style="color:var(--text-secondary);text-decoration:none;font-size:0.8rem;font-weight:500;letter-spacing:0.05em;text-transform:uppercase;transition:color 0.3s;font-family:'Inter',sans-serif;" onmouseover="this.style.color='var(--electric)'" onmouseout="this.style.color='var(--text-secondary)'">Log In</a>
          <a href="/signup.html" class="nav-cta" style="margin-left:0.75rem;">Get Started</a>
        `;
      }
    }
  }
}

// ── Global Instance ──
const auth = new AuthManager();

// Auto-init on page load
document.addEventListener('DOMContentLoaded', async () => {
  await auth.init();
  auth.updateNav();
});

// Expose globally
window.auth = auth;
export { AuthManager, auth };
