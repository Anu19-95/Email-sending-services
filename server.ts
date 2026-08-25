import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_TEMPLATES } from './src/data/templates.ts';
import { EmailLog, EmailPayload, SpamAnalysisResult, SmtpConfig } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Gemini Client (server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'mailflow-pro',
    },
  },
});

// In-Memory Storage for Session Email Logs
let emailLogs: EmailLog[] = [];
let etherealTransporter: nodemailer.Transporter | null = null;

// Initialize some initial demo logs so the dashboard feels rich on first load
function seedInitialLogs() {
  const now = new Date();
  const sampleLogs: EmailLog[] = [
    {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      messageId: `<${Date.now() - 120000}.8921@cloudpulse.mail>`,
      from: 'CloudPulse <welcome@cloudpulse.io>',
      to: ['sarah.dev@example.com'],
      subject: 'Welcome to CloudPulse, Sarah!',
      html: INITIAL_TEMPLATES[0].html.replace(/\{\{user_name\}\}/g, 'Sarah').replace(/\{\{company_name\}\}/g, 'CloudPulse'),
      text: 'Welcome aboard Sarah! Your account is ready.',
      status: 'opened',
      createdAt: new Date(now.getTime() - 24 * 60 * 1000).toISOString(),
      deliveredAt: new Date(now.getTime() - 24 * 60 * 1000 + 420).toISOString(),
      openedAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
      clickedAt: new Date(now.getTime() - 18 * 60 * 1000).toISOString(),
      latencyMs: 420,
      headers: {
        'X-Mailer': 'CloudPulse-Engine/2.4',
        'X-Priority': '3 (Normal)',
        'SPF-Result': 'pass (ip=198.51.100.12)',
        'DKIM-Signature': 'v=1; a=rsa-sha256; d=cloudpulse.io; s=mail2026; c=relaxed/relaxed;'
      },
      tags: ['onboarding', 'auth'],
      attachments: [],
      smtpResponse: '250 2.0.0 OK: queued as 4St8k31H9z2891',
      spfStatus: 'pass',
      dkimStatus: 'pass',
      dmarcStatus: 'pass',
      timeline: [
        { stage: 'Queued', timestamp: new Date(now.getTime() - 24 * 60 * 1000).toISOString(), detail: 'Enqueued in dispatcher worker pool', status: 'success' },
        { stage: 'SPF/DKIM Signed', timestamp: new Date(now.getTime() - 24 * 60 * 1000 + 110).toISOString(), detail: 'Generated RSA-256 DKIM signature for d=cloudpulse.io', status: 'success' },
        { stage: 'MX Handshake', timestamp: new Date(now.getTime() - 24 * 60 * 1000 + 260).toISOString(), detail: 'Connected to mail.example.com (TLSv1.3)', status: 'success' },
        { stage: '250 OK Delivered', timestamp: new Date(now.getTime() - 24 * 60 * 1000 + 420).toISOString(), detail: 'Recipient server accepted payload', status: 'success' },
        { stage: 'Recipient Opened', timestamp: new Date(now.getTime() - 20 * 60 * 1000).toISOString(), detail: 'Tracking pixel triggered via Apple Mail', status: 'success' },
        { stage: 'Link Clicked', timestamp: new Date(now.getTime() - 18 * 60 * 1000).toISOString(), detail: 'User clicked "Go to Dashboard"', status: 'success' }
      ],
      isReadInInbox: true
    },
    {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      messageId: `<${Date.now() - 360000}.1209@secureid.mail>`,
      from: 'SecureID Portal <security@secureid.io>',
      to: ['david.chen@enterprise.com'],
      subject: '739201 is your verification code for SecureID Portal',
      html: INITIAL_TEMPLATES[1].html.replace(/\{\{otp_code\}\}/g, '739201').replace(/\{\{user_name\}\}/g, 'David Chen'),
      text: 'Your security code is 739201. Valid for 10 minutes.',
      status: 'delivered',
      createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      deliveredAt: new Date(now.getTime() - 5 * 60 * 1000 + 280).toISOString(),
      latencyMs: 280,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-Security-OTP': 'active'
      },
      tags: ['security', 'otp', 'high-priority'],
      attachments: [],
      smtpResponse: '250 2.0.0 Message accepted for delivery',
      spfStatus: 'pass',
      dkimStatus: 'pass',
      dmarcStatus: 'pass',
      timeline: [
        { stage: 'Queued', timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), detail: 'High priority transactional queue', status: 'success' },
        { stage: 'Delivered', timestamp: new Date(now.getTime() - 5 * 60 * 1000 + 280).toISOString(), detail: 'Delivered to enterprise MX gateway in 280ms', status: 'success' }
      ],
      isReadInInbox: false
    }
  ];
  emailLogs = sampleLogs;
}
seedInitialLogs();

