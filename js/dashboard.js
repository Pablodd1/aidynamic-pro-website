/**
 * AIDynamic.pro — Dashboard & Admin Data Operations
 * Client dashboard + Admin lead review queue
 * Supabase integration for projects, bookings, leads, profiles
 */

const SUPABASE_URL = 'https://uakiregrnzcwuwqjkaxr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_BhHyFZplUB8DE6-E2jBxvA_MUrqfQq0';

/* ───────────────────────────────────────────────
   AIDynamicApp — Core data layer
   ─────────────────────────────────────────────── */
class AIDynamicApp {
    constructor(options = {}) {
        this.baseUrl = SUPABASE_URL;
        this.apiKey = SUPABASE_KEY;
        this.headers = {
            'apikey': this.apiKey,
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
        this.clientEmail = options.clientEmail || this._getStoredEmail();
        this.isAdmin = options.isAdmin || false;
        this.onUpdate = options.onUpdate || (() => {});
        this.projects = [];
        this.bookings = [];
        this.leads = [];
        this.profile = null;
        this.loading = false;
    }

    _getStoredEmail() {
        return localStorage.getItem('aidynamic_client_email') || '';
    }

    _setStoredEmail(email) {
        localStorage.setItem('aidynamic_client_email', email);
        this.clientEmail = email;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/rest/v1/${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: { ...this.headers, ...options.headers }
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Supabase error:', error);
            throw new Error(error || 'Request failed');
        }

        // Handle empty responses (e.g., 204 No Content)
        const text = await response.text();
        return text ? JSON.parse(text) : [];
    }

    /* ── Projects ── */

    async fetchProjects(email = null) {
        this.loading = true;
        try {
            const clientEmail = email || this.clientEmail;
            let query = 'aidynamic_projects?order=created_at.desc';
            if (clientEmail && !this.isAdmin) {
                query += `&client_email=eq.${encodeURIComponent(clientEmail)}`;
            }
            this.projects = await this.request(query);
            return this.projects;
        } finally {
            this.loading = false;
        }
    }

    async updateProjectStatus(id, status) {
        const validStatuses = ['active', 'planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }
        const result = await this.request(`aidynamic_projects?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, updated_at: new Date().toISOString() })
        });
        const idx = this.projects.findIndex(p => p.id === id);
        if (idx !== -1) this.projects[idx].status = status;
        this.onUpdate();
        return result[0];
    }

    async updateProjectProgress(id, progress) {
        const result = await this.request(`aidynamic_projects?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ progress, updated_at: new Date().toISOString() })
        });
        const idx = this.projects.findIndex(p => p.id === id);
        if (idx !== -1) this.projects[idx].progress = progress;
        this.onUpdate();
        return result[0];
    }

    /* ── Bookings ── */

    async fetchBookings(email = null) {
        this.loading = true;
        try {
            const clientEmail = email || this.clientEmail;
            let query = 'aidynamic_bookings?order=created_at.desc';
            if (clientEmail && !this.isAdmin) {
                query += `&email=eq.${encodeURIComponent(clientEmail)}`;
            }
            this.bookings = await this.request(query);
            return this.bookings;
        } finally {
            this.loading = false;
        }
    }

    async createBooking(bookingData) {
        const result = await this.request('aidynamic_bookings', {
            method: 'POST',
            body: JSON.stringify({
                ...bookingData,
                status: 'confirmed',
                created_at: new Date().toISOString()
            })
        });
        this.bookings.unshift(result[0]);
        this.onUpdate();
        return result[0];
    }

    async cancelBooking(id) {
        const result = await this.request(`aidynamic_bookings?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'cancelled', updated_at: new Date().toISOString() })
        });
        const idx = this.bookings.findIndex(b => b.id === id);
        if (idx !== -1) this.bookings[idx].status = 'cancelled';
        this.onUpdate();
        return result[0];
    }

    /* ── Leads (Admin only) ── */

    async fetchLeads(filter = {}) {
        this.loading = true;
        try {
            let query = 'aidynamic_leads?order=created_at.desc';
            if (filter.status) query += `&status=eq.${encodeURIComponent(filter.status)}`;
            if (filter.source) query += `&source=eq.${encodeURIComponent(filter.source)}`;
            if (filter.search) {
                query += `&or=(name.ilike.*${encodeURIComponent(filter.search)}*,email.ilike.*${encodeURIComponent(filter.search)}*,company.ilike.*${encodeURIComponent(filter.search)}*)`;
            }
            if (filter.limit) query += `&limit=${filter.limit}`;
            this.leads = await this.request(query);
            return this.leads;
        } finally {
            this.loading = false;
        }
    }

    async updateLeadStatus(id, status) {
        const validStatuses = ['new', 'contacted', 'qualified', 'converted', 'lost'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }
        const result = await this.request(`aidynamic_leads?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ status, updated_at: new Date().toISOString() })
        });
        const idx = this.leads.findIndex(l => l.id === id);
        if (idx !== -1) this.leads[idx].status = status;
        this.onUpdate();
        return result[0];
    }

    async bulkUpdateLeads(ids, status) {
        const results = [];
        for (const id of ids) {
            try {
                results.push(await this.updateLeadStatus(id, status));
            } catch (e) {
                results.push({ id, error: e.message });
            }
        }
        return results;
    }

    /* ── Profile ── */

    async fetchProfile(email = null) {
        const clientEmail = email || this.clientEmail;
        if (!clientEmail) return null;
        try {
            const profiles = await this.request(
                `aidynamic_profiles?email=eq.${encodeURIComponent(clientEmail)}&limit=1`
            );
            this.profile = profiles[0] || null;
            return this.profile;
        } catch (e) {
            console.warn('Profile fetch failed:', e.message);
            return null;
        }
    }

    async updateProfile(id, data) {
        const result = await this.request(`aidynamic_profiles?id=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ ...data, updated_at: new Date().toISOString() })
        });
        if (this.profile && this.profile.id === id) {
            this.profile = { ...this.profile, ...data };
        }
        this.onUpdate();
        return result[0];
    }

    /* ── Stats ── */

    getClientStats() {
        const totalProjects = this.projects.length;
        const active = this.projects.filter(p => p.status === 'active' || p.status === 'in_progress').length;
        const completed = this.projects.filter(p => p.status === 'completed').length;
        const consultations = this.bookings.length;
        const upcomingBookings = this.bookings.filter(b => {
            if (b.status === 'cancelled') return false;
            const date = new Date(b.booking_date || b.created_at);
            return date >= new Date();
        });

        return { totalProjects, active, completed, consultations, upcomingBookings: upcomingBookings.length };
    }

    getAdminStats() {
        const newLeads = this.leads.filter(l => l.status === 'new').length;
        const activeProjects = this.projects.filter(p =>
            p.status === 'active' || p.status === 'in_progress'
        ).length;
        const totalClients = new Set(this.projects.map(p => p.client_email).filter(Boolean)).size;
        const thisWeekStart = new Date();
        thisWeekStart.setDate(thisWeekStart.getDate() - 7);
        const consultationsThisWeek = this.bookings.filter(b => {
            const date = new Date(b.created_at);
            return date >= thisWeekStart;
        }).length;

        return { newLeads, activeProjects, totalClients, consultationsThisWeek };
    }

    /* ── Formatting ── */

    static formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    }

    static formatDateTime(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    }

    static formatCurrency(value) {
        if (!value && value !== 0) return '-';
        return '$' + Number(value).toLocaleString('en-US');
    }

    static statusColor(status) {
        const map = {
            active: '#00FF88',
            in_progress: '#3b82f6',
            planning: '#FFC107',
            on_hold: '#FF8C00',
            completed: '#00FF88',
            cancelled: '#FF4757',
            new: '#3b82f6',
            contacted: '#06b6d4',
            qualified: '#00FF88',
            converted: '#8b5cf6',
            lost: '#64748b',
            confirmed: '#00FF88',
            pending: '#FFC107'
        };
        return map[status] || '#94a3b8';
    }

    static statusLabel(status) {
        return status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-';
    }
}

/* ───────────────────────────────────────────────
   AdminAuth — PIN-based authentication
   ─────────────────────────────────────────────── */
class AdminAuth {
    constructor(pin = '3050') {
        this.pin = pin;
        this.storageKey = 'aidynamic_admin_auth';
        this.sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
    }

    isAuthenticated() {
        const session = localStorage.getItem(this.storageKey);
        if (!session) return false;
        try {
            const { timestamp } = JSON.parse(session);
            return (Date.now() - timestamp) < this.sessionDuration;
        } catch {
            return false;
        }
    }

    authenticate(inputPin) {
        if (inputPin === this.pin) {
            localStorage.setItem(this.storageKey, JSON.stringify({ timestamp: Date.now() }));
            return true;
        }
        return false;
    }

    logout() {
        localStorage.removeItem(this.storageKey);
    }
}

/* ───────────────────────────────────────────────
   Toast — Notification system
   ─────────────────────────────────────────────── */
class Toast {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            display: flex; flex-direction: column; gap: 8px;
            pointer-events: none;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info') {
        const el = document.createElement('div');
        const colors = {
            info:    { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', icon: '\u2139', color: '#3b82f6' },
            success: { bg: 'rgba(0,255,136,0.15)', border: 'rgba(0,255,136,0.4)', icon: '\u2713', color: '#00FF88' },
            error:   { bg: 'rgba(255,71,87,0.15)', border: 'rgba(255,71,87,0.4)', icon: '\u2717', color: '#FF4757' },
            warning: { bg: 'rgba(255,193,7,0.15)', border: 'rgba(255,193,7,0.4)', icon: '!', color: '#FFC107' }
        };
        const c = colors[type] || colors.info;

        el.style.cssText = `
            background: ${c.bg}; border: 1.5px solid ${c.border};
            border-radius: 8px; padding: 14px 20px;
            color: ${c.color}; font-size: 14px; font-weight: 500;
            display: flex; align-items: center; gap: 10px;
            animation: toastSlide 0.3s ease; pointer-events: auto;
            backdrop-filter: blur(10px); max-width: 400px;
        `;
        el.innerHTML = `<span style="font-size:16px;font-weight:700;">${c.icon}</span> ${message}`;

        this.container.appendChild(el);
        setTimeout(() => {
            el.style.animation = 'toastFade 0.3s ease forwards';
            setTimeout(() => el.remove(), 300);
        }, 4000);
    }
}

/* ───────────────────────────────────────────────
   Modal — Reusable modal system
   ─────────────────────────────────────────────── */
class Modal {
    constructor(options = {}) {
        this.id = options.id || 'modal-' + Math.random().toString(36).slice(2, 8);
        this.onClose = options.onClose || (() => {});
        this._create();
    }

    _create() {
        const existing = document.getElementById(this.id);
        if (existing) existing.remove();

        this.el = document.createElement('div');
        this.el.id = this.id;
        this.el.style.cssText = `
            position: fixed; inset: 0; z-index: 9999;
            display: none; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
            padding: 20px;
        `;
        this.el.innerHTML = `
            <div class="modal-content" style="
                background: #0f1729; border: 1.5px solid rgba(59,130,246,0.2);
                border-radius: 12px; max-width: 600px; width: 100%;
                max-height: 90vh; overflow-y: auto;
                animation: modalSlide 0.2s ease;
            ">
                <div class="modal-header" style="
                    padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06);
                    display: flex; justify-content: space-between; align-items: center;
                ">
                    <h3 class="modal-title" style="font-family:'Space Grotesk',sans-serif;font-size:1.1rem;font-weight:700;color:#fff;"></h3>
                    <button class="modal-close" style="
                        background: none; border: none; color: rgba(255,255,255,0.4);
                        font-size: 20px; cursor: pointer; padding: 4px;
                    ">\u00D7</button>
                </div>
                <div class="modal-body" style="padding: 24px;"></div>
            </div>
        `;

        this.el.querySelector('.modal-close').addEventListener('click', () => this.close());
        this.el.addEventListener('click', (e) => {
            if (e.target === this.el) this.close();
        });

        document.body.appendChild(this.el);
    }

    open(title, content) {
        this.el.querySelector('.modal-title').textContent = title;
        const body = this.el.querySelector('.modal-body');
        body.innerHTML = '';
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }
        this.el.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.el.style.display = 'none';
        document.body.style.overflow = '';
        this.onClose();
    }
}

/* ───────────────────────────────────────────────
   CSS Animations (injected once)
   ─────────────────────────────────────────────── */
(function injectStyles() {
    if (document.getElementById('aidynamic-dashboard-styles')) return;
    const style = document.createElement('style');
    style.id = 'aidynamic-dashboard-styles';
    style.textContent = `
        @keyframes toastSlide {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastFade {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(100%); }
        }
        @keyframes modalSlide {
            from { opacity: 0; transform: translateY(-20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        .skeleton {
            background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
})();

// Expose globally
window.AIDynamicApp = AIDynamicApp;
window.AdminAuth = AdminAuth;
window.Toast = Toast;
window.Modal = Modal;
