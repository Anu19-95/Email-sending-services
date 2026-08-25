import { EmailTemplate } from '../types';

export const INITIAL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tmpl-welcome',
    name: 'Welcome & Onboarding',
    category: 'Auth',
    subject: 'Welcome to {{company_name}}, {{user_name}}!',
    description: 'Modern welcome email with getting started guide and CTA button.',
    variables: [
      { key: 'user_name', label: 'User Name', defaultValue: 'Alex Mercer', description: 'Recipient full name' },
      { key: 'company_name', label: 'Company Name', defaultValue: 'CloudPulse', description: 'Your brand/company name' },
      { key: 'dashboard_url', label: 'Dashboard URL', defaultValue: 'https://cloudpulse.io/dashboard', description: 'Direct link to user dashboard' },
      { key: 'support_email', label: 'Support Email', defaultValue: 'help@cloudpulse.io', description: 'Customer support contact email' }
    ],
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {{company_name}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 40px; background: #0f172a; text-align: center;">
              <span style="display: inline-block; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">⚡ {{company_name}}</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #0f172a; line-height: 1.3;">Welcome aboard, {{user_name}}!</h1>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #475569;">
                We're excited to have you with us. Your account is fully set up and ready to go. Start exploring your workspace and streamline your workflows today.
              </p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <h3 style="margin: 0 0 10px; font-size: 15px; font-weight: 600; color: #0f172a;">Quick Start Checklist:</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.7; color: #475569;">
                  <li>Verify your profile settings</li>
                  <li>Invite team collaborators</li>
                  <li>Create your first project workflow</li>
                </ul>
              </div>

              <!-- Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 24px;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                    <a href="{{dashboard_url}}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Go to Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.5; color: #64748b;">
                Need assistance? Our support team is always ready to assist you at <a href="mailto:{{support_email}}" style="color: #2563eb; text-decoration: none;">{{support_email}}</a>.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6;">
              &copy; 2026 {{company_name}} Inc. All rights reserved.<br>
              You received this email because you created an account on {{company_name}}.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'tmpl-otp-verify',
    name: 'Verification Code (OTP)',
    category: 'Auth',
    subject: '{{otp_code}} is your verification code for {{service_name}}',
    description: 'Security authentication code with expiration timer and IP notice.',
    variables: [
      { key: 'otp_code', label: 'Verification Code', defaultValue: '849201', description: '6-digit security pass code' },
      { key: 'service_name', label: 'Service Name', defaultValue: 'SecureID Portal', description: 'Service or company name' },
      { key: 'user_name', label: 'User Name', defaultValue: 'Morgan Chase', description: 'Account holder name' },
      { key: 'expiry_minutes', label: 'Expiry Minutes', defaultValue: '10', description: 'Duration in minutes before code expires' },
      { key: 'request_location', label: 'Request Location', defaultValue: 'San Francisco, US (IP: 192.0.2.45)', description: 'Estimated geographic location' }
    ],
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 32px 36px; border-bottom: 1px solid #f1f5f9;">
              <div style="font-size: 18px; font-weight: 700; color: #0284c7; letter-spacing: -0.3px;">🔐 {{service_name}} Security</div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px;">
              <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #0f172a;">Verify your identity</h2>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.5; color: #475569;">
                Hello {{user_name}}, please use the one-time verification code below to authorize your sign-in attempt:
              </p>

              <!-- OTP Code Display -->
              <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a;">
                  {{otp_code}}
                </span>
                <p style="margin: 10px 0 0; font-size: 13px; color: #64748b; font-weight: 500;">
                  Expires in {{expiry_minutes}} minutes
                </p>
              </div>

              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 0 6px 6px 0; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                  <strong>Security Notice:</strong> Requested from {{request_location}}. If you did not initiate this request, please change your password immediately.
                </p>
              </div>

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                Never share this code with anyone. {{service_name}} staff will never ask for your verification code.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
              &copy; 2026 {{service_name}} Security System
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'tmpl-receipt-invoice',
    name: 'Invoice & Payment Receipt',
    category: 'Transactional',
    subject: 'Receipt for Order #{{order_id}} - {{company_name}}',
    description: 'Itemized transaction receipt with invoice breakdown and download link.',
    variables: [
      { key: 'company_name', label: 'Company Name', defaultValue: 'Apex Cloud Systems', description: 'Merchant / billing entity' },
      { key: 'order_id', label: 'Order ID', defaultValue: 'INV-98241', description: 'Unique order identifier' },
      { key: 'user_name', label: 'Customer Name', defaultValue: 'Sarah Connor', description: 'Purchaser name' },
      { key: 'plan_name', label: 'Plan / Item', defaultValue: 'Pro Developer Plan (Annual)', description: 'Product item name' },
      { key: 'amount_paid', label: 'Amount Paid', defaultValue: '$240.00 USD', description: 'Total charged amount' },
      { key: 'payment_method', label: 'Payment Method', defaultValue: 'Visa ending in •••• 4242', description: 'Card or payment gateway' },
      { key: 'invoice_url', label: 'Invoice PDF URL', defaultValue: 'https://apexcloud.io/invoices/INV-98241.pdf', description: 'Link to download PDF invoice' }
    ],
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt #{{order_id}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background: #1e293b; color: #ffffff;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 700;">{{company_name}}</div>
                    <div style="font-size: 13px; color: #94a3b8; margin-top: 4px;">Billing & Payments</div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">
                      PAID
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 40px;">
              <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #0f172a;">Thank you for your payment!</h2>
              <p style="margin: 0 0 24px; font-size: 15px; color: #64748b;">
                Hi {{user_name}}, we have received your payment for order <strong>#{{order_id}}</strong>.
              </p>

              <!-- Order Summary Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin: 24px 0 32px; border: 1px solid #f1f5f9;">
                <thead>
                  <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                    <th align="left" style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                    <th align="right" style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 16px; font-size: 14px; font-weight: 500; color: #1e293b;">{{plan_name}}</td>
                    <td align="right" style="padding: 16px; font-size: 14px; font-weight: 600; color: #1e293b;">{{amount_paid}}</td>
                  </tr>
                  <tr style="background-color: #f8fafc;">
                    <td style="padding: 14px 16px; font-size: 15px; font-weight: 700; color: #0f172a;">Total Charged</td>
                    <td align="right" style="padding: 14px 16px; font-size: 18px; font-weight: 800; color: #0f172a;">{{amount_paid}}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Details Grid -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 18px; font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 28px;">
                <div><strong>Payment Method:</strong> {{payment_method}}</div>
                <div><strong>Invoice Reference:</strong> #{{order_id}}</div>
                <div><strong>Status:</strong> Completed / Settled</div>
              </div>

              <!-- Button -->
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: #0f172a;">
                    <a href="{{invoice_url}}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                      Download Full PDF Invoice &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
              &copy; 2026 {{company_name}} | Need billing assistance? Reply directly to this receipt.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'tmpl-incident-alert',
    name: 'System Incident & Status Alert',
    category: 'Notification',
    subject: '[Incident Alert] {{incident_title}} - Status: {{incident_status}}',
    description: 'Urgent operational notification for downtime, maintenance, or security alerts.',
    variables: [
      { key: 'service_name', label: 'Service Name', defaultValue: 'Nexus API Gateway', description: 'Affected service or product' },
      { key: 'incident_title', label: 'Incident Title', defaultValue: 'Elevated 502 Latency in US-East', description: 'Brief incident summary' },
      { key: 'incident_status', label: 'Current Status', defaultValue: 'INVESTIGATING', description: 'INVESTIGATING / MONITORING / RESOLVED' },
      { key: 'status_page_url', label: 'Status Page URL', defaultValue: 'https://status.nexusapi.io', description: 'Real-time telemetry link' },
      { key: 'timestamp', label: 'Incident Time', defaultValue: '2026-08-25 10:30 UTC', description: 'Event timestamp' }
    ],
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Incident Alert: {{incident_title}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #131b2e; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
          <tr>
            <td style="padding: 28px 36px; background-color: #1e293b; border-bottom: 1px solid #334155;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 16px; font-weight: 700; color: #f8fafc;">
                    🔴 {{service_name}} Alert
                  </td>
                  <td align="right">
                    <span style="background-color: #ef4444; color: #ffffff; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.5px;">
                      {{incident_status}}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #ffffff;">{{incident_title}}</h2>
              <div style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">
                Identified: {{timestamp}}
              </div>
              <p style="margin: 0 0 18px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Our engineering team has detected an anomaly impacting traffic routing. Our on-call incident response team is actively diagnosing the root cause and deploying mitigations.
              </p>

              <div style="background-color: #0f172a; border-left: 4px solid #ef4444; border-radius: 0 6px 6px 0; padding: 16px; margin: 24px 0;">
                <div style="font-size: 14px; font-weight: 600; color: #f87171; margin-bottom: 4px;">Impact Assessment</div>
                <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">API endpoints may experience intermittent latency or brief timeout responses during this window.</div>
              </div>

              <!-- Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 10px;">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: #3b82f6;">
                    <a href="{{status_page_url}}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">
                      View Live Telemetry Status &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 36px; background-color: #0f172a; border-top: 1px solid #1e293b; text-align: center; font-size: 12px; color: #64748b;">
              Automated Operations Dispatch &bull; {{service_name}}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: 'tmpl-newsletter',
    name: 'Product Newsletter & Announcement',
    category: 'Marketing',
    subject: '⚡ What’s new in {{product_name}} this month: {{highlight_feature}}',
    description: 'Modern newsletter layout with feature spotlight, release notes, and read more button.',
    variables: [
      { key: 'product_name', label: 'Product Name', defaultValue: 'Beam Studio', description: 'Product or brand' },
      { key: 'highlight_feature', label: 'Key Feature', defaultValue: 'AI Workflow Automation', description: 'Headline feature' },
      { key: 'feature_description', label: 'Feature Description', defaultValue: 'Build and deploy autonomous multi-step workflows in minutes with natural language prompts.', description: 'Brief description' },
      { key: 'changelog_url', label: 'Changelog URL', defaultValue: 'https://beamstudio.com/changelog', description: 'Link to full release notes' }
    ],
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{product_name}} Monthly Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #27272a;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e4e4e7;">
          <!-- Top Banner -->
          <tr>
            <td style="padding: 48px 40px 32px; background: linear-gradient(135deg, #09090b 0%, #18181b 100%); text-align: center; color: #ffffff;">
              <span style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #a1a1aa; display: block; margin-bottom: 8px;">Product Release Notes</span>
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; line-height: 1.2;">Introducing {{highlight_feature}}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 36px 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #52525b;">
                Hey there! We’ve packed this release with speed improvements, enhanced developer tooling, and our headline feature: <strong>{{highlight_feature}}</strong>.
              </p>

              <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 24px; margin: 24px 0;">
                <h3 style="margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #18181b;">✨ {{highlight_feature}}</h3>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #71717a;">{{feature_description}}</p>
              </div>

              <!-- Button -->
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 20px;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #18181b;">
                    <a href="{{changelog_url}}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      Read the Full Release Notes &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #e4e4e7; text-align: center; font-size: 12px; color: #a1a1aa; line-height: 1.6;">
              Sent by {{product_name}} &bull; Unsubscribe from updates in your profile settings.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }
];