// Get or create Ethereal Transporter
async function getEtherealTransporter() {
  if (etherealTransporter) return etherealTransporter;
  try {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return etherealTransporter;
  } catch (err) {
    console.warn('Failed to initialize Ethereal account, fallback to simulation:', err);
    return null;
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Email Sending Service', timestamp: new Date().toISOString() });
});

// 2. Fetch Sent Email Logs
app.get('/api/v1/logs', (req, res) => {
  const { status, tag, search, limit = '50' } = req.query;
  let filtered = [...emailLogs];

  if (status && status !== 'all') {
    filtered = filtered.filter(l => l.status === status);
  }
  if (tag && tag !== 'all') {
    filtered = filtered.filter(l => l.tags && l.tags.includes(String(tag)));
  }
  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(l =>
      l.subject.toLowerCase().includes(q) ||
      l.from.toLowerCase().includes(q) ||
      l.to.some(t => t.toLowerCase().includes(q)) ||
      l.messageId.toLowerCase().includes(q)
    );
  }

  const max = Math.min(parseInt(String(limit), 10) || 50, 100);
  res.json({
    total: filtered.length,
    logs: filtered.slice(0, max)
  });
});

// 3. Clear logs
app.delete('/api/v1/logs', (req, res) => {
  emailLogs = [];
  res.json({ success: true, message: 'All logs cleared' });
});

// 4. Update log status (for simulated opens / clicks / read flags)
app.patch('/api/v1/logs/:id', (req, res) => {
  const { id } = req.params;
  const { status, isReadInInbox } = req.body;
  const logIndex = emailLogs.findIndex(l => l.id === id);

  if (logIndex === -1) {
    return res.status(404).json({ error: 'Log not found' });
  }

  const log = emailLogs[logIndex];
  if (status) {
    log.status = status;
    const nowIso = new Date().toISOString();
    if (status === 'opened' && !log.openedAt) {
      log.openedAt = nowIso;
      log.timeline.push({
        stage: 'Recipient Opened',
        timestamp: nowIso,
        detail: 'Simulated inbox open event detected',
        status: 'success'
      });
    } else if (status === 'clicked' && !log.clickedAt) {
      log.clickedAt = nowIso;
      log.timeline.push({
        stage: 'Link Clicked',
        timestamp: nowIso,
        detail: 'Simulated CTA button click triggered',
        status: 'success'
      });
    }
  }
  if (typeof isReadInInbox === 'boolean') {
    log.isReadInInbox = isReadInInbox;
  }

  res.json({ success: true, log });
});

