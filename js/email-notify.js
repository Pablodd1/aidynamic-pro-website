/**
 * AI Dynamic Pro — Email Notification Module
 * Uses Brevo (Sendinblue) Transactional Email API
 *
 * SETUP:
 * 1. Set your Brevo API key: window.BREVO_API_KEY = 'your-key-here'
 * 2. Include in your HTML:
 *    <script src="js/email-notify.js"></script>
 *
 * No external dependencies — native fetch() only.
 */

(function(global) {
    'use strict';

    // ═══════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════
    var CONFIG = {
        BREVO_API_URL: 'https://api.brevo.com/v3/smtp/email',
        API_KEY: global.BREVO_API_KEY || '',
        FROM_EMAIL: 'jasmel@medicalbillingmb.com',
        FROM_NAME: 'AI Dynamic Pro',
        NOTIFY_EMAIL: 'jasmelacosta@gmail.com',
        NOTIFY_NAME: 'Jasmel Acosta',
        REPLY_TO: 'jasmel@medicalbillingmb.com',
        WEBSITE_URL: 'https://aidynamic.pro'
    };

    // Branding
    var BRAND = {
        accent: '#3b82f6',
        accentDark: '#1d4ed8',
        accentGlow: 'rgba(59, 130, 246, 0.4)',
        cyan: '#06b6d4',
        midnight: '#0a0e1a',
        deepBlue: '#0f1729',
        textPrimary: '#e2e8f0',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        headingFont: "'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        bodyFont: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    };

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════
    function escapeHtml(text) {
        if (!text) return '';
        if (typeof document !== 'undefined' && document.createElement) {
            var div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function fmtDate(dateStr) {
        if (!dateStr) return 'TBD';
        try {
            var d = new Date(dateStr);
            return d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    }

    function fmtTime(timeStr) {
        if (!timeStr) return '';
        try {
            var d = new Date('2000-01-01T' + timeStr);
            return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        } catch (e) {
            return timeStr;
        }
    }

    function fmtDateTime(isoStr) {
        if (!isoStr) return 'TBD';
        try {
            var d = new Date(isoStr);
            return d.toLocaleString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            });
        } catch (e) {
            return isoStr;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // EMAIL WRAPPER — Dark theme with electric blue accents
    // ═══════════════════════════════════════════════════════════
    function wrapEmail(title, accent, content) {
        accent = accent || BRAND.accent;
        return '<!DOCTYPE html>' +
            '<html lang="en">' +
            '<head>' +
            '<meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<title>' + escapeHtml(title) + '</title>' +
            '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">' +
            '<style>' +
            'body,table,td,p,a,li,blockquote{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}' +
            'table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}' +
            'img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}' +
            '@media screen and (max-width:600px){' +
            '.container{width:100%!important;max-width:100%!important}' +
            '.content-padding{padding:20px!important}' +
            '.hide-mobile{display:none!important}' +
            '.stack-mobile{display:block!important;width:100%!important}' +
            '.stat-box{margin-bottom:12px!important}' +
            '}' +
            '</style>' +
            '</head>' +
            '<body style="margin:0;padding:0;background-color:#0a0e1a;font-family:' + BRAND.bodyFont + '">' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
            '<tr><td align="center" style="padding:32px 16px;">' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="max-width:600px;width:100%;background:#0f1729;border-radius:12px;overflow:hidden;box-shadow:0 0 40px rgba(59,130,246,0.08),0 4px 24px rgba(0,0,0,0.4);border:1px solid rgba(59,130,246,0.1)">' +
            // Header
            '<tr><td style="background:linear-gradient(135deg,#0a0e1a 0%,#0f1729 50%,#1a1f3a 100%);padding:32px;text-align:center;border-bottom:1px solid rgba(59,130,246,0.15)">' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
            '<tr><td align="center">' +
            '<div style="display:inline-block;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:10px;padding:10px 20px">' +
            '<span style="color:#3b82f6;font-family:' + BRAND.headingFont + ';font-size:22px;font-weight:700;letter-spacing:-0.02em">AI Dynamic</span>' +
            '<span style="color:#06b6d4;font-family:' + BRAND.headingFont + ';font-size:22px;font-weight:700">Pro</span>' +
            '</div>' +
            '</td></tr>' +
            '<tr><td align="center" style="padding-top:10px">' +
            '<span style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.2em;font-family:' + BRAND.bodyFont + '">AI Automation for Small Business</span>' +
            '</td></tr>' +
            '</table>' +
            '</td></tr>' +
            // Content
            '<tr><td class="content-padding" style="padding:36px 32px">' + content + '</td></tr>' +
            // Divider
            '<tr><td style="padding:0 32px"><div style="height:1px;background:linear-gradient(90deg,transparent,rgba(59,130,246,0.3),transparent)"></div></td></tr>' +
            // Footer
            '<tr><td style="padding:28px 32px;text-align:center">' +
            '<p style="margin:0 0 8px;color:#64748b;font-size:12px;line-height:1.6;font-family:' + BRAND.bodyFont + '"><strong style="color:#94a3b8">AI Dynamic Pro</strong> — AI Automation That Works While You Sleep</p>' +
            '<p style="margin:0 0 12px;color:#475569;font-size:11px;line-height:1.5;font-family:' + BRAND.bodyFont + '">14-day deployment. Free strategy call.</p>' +
            '<p style="margin:0;color:#334155;font-size:10px;font-family:' + BRAND.bodyFont + '">This is an automated notification. Please do not reply directly to this email.</p>' +
            '<p style="margin:12px 0 0"><a href="' + CONFIG.WEBSITE_URL + '" style="color:#3b82f6;font-size:12px;text-decoration:none;font-weight:500;font-family:' + BRAND.bodyFont + '">aidynamic.pro →</a></p>' +
            '</td></tr>' +
            '</table>' +
            '</td></tr>' +
            '</table>' +
            '</body>' +
            '</html>';
    }

    // ═══════════════════════════════════════════════════════════
    // TEMPLATES
    // ═══════════════════════════════════════════════════════════

    // 1. Consultation Booked — Admin notification
    function consultationBookedTemplate(data) {
        var accent = BRAND.accent;
        var dateTime = fmtDateTime(data.datetime) || (fmtDate(data.date) + ' at ' + fmtTime(data.time));

        var content =
            '<h1 style="margin:0 0 8px;color:#e2e8f0;font-size:24px;font-weight:700;font-family:' + BRAND.headingFont + '">🤖 New AI Consultation Booked</h1>' +
            '<p style="margin:0 0 24px;color:#94a3b8;font-size:14px;font-family:' + BRAND.bodyFont + '">A client has scheduled a free AI strategy consultation through your website.</p>' +
            '<div style="display:inline-block;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.25);border-radius:20px;padding:6px 18px;margin-bottom:24px">' +
            '<span style="color:#3b82f6;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-family:' + BRAND.bodyFont + '">✨ Free Strategy Call</span>' +
            '</div>' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:rgba(15,23,41,0.8);border-radius:10px;margin-bottom:24px;border:1px solid rgba(59,130,246,0.1)">' +
            '<tr><td style="padding:24px">' +
            '<h2 style="margin:0 0 20px;color:#3b82f6;font-size:16px;font-weight:600;font-family:' + BRAND.headingFont + ';text-transform:uppercase;letter-spacing:0.05em">Client Information</h2>' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Name</span>' +
            '<span style="color:#e2e8f0;font-size:14px;font-weight:500;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.name || 'Not provided') + '</span>' +
            '</td></tr>' +
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Email</span>' +
            '<a href="mailto:' + escapeHtml(data.email || '') + '" style="color:#3b82f6;font-size:14px;text-decoration:none;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.email || 'Not provided') + '</a>' +
            '</td></tr>' +
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Company</span>' +
            '<span style="color:#e2e8f0;font-size:14px;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.company || 'Not provided') + '</span>' +
            '</td></tr>' +
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Consultation Type</span>' +
            '<span style="color:#06b6d4;font-size:14px;font-weight:500;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.consultation_type || 'AI Strategy Call') + '</span>' +
            '</td></tr>' +
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Date &amp; Time</span>' +
            '<span style="color:#e2e8f0;font-size:14px;font-weight:600;font-family:' + BRAND.bodyFont + '">' + dateTime + '</span>' +
            '</td></tr>' +
            '<tr><td style="padding:10px 0">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Submitted</span>' +
            '<span style="color:#94a3b8;font-size:12px;font-family:' + BRAND.bodyFont + '">' + (data.submitted_at ? fmtDateTime(data.submitted_at) : new Date().toLocaleString('en-US')) + '</span>' +
            '</td></tr>' +
            '</table>' +
            '</td></tr>' +
            '</table>' +
            '<h3 style="margin:0 0 12px;color:#e2e8f0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-family:' + BRAND.headingFont + '">Message</h3>' +
            '<div style="background:rgba(10,14,26,0.6);border:1px solid rgba(59,130,246,0.1);border-radius:8px;padding:20px;margin-bottom:24px">' +
            '<p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.7;font-family:' + BRAND.bodyFont + ';font-style:italic">"' + escapeHtml(data.message || 'No additional message provided.') + '"</p>' +
            '</div>' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
            '<tr><td align="center" style="padding:16px 0">' +
            '<a href="mailto:' + escapeHtml(data.email || '') + '" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;font-family:' + BRAND.bodyFont + '">Reply to Client →</a>' +
            '</td></tr>' +
            '</table>';

        return wrapEmail('New AI Consultation — ' + escapeHtml(data.name || 'Client'), accent, content);
    }

    // 2. Contact Form Submitted — Admin notification
    function contactFormTemplate(data) {
        var accent = BRAND.accent;

        var contactRows =
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Name</span>' +
            '<span style="color:#e2e8f0;font-size:14px;font-weight:500;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.name || 'Anonymous') + '</span>' +
            '</td></tr>' +
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Email</span>' +
            '<a href="mailto:' + escapeHtml(data.email || '') + '" style="color:#3b82f6;font-size:14px;text-decoration:none;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.email || 'Not provided') + '</a>' +
            '</td></tr>';

        if (data.company) {
            contactRows +=
                '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
                '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Company</span>' +
                '<span style="color:#e2e8f0;font-size:14px;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.company) + '</span>' +
                '</td></tr>';
        }

        if (data.phone) {
            contactRows +=
                '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
                '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Phone</span>' +
                '<span style="color:#e2e8f0;font-size:14px;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.phone) + '</span>' +
                '</td></tr>';
        }

        contactRows +=
            '<tr><td style="padding:10px 0">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Service Interest</span>' +
            '<span style="color:#06b6d4;font-size:14px;font-weight:500;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.service_interest || 'General Inquiry') + '</span>' +
            '</td></tr>';

        var content =
            '<h1 style="margin:0 0 8px;color:#e2e8f0;font-size:24px;font-weight:700;font-family:' + BRAND.headingFont + '">📧 New Contact Form Submission</h1>' +
            '<p style="margin:0 0 24px;color:#94a3b8;font-size:14px;font-family:' + BRAND.bodyFont + '">Someone reached out through the AI Dynamic Pro contact form.</p>' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:rgba(15,23,41,0.8);border-radius:10px;margin-bottom:24px;border:1px solid rgba(59,130,246,0.1)">' +
            '<tr><td style="padding:24px">' +
            '<h2 style="margin:0 0 16px;color:#3b82f6;font-size:16px;font-weight:600;font-family:' + BRAND.headingFont + ';text-transform:uppercase;letter-spacing:0.05em">Contact Details</h2>' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
            contactRows +
            '</table>' +
            '</td></tr>' +
            '</table>' +
            '<h3 style="margin:0 0 12px;color:#e2e8f0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-family:' + BRAND.headingFont + '">Message</h3>' +
            '<div style="background:rgba(10,14,26,0.6);border:1px solid rgba(59,130,246,0.1);border-radius:8px;padding:20px;margin-bottom:24px">' +
            '<p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.7;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.message || 'No message provided.').replace(/\n/g, '<br>') + '</p>' +
            '</div>' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
            '<tr><td align="center" style="padding:8px 0 16px">' +
            '<a href="mailto:' + escapeHtml(data.email || '') + '" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:13px;font-weight:600;font-family:' + BRAND.bodyFont + ';margin:0 4px">Reply via Email →</a>' +
            '<a href="' + CONFIG.WEBSITE_URL + '" style="display:inline-block;background:transparent;color:#3b82f6;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:13px;font-weight:600;font-family:' + BRAND.bodyFont + ';border:1px solid rgba(59,130,246,0.3);margin:0 4px">View Site →</a>' +
            '</td></tr>' +
            '</table>';

        return wrapEmail('New Contact Form — ' + escapeHtml(data.name || 'Submission'), accent, content);
    }

    // 3. New Client Signup — Admin notification
    function clientSignupTemplate(data) {
        var accent = BRAND.accent;
        var signupDate = fmtDateTime(data.signup_date) || new Date().toLocaleString('en-US');

        var content =
            '<h1 style="margin:0 0 8px;color:#e2e8f0;font-size:24px;font-weight:700;font-family:' + BRAND.headingFont + '">✨ New Client Signup</h1>' +
            '<p style="margin:0 0 24px;color:#94a3b8;font-size:14px;font-family:' + BRAND.bodyFont + '">A new client just created an account on AI Dynamic Pro.</p>' +
            '<div style="display:inline-block;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.25);border-radius:20px;padding:6px 18px;margin-bottom:24px">' +
            '<span style="color:#22c55e;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-family:' + BRAND.bodyFont + '">🎉 New Account Created</span>' +
            '</div>' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:rgba(15,23,41,0.8);border-radius:10px;margin-bottom:24px;border:1px solid rgba(59,130,246,0.1)">' +
            '<tr><td style="padding:24px">' +
            '<h2 style="margin:0 0 20px;color:#3b82f6;font-size:16px;font-weight:600;font-family:' + BRAND.headingFont + ';text-transform:uppercase;letter-spacing:0.05em">Account Details</h2>' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Name</span>' +
            '<span style="color:#e2e8f0;font-size:14px;font-weight:500;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.name || 'Not provided') + '</span>' +
            '</td></tr>' +
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Email</span>' +
            '<a href="mailto:' + escapeHtml(data.email || '') + '" style="color:#3b82f6;font-size:14px;text-decoration:none;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.email || 'Not provided') + '</a>' +
            '</td></tr>' +
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Role</span>' +
            '<span style="color:#e2e8f0;font-size:14px;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.role || 'Not specified') + '</span>' +
            '</td></tr>' +
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Company</span>' +
            '<span style="color:#e2e8f0;font-size:14px;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.company || 'Not provided') + '</span>' +
            '</td></tr>' +
            '<tr><td style="padding:10px 0">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Signup Date</span>' +
            '<span style="color:#94a3b8;font-size:13px;font-family:' + BRAND.bodyFont + '">' + signupDate + '</span>' +
            '</td></tr>' +
            '</table>' +
            '</td></tr>' +
            '</table>' +
            '<h3 style="margin:0 0 12px;color:#e2e8f0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-family:' + BRAND.headingFont + '">Quick Actions</h3>' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
            '<tr><td align="center" style="padding:8px 0 16px">' +
            '<a href="mailto:' + escapeHtml(data.email || '') + '" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:13px;font-weight:600;font-family:' + BRAND.bodyFont + ';margin:0 4px">Welcome Email →</a>' +
            '<a href="' + CONFIG.WEBSITE_URL + '/admin/clients" style="display:inline-block;background:transparent;color:#3b82f6;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:13px;font-weight:600;font-family:' + BRAND.bodyFont + ';border:1px solid rgba(59,130,246,0.3);margin:0 4px">View Client →</a>' +
            '</td></tr>' +
            '</table>';

        return wrapEmail('New Client Signup — ' + escapeHtml(data.name || 'Account'), accent, content);
    }

    // 4. Project Status Update — Client-facing
    function projectUpdateTemplate(data) {
        var accent = BRAND.accent;
        var statusColor = BRAND.accent;
        var statusBg = 'rgba(59,130,246,0.1)';
        var statusBorder = 'rgba(59,130,246,0.25)';

        var statusLower = (data.status || '').toLowerCase();
        if (statusLower.indexOf('complete') !== -1 || statusLower.indexOf('done') !== -1 || statusLower.indexOf('live') !== -1) {
            statusColor = BRAND.success;
            statusBg = 'rgba(34,197,94,0.1)';
            statusBorder = 'rgba(34,197,94,0.25)';
        } else if (statusLower.indexOf('hold') !== -1 || statusLower.indexOf('block') !== -1 || statusLower.indexOf('issue') !== -1) {
            statusColor = BRAND.danger;
            statusBg = 'rgba(239,68,68,0.1)';
            statusBorder = 'rgba(239,68,68,0.25)';
        } else if (statusLower.indexOf('review') !== -1 || statusLower.indexOf('test') !== -1) {
            statusColor = BRAND.warning;
            statusBg = 'rgba(245,158,11,0.1)';
            statusBorder = 'rgba(245,158,11,0.25)';
        }

        var content =
            '<h1 style="margin:0 0 8px;color:#e2e8f0;font-size:24px;font-weight:700;font-family:' + BRAND.headingFont + '">🚀 Project Update</h1>' +
            '<p style="margin:0 0 24px;color:#94a3b8;font-size:14px;font-family:' + BRAND.bodyFont + '">Here is the latest update on your AI automation project.</p>' +
            '<div style="background:' + statusBg + ';border:1px solid ' + statusBorder + ';border-radius:20px;padding:6px 18px;margin-bottom:24px;display:inline-block">' +
            '<span style="color:' + statusColor + ';font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-family:' + BRAND.bodyFont + '">Status: ' + escapeHtml(data.status || 'In Progress') + '</span>' +
            '</div>' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:rgba(15,23,41,0.8);border-radius:10px;margin-bottom:24px;border:1px solid rgba(59,130,246,0.1)">' +
            '<tr><td style="padding:24px">' +
            '<h2 style="margin:0 0 4px;color:#3b82f6;font-size:18px;font-weight:700;font-family:' + BRAND.headingFont + '">' + escapeHtml(data.project_name || 'Your Project') + '</h2>' +
            '<p style="margin:0 0 16px;color:#64748b;font-size:13px;font-family:' + BRAND.bodyFont + '">Updated ' + (data.updated_at ? fmtDateTime(data.updated_at) : new Date().toLocaleDateString('en-US')) + '</p>' +
            '</td></tr>' +
            '</table>' +
            '<h3 style="margin:0 0 12px;color:#e2e8f0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-family:' + BRAND.headingFont + '">Update Notes</h3>' +
            '<div style="background:rgba(10,14,26,0.6);border:1px solid rgba(59,130,246,0.1);border-radius:8px;padding:20px;margin-bottom:24px">' +
            '<p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.7;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.notes || 'No additional notes.').replace(/\n/g, '<br>') + '</p>' +
            '</div>';

        if (data.next_steps) {
            content +=
                '<h3 style="margin:0 0 12px;color:#e2e8f0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-family:' + BRAND.headingFont + '">Next Steps</h3>' +
                '<div style="background:rgba(10,14,26,0.6);border:1px solid rgba(59,130,246,0.1);border-radius:8px;padding:20px;margin-bottom:24px">' +
                '<p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.7;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.next_steps).replace(/\n/g, '<br>') + '</p>' +
                '</div>';
        }

        content +=
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
            '<tr><td align="center" style="padding:16px 0">' +
            '<a href="' + (data.project_url || CONFIG.WEBSITE_URL + '/dashboard') + '" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;font-family:' + BRAND.bodyFont + '">View Project Dashboard →</a>' +
            '</td></tr>' +
            '</table>' +
            '<p style="margin:16px 0 0;color:#64748b;font-size:12px;text-align:center;font-family:' + BRAND.bodyFont + '">' +
            'Questions? Reply to this email or reach us at <a href="mailto:' + CONFIG.REPLY_TO + '" style="color:#3b82f6;text-decoration:none">' + CONFIG.REPLY_TO + '</a>' +
            '</p>';

        return wrapEmail('Project Update — ' + escapeHtml(data.project_name || 'Your Project'), accent, content);
    }

    // 5. Consultation Reminder — Client-facing (24h before)
    function consultationReminderTemplate(data) {
        var accent = BRAND.accent;
        var dateTime = fmtDateTime(data.datetime) || (fmtDate(data.date) + ' at ' + fmtTime(data.time));

        var content =
            '<h1 style="margin:0 0 8px;color:#e2e8f0;font-size:24px;font-weight:700;font-family:' + BRAND.headingFont + '">⏰ Reminder: AI Consultation Tomorrow</h1>' +
            '<p style="margin:0 0 24px;color:#94a3b8;font-size:14px;font-family:' + BRAND.bodyFont + '">Your free AI strategy consultation with AI Dynamic Pro is coming up soon.</p>' +
            '<div style="display:inline-block;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.25);border-radius:20px;padding:6px 18px;margin-bottom:24px">' +
            '<span style="color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-family:' + BRAND.bodyFont + '">📅 24 Hours Away</span>' +
            '</div>' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:rgba(15,23,41,0.8);border-radius:10px;margin-bottom:24px;border:1px solid rgba(59,130,246,0.1)">' +
            '<tr><td style="padding:24px">' +
            '<h2 style="margin:0 0 20px;color:#3b82f6;font-size:16px;font-weight:600;font-family:' + BRAND.headingFont + ';text-transform:uppercase;letter-spacing:0.05em">Consultation Details</h2>' +
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Date</span>' +
            '<span style="color:#e2e8f0;font-size:14px;font-weight:600;font-family:' + BRAND.bodyFont + '">' + dateTime + '</span>' +
            '</td></tr>' +
            '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Type</span>' +
            '<span style="color:#06b6d4;font-size:14px;font-weight:500;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.consultation_type || 'AI Strategy Call') + '</span>' +
            '</td></tr>' +
            '<tr><td style="padding:10px 0">' +
            '<span style="color:#64748b;font-size:12px;display:inline-block;width:120px;font-family:' + BRAND.bodyFont + '">Duration</span>' +
            '<span style="color:#e2e8f0;font-size:14px;font-family:' + BRAND.bodyFont + '">30 minutes</span>' +
            '</td></tr>' +
            '</table>' +
            '</td></tr>' +
            '</table>';

        if (data.meeting_link) {
            content +=
                '<h3 style="margin:0 0 12px;color:#e2e8f0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-family:' + BRAND.headingFont + '">Meeting Link</h3>' +
                '<div style="background:rgba(10,14,26,0.6);border:1px solid rgba(59,130,246,0.1);border-radius:8px;padding:16px;margin-bottom:24px;text-align:center">' +
                '<a href="' + escapeHtml(data.meeting_link) + '" style="color:#3b82f6;font-size:14px;text-decoration:none;font-weight:600;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.meeting_link) + '</a>' +
                '</div>';
        }

        if (data.prep_notes) {
            content +=
                '<h3 style="margin:0 0 12px;color:#e2e8f0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-family:' + BRAND.headingFont + '">Preparation Notes</h3>' +
                '<div style="background:rgba(10,14,26,0.6);border:1px solid rgba(59,130,246,0.1);border-radius:8px;padding:20px;margin-bottom:24px">' +
                '<p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.7;font-family:' + BRAND.bodyFont + '">' + escapeHtml(data.prep_notes).replace(/\n/g, '<br>') + '</p>' +
                '</div>';
        } else {
            content +=
                '<h3 style="margin:0 0 12px;color:#e2e8f0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-family:' + BRAND.headingFont + '">How to Prepare</h3>' +
                '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:24px">' +
                '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
                '<span style="color:#3b82f6;font-weight:700;margin-right:8px">1.</span>' +
                '<span style="color:#94a3b8;font-size:14px;font-family:' + BRAND.bodyFont + '">Come with 2–3 pain points you want AI to solve</span>' +
                '</td></tr>' +
                '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
                '<span style="color:#3b82f6;font-weight:700;margin-right:8px">2.</span>' +
                '<span style="color:#94a3b8;font-size:14px;font-family:' + BRAND.bodyFont + '">Have your current workflow or process notes ready</span>' +
                '</td></tr>' +
                '<tr><td style="padding:10px 0;border-bottom:1px solid rgba(59,130,246,0.08)">' +
                '<span style="color:#3b82f6;font-weight:700;margin-right:8px">3.</span>' +
                '<span style="color:#94a3b8;font-size:14px;font-family:' + BRAND.bodyFont + '">Be ready to discuss your budget and timeline</span>' +
                '</td></tr>' +
                '<tr><td style="padding:10px 0">' +
                '<span style="color:#3b82f6;font-weight:700;margin-right:8px">4.</span>' +
                '<span style="color:#94a3b8;font-size:14px;font-family:' + BRAND.bodyFont + '">We will share a custom AI roadmap at the end of the call</span>' +
                '</td></tr>' +
                '</table>';
        }

        content +=
            '<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">' +
            '<tr><td align="center" style="padding:16px 0">' +
            '<a href="' + (data.meeting_link || CONFIG.WEBSITE_URL) + '" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#06b6d4);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;font-family:' + BRAND.bodyFont + '">Join Meeting →</a>' +
            '</td></tr>' +
            '</table>' +
            '<p style="margin:16px 0 0;color:#64748b;font-size:12px;text-align:center;font-family:' + BRAND.bodyFont + '">' +
            'Need to reschedule? Reply to this email or call us at <a href="tel:+17866432099" style="color:#3b82f6;text-decoration:none">+1 786-643-2099</a>' +
            '</p>';

        return wrapEmail('Reminder: AI Consultation Tomorrow — AI Dynamic Pro', accent, content);
    }

    // ═══════════════════════════════════════════════════════════
    // CORE API
    // ═══════════════════════════════════════════════════════════

    var TEMPLATES = {
        consultation_booked: consultationBookedTemplate,
        contact_form: contactFormTemplate,
        client_signup: clientSignupTemplate,
        project_update: projectUpdateTemplate,
        consultation_reminder: consultationReminderTemplate
    };

    // Subject line mapping
    var SUBJECTS = {
        consultation_booked: function(d) {
            return '\ud83e\udd16 New AI Consultation Booked \u2014 ' + (d.name || 'Client');
        },
        contact_form: function(d) {
            return '\ud83d\udce7 New Contact Form \u2014 ' + (d.name || 'Submission');
        },
        client_signup: function(d) {
            return '\u2728 New Client Signup \u2014 ' + (d.name || 'Account');
        },
        project_update: function(d) {
            return '\ud83d\ude80 Project Update \u2014 ' + (d.project_name || 'Your Project');
        },
        consultation_reminder: function(d) {
            return '\u23f0 Reminder: AI Consultation Tomorrow';
        }
    };

    // Notification queue for resilience
    var notificationQueue = [];
    var isProcessingQueue = false;

    function enqueue(item) {
        notificationQueue.push(item);
        if (!isProcessingQueue) {
            processQueue();
        }
    }

    async function processQueue() {
        if (notificationQueue.length === 0) {
            isProcessingQueue = false;
            return;
        }
        isProcessingQueue = true;
        var item = notificationQueue.shift();
        try {
            var result = await sendEmailRaw(item.templateName, item.data, item.options);
            if (item.callback) {
                item.callback(result);
            }
        } catch (err) {
            console.error('[EmailNotify] Queue processing error:', err.message);
            if (item.callback) {
                item.callback({ success: false, error: err.message });
            }
        }
        // Small delay between sends to avoid rate limiting
        setTimeout(processQueue, 200);
    }

    async function sendEmailRaw(templateName, data, options) {
        options = options || {};
        var templateFn = TEMPLATES[templateName];
        if (!templateFn) {
            console.error('[EmailNotify] Unknown template: "' + templateName + '". Available: ' + Object.keys(TEMPLATES).join(', '));
            return { success: false, error: 'Unknown template: ' + templateName };
        }

        var apiKey = options.apiKey || CONFIG.API_KEY || global.BREVO_API_KEY;
        if (!apiKey) {
            console.warn('[EmailNotify] No Brevo API key configured. Set window.BREVO_API_KEY before loading this script.');
            console.warn('[EmailNotify] Get your API key at: https://app.brevo.com/settings/keys/api');
            return { success: false, error: 'No API key configured' };
        }

        var htmlContent = templateFn(data);
        var isAdminNotification = ['consultation_booked', 'contact_form', 'client_signup'].indexOf(templateName) !== -1;
        var isClientFacing = ['project_update', 'consultation_reminder'].indexOf(templateName) !== -1;

        // Determine recipient
        var toEmail = options.to || CONFIG.NOTIFY_EMAIL;
        var toName = options.toName || CONFIG.NOTIFY_NAME;

        if (isClientFacing) {
            toEmail = options.to || data.email;
            toName = options.toName || data.name || 'Client';
        }

        // CC admin on client-facing emails (unless explicitly skipped)
        var cc;
        if (isClientFacing && !options.skipAdmin) {
            cc = [{ email: CONFIG.NOTIFY_EMAIL, name: CONFIG.NOTIFY_NAME }];
        }

        // Subject
        var subjectFn = SUBJECTS[templateName];
        var subject = options.subject || (subjectFn ? subjectFn(data) : 'AI Dynamic Pro Notification');

        var payload = {
            sender: {
                email: options.from || CONFIG.FROM_EMAIL,
                name: options.fromName || CONFIG.FROM_NAME
            },
            to: [{ email: toEmail, name: toName }],
            subject: subject,
            htmlContent: htmlContent,
            replyTo: {
                email: options.replyTo || CONFIG.REPLY_TO,
                name: options.replyToName || 'AI Dynamic Pro Support'
            }
        };

        if (cc) {
            payload.cc = cc;
        }

        try {
            var response = await fetch(CONFIG.BREVO_API_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'api-key': apiKey
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                var errorBody = await response.text();
                console.error('[EmailNotify] Brevo API error (' + response.status + '):', errorBody);
                return { success: false, error: 'Brevo API ' + response.status + ': ' + errorBody };
            }

            var result = await response.json();
            console.log('[EmailNotify] \u2705 Sent: ' + templateName + ' \u2192 ' + toEmail);
            return { success: true, messageId: result.messageId, data: result };

        } catch (err) {
            console.error('[EmailNotify] Network error:', err.message);
            return { success: false, error: err.message };
        }
    }

    function sendEmail(templateName, data, options) {
        return new Promise(function(resolve) {
            enqueue({
                templateName: templateName,
                data: data,
                options: options || {},
                callback: resolve
            });
        });
    }

    async function notifyAdmin(type, data, options) {
        options = options || {};
        try {
            return await sendEmail(type, data, Object.assign({}, options, { skipAdmin: true }));
        } catch (err) {
            console.error('[EmailNotify] notifyAdmin failed:', err.message);
            return { success: false, error: err.message };
        }
    }

    async function notifyClient(type, data, options) {
        options = options || {};
        if (!data.email) {
            console.error('[EmailNotify] notifyClient requires data.email');
            return { success: false, error: 'Client email required' };
        }
        try {
            return await sendEmail(type, data, Object.assign({}, options, { to: data.email, toName: data.name || 'Client' }));
        } catch (err) {
            console.error('[EmailNotify] notifyClient failed:', err.message);
            return { success: false, error: err.message };
        }
    }

    // ═══════════════════════════════════════════════════════════
    // CONVENIENCE HELPERS
    // ═══════════════════════════════════════════════════════════

    async function sendConsultationBooked(data, options) {
        return await notifyAdmin('consultation_booked', data, options);
    }

    async function sendContactForm(data, options) {
        return await notifyAdmin('contact_form', data, options);
    }

    async function sendClientSignup(data, options) {
        return await notifyAdmin('client_signup', data, options);
    }

    async function sendProjectUpdate(data, options) {
        return await notifyClient('project_update', data, options);
    }

    async function sendConsultationReminder(data, options) {
        return await notifyClient('consultation_reminder', data, options);
    }

    // ═══════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════

    var EmailNotify = {
        // Core
        send: sendEmail,
        notifyAdmin: notifyAdmin,
        notifyClient: notifyClient,

        // Convenience shortcuts
        sendConsultationBooked: sendConsultationBooked,
        sendContactForm: sendContactForm,
        sendClientSignup: sendClientSignup,
        sendProjectUpdate: sendProjectUpdate,
        sendConsultationReminder: sendConsultationReminder,

        // Utilities
        templates: TEMPLATES,
        config: CONFIG,
        brand: BRAND,
        escapeHtml: escapeHtml,
        fmtDate: fmtDate,
        fmtTime: fmtTime,
        fmtDateTime: fmtDateTime,

        // Queue inspection
        queueLength: function() { return notificationQueue.length; },
        version: '1.0.0'
    };

    global.EmailNotify = EmailNotify;

    // Auto-integrate with common form handlers if present
    if (global.AIDynamic) {
        global.AIDynamic.emailNotify = EmailNotify;
        console.log('[EmailNotify] Integrated with AIDynamic global object');
    }

    console.log('[EmailNotify] AIDynamic Pro Email Module loaded. Templates: ' + Object.keys(TEMPLATES).join(', '));

})(typeof window !== 'undefined' ? window : global);
