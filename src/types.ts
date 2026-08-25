export interface EmailRecipient {
  name?: string;
  email: string;
}

export interface EmailAttachment {
  id?: string;
  name: string;
  size: string;
  type: string;
  content?: string;
}

export interface EmailHeader {
  key: string;
  value: string;
}

export interface EmailPayload {
  from: string;
  to: string; // single or comma separated
  cc?: string;
  bcc?: string;
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  variables?: Record<string, string>;
  tags?: string[];
  headers?: EmailHeader[];
  attachments?: EmailAttachment[];
  smtpConfigOverride?: Partial<SmtpConfig>;
}

export type EmailDeliveryStatus = 'queued' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';

export interface EmailTimelineEvent {
  stage: string;
  timestamp: string;
  detail: string;
  status: 'success' | 'pending' | 'failed';
}

export interface EmailLog {
  id: string;
  messageId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  status: EmailDeliveryStatus;
  createdAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bouncedAt?: string;
  bounceReason?: string;
  latencyMs: number;
  previewUrl?: string; // e.g. Ethereal Email test URL
  headers: Record<string, string>;
  tags: string[];
  attachments: EmailAttachment[];
  smtpResponse: string;
  spfStatus: 'pass' | 'fail' | 'neutral';
  dkimStatus: 'pass' | 'fail' | 'neutral';
  dmarcStatus: 'pass' | 'fail' | 'neutral';
  timeline: EmailTimelineEvent[];
  isReadInInbox?: boolean;
}

export interface TemplateVariable {
  key: string;
  label: string;
  defaultValue: string;
  description: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: 'Transactional' | 'Marketing' | 'Notification' | 'Auth';
  subject: string;
  description: string;
  html: string;
  variables: TemplateVariable[];
  isCustom?: boolean;
  updatedAt?: string;
}

export interface SmtpConfig {
  mode: 'simulated' | 'ethereal' | 'custom';
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  fromDefault: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string;
  rateLimit: number; // req / min
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  lastDeliveredAt?: string;
  lastStatus?: number;
}

export interface SpamAnalysisResult {
  score: number; // 0 to 100 (higher means more likely spam)
  rating: 'Clean' | 'Moderate Risk' | 'High Spam Risk';
  flags: { word: string; category: string; suggestion: string }[];
  deliverabilityTips: string[];
  summary: string;
}