// 5. Send Email Handler
app.post(['/api/v1/send', '/api/send'], async (req, res) => {
  try {
    const payload: EmailPayload = req.body;

    if (!payload.to || !payload.subject) {
      return res.status(400).json({ error: 'Missing required fields: "to" and "subject" are required.' });
    }

    const toList = Array.isArray(payload.to)
      ? payload.to
      : payload.to.split(',').map(s => s.trim()).filter(Boolean);

    if (toList.length === 0) {
      return res.status(400).json({ error: 'Recipient "to" list cannot be empty.' });
    }

    const fromAddress = payload.from || 'noreply@service.mail';
    const rawSubject = payload.subject;
    let htmlBody = payload.html || '';
    let textBody = payload.text || '';

    // If templateId provided, apply template with variables
    if (payload.templateId) {
      const tmpl = INITIAL_TEMPLATES.find(t => t.id === payload.templateId);
      if (tmpl) {
        let renderedHtml = tmpl.html;
        const vars = payload.variables || {};
        tmpl.variables.forEach(v => {
          const val = vars[v.key] ?? v.defaultValue;
          renderedHtml = renderedHtml.replace(new RegExp(`\\{\\{${v.key}\\}\\}`, 'g'), val);
        });
        htmlBody = renderedHtml;
      }
    } else if (payload.variables && htmlBody) {
      // Replace variables in provided custom HTML
      Object.entries(payload.variables).forEach(([key, val]) => {
        htmlBody = htmlBody.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
      });
    }

    if (!htmlBody && !textBody) {
      htmlBody = `<div style="font-family: sans-serif; padding: 24px; color: #1e293b;">
        <h2 style="color: #0f172a; margin-top: 0;">${rawSubject}</h2>
        <p>This is a test email dispatched from the Email Sending Service platform.</p>
      </div>`;
      textBody = `Subject: ${rawSubject}\n\nThis is a test email dispatched from Email Sending Service.`;
    }

    const startTime = Date.now();
    let messageId = `<${Date.now()}.${Math.random().toString(36).substring(2, 8)}@service.mail>`;
    let previewUrl: string | undefined = undefined;
    let smtpResponse = '250 2.0.0 OK: message queued 100% delivered';
    let deliveryStatus: 'delivered' | 'bounced' = 'delivered';
    let bounceReason: string | undefined = undefined;

    // Check for deliberate bounce simulation if recipient is bounce@... or invalid
    if (toList.some(email => email.toLowerCase().includes('bounce@') || email.toLowerCase().endsWith('@invalid.com') || email.toLowerCase().includes('reject@'))) {
      deliveryStatus = 'bounced';
      bounceReason = '550 5.1.1 User unknown / Mailbox unavailable';
      smtpResponse = '550 5.1.1 Recipient address rejected: User does not exist';
    }

    const customSmtp = payload.smtpConfigOverride;
    const mode = customSmtp?.mode || 'simulated';

    if (mode === 'ethereal' && deliveryStatus === 'delivered') {
      try {
        const transporter = await getEtherealTransporter();
        if (transporter) {
          const info = await transporter.sendMail({
            from: fromAddress,
            to: toList.join(', '),
            cc: payload.cc,
            bcc: payload.bcc,
            replyTo: payload.replyTo,
            subject: rawSubject,
            text: textBody,
            html: htmlBody,
          });
          messageId = info.messageId || messageId;
          previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
          smtpResponse = `250 2.0.0 Ethereal OK [id: ${info.messageId}]`;
        }
      } catch (etherealErr) {
        console.warn('Ethereal dispatch failed, using simulated response:', etherealErr);
      }
    } else if (mode === 'custom' && customSmtp?.host && customSmtp.user) {
      try {
        const customTransporter = nodemailer.createTransport({
          host: customSmtp.host,
          port: customSmtp.port || 587,
          secure: customSmtp.secure || false,
          auth: {
            user: customSmtp.user,
            pass: customSmtp.pass || '',
          },
        });
        const info = await customTransporter.sendMail({
          from: fromAddress,
          to: toList.join(', '),
          subject: rawSubject,
          text: textBody,
          html: htmlBody,
        });
        messageId = info.messageId || messageId;
        smtpResponse = `250 2.0.0 Custom SMTP OK [id: ${info.messageId}]`;
      } catch (customErr: any) {
        deliveryStatus = 'bounced';
        bounceReason = customErr.message || 'SMTP Authentication / Connection Error';
        smtpResponse = `535 Authentication failed: ${customErr.message}`;
      }
    }

    const latencyMs = Date.now() - startTime + Math.floor(Math.random() * 120 + 80);
    const nowIso = new Date().toISOString();

    const headersMap: Record<string, string> = {
      'Message-ID': messageId,
      'From': fromAddress,
      'To': toList.join(', '),
      'Subject': rawSubject,
      'Date': new Date().toUTCString(),
      'X-Mailer': 'EmailSendingService/1.0.0 (Node.js)',
      'SPF-Result': deliveryStatus === 'delivered' ? 'pass (service.mail: domain designates authorized IP)' : 'neutral',
      'DKIM-Signature': 'v=1; a=rsa-sha256; c=relaxed/relaxed; d=service.mail; s=202608;',
      'DMARC-Result': 'pass (p=reject sp=reject dis=none)'
    };

    if (payload.headers && Array.isArray(payload.headers)) {
      payload.headers.forEach(h => {
        if (h.key && h.value) headersMap[h.key] = h.value;
      });
    }

    const timeline: any[] = [
      {
        stage: 'Queued',
        timestamp: nowIso,
        detail: 'Accepted by ingestion API gateway',
        status: 'success'
      },
      {
        stage: 'SPF & DKIM Signing',
        timestamp: new Date(Date.now() + 60).toISOString(),
        detail: 'Cryptographically signed with 2048-bit RSA key',
        status: 'success'
      },
      {
        stage: deliveryStatus === 'delivered' ? 'Delivered (250 OK)' : 'Bounced (550 Error)',
        timestamp: new Date(Date.now() + latencyMs).toISOString(),
        detail: deliveryStatus === 'delivered' ? `Accepted by destination MX server (${latencyMs}ms)` : `Destination rejected: ${bounceReason}`,
        status: deliveryStatus === 'delivered' ? 'success' : 'failed'
      }
    ];

    const newLog: EmailLog = {
      id: 'msg_' + Math.random().toString(36).substring(2, 10),
      messageId,
      from: fromAddress,
      to: toList,
      cc: payload.cc ? payload.cc.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      bcc: payload.bcc ? payload.bcc.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      replyTo: payload.replyTo,
      subject: rawSubject,
      html: htmlBody,
      text: textBody,
      status: deliveryStatus,
      createdAt: nowIso,
      deliveredAt: deliveryStatus === 'delivered' ? new Date(Date.now() + latencyMs).toISOString() : undefined,
      bouncedAt: deliveryStatus === 'bounced' ? new Date(Date.now() + latencyMs).toISOString() : undefined,
      bounceReason,
      latencyMs,
      previewUrl,
      headers: headersMap,
      tags: payload.tags || ['general'],
      attachments: payload.attachments || [],
      smtpResponse,
      spfStatus: deliveryStatus === 'delivered' ? 'pass' : 'neutral',
      dkimStatus: deliveryStatus === 'delivered' ? 'pass' : 'neutral',
      dmarcStatus: deliveryStatus === 'delivered' ? 'pass' : 'neutral',
      timeline,
      isReadInInbox: false
    };

    // Prepend to top of logs
    emailLogs.unshift(newLog);

    res.status(200).json({
      success: true,
      id: newLog.id,
      messageId: newLog.messageId,
      status: newLog.status,
      recipientCount: toList.length,
      latencyMs: newLog.latencyMs,
      previewUrl: newLog.previewUrl,
      smtpResponse: newLog.smtpResponse,
      log: newLog
    });
  } catch (err: any) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch email' });
  }
});

// 6. AI Email Assistant Endpoint
app.post('/api/ai/assist', async (req, res) => {
  try {
    const { action, prompt, content, subject, tone = 'Professional' } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'Action parameter is required.' });
    }

    if (action === 'subject_lines') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `You are an expert email marketing copywriter and deliverability specialist.
Generate 5 high-converting, crisp subject lines for the following email topic/content:
Email Topic / Body:
"${content || prompt || 'Product updates and announcements'}"

Target Tone: ${tone}

Return JSON with format:
{
  "subjects": [
    { "text": "Subject line text", "openRatePrediction": "88%", "style": "Action-Oriented / Curiosity / Direct" }
  ]
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ subjects: parsed.subjects || [] });
    }

    if (action === 'improve_body') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `You are a world-class email editor. Rewrite and enhance the following email copy:
Original Body:
"""
${content || prompt}
"""
Subject: "${subject || 'Not specified'}"
Desired Tone: "${tone}"

Enhance clarity, structure with clean paragraphs and bullet points if appropriate, strong call to action, and natural flow.
Return JSON with format:
{
  "improvedHtml": "<p>Enhanced HTML content with inline styles for high email client compatibility...</p>",
  "improvedText": "Plain text version of the email...",
  "suggestedSubject": "Recommended subject line",
  "summaryOfImprovements": "Brief bulleted summary of changes made"
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }

    if (action === 'spam_check') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `You are an email deliverability and spam filter engineer (SpamAssassin / Barracuda expert).
Analyze this email for spam triggers, spammy words, formatting red flags, and deliverability health:

Subject: "${subject || ''}"
Content/HTML:
"""
${content || ''}
"""

Evaluate:
1. Trigger words (e.g. "FREE", "$$$", "Act Now", "Guaranteed", "Winner", excessive exclamation marks, misleading urgency).
2. HTML structure & balance (image-to-text ratio, unsubscribe considerations).
3. Score from 0 to 100 (where 0 = pristine clean deliverability, 100 = guaranteed spam junk folder).

Return JSON with format:
{
  "score": 12,
  "rating": "Clean" | "Moderate Risk" | "High Spam Risk",
  "flags": [
    { "word": "string trigger detected", "category": "Urgency / Financial / Formatting", "suggestion": "How to rephrase" }
  ],
  "deliverabilityTips": ["Tip 1", "Tip 2", "Tip 3"],
  "summary": "Overall evaluation of the email deliverability potential"
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed: SpamAnalysisResult = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }

    if (action === 'generate_template') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `You are an elite HTML Email template designer. Create a production-ready, fully responsive, bulletproof HTML email template based on this prompt:
Prompt: "${prompt}"

Requirements:
- Table-based nested layout for universal client support (Outlook, Gmail, Apple Mail, Yahoo).
- Max-width 600px, centered on neutral background (#f4f5f7 or appropriate).
- Inline CSS styles (font-family, margins, padding, colors, border-radius, button styling).
- Include appropriate {{variable_name}} placeholders where appropriate (e.g., {{user_name}}, {{cta_url}}, {{company_name}}).
- Clear CTA button.
- Footer with copyright and unsubscribe/contact info.

Return JSON with format:
{
  "templateName": "Descriptive Template Title",
  "subject": "Suggested Subject with {{variables}}",
  "category": "Transactional" | "Marketing" | "Notification" | "Auth",
  "html": "<!DOCTYPE html><html>...complete valid HTML...</html>",
  "variables": [
    { "key": "user_name", "label": "User Name", "defaultValue": "Alex Mercer", "description": "Recipient name" }
  ]
}`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err: any) {
    console.error('AI assistant error:', err);
    res.status(500).json({ error: err.message || 'AI request failed' });
  }
});

// 7. Webhook Simulation Tester
app.post('/api/v1/webhooks/test', async (req, res) => {
  const { url, event = 'email.delivered', secret = 'whsec_sample' } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Target webhook URL is required' });
  }

  const payload = {
    id: 'evt_' + Math.random().toString(36).substring(2, 9),
    type: event,
    created_at: new Date().toISOString(),
    data: {
      message_id: `<${Date.now()}@service.mail>`,
      recipient: 'user@example.com',
      subject: 'Test Webhook Notification',
      status: event === 'email.bounced' ? 'bounced' : 'delivered',
      latency_ms: 310
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Signature': 'sha256=mock_signature_hex',
        'User-Agent': 'EmailSendingService-Webhook/1.0'
      },
      body: JSON.stringify(payload)
    });

    res.json({
      success: true,
      statusCode: response.status,
      statusText: response.statusText,
      sentPayload: payload
    });
  } catch (err: any) {
    res.status(502).json({
      success: false,
      error: `Could not reach webhook endpoint: ${err.message}`,
      sentPayload: payload
    });
  }
});

// -------------------------------------------------------------
// Vite Middleware Setup
// -------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Email Sending Service running on port ${PORT}`);
  });
}

start();
