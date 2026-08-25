import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Eye, 
  Code, 
  FileText, 
  Paperclip, 
  Plus, 
  Trash2, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Sliders,
  Tag,
  ExternalLink,
  Layers
} from 'lucide-react';
import { EmailAttachment, EmailHeader, EmailPayload, EmailTemplate, SmtpConfig } from '../types';
import { INITIAL_TEMPLATES } from '../data/templates';

interface ComposerProps {
  onSend?: (payload: EmailPayload) => Promise<void>;
  onSendSuccess?: (sentLog: any) => void;
  onOpenAiAssistant: () => void;
  smtpConfig?: SmtpConfig;
  initialTemplateId?: string;
  initialPayload?: Partial<EmailPayload> | null;
}

export const Composer: React.FC<ComposerProps> = ({
  onSend,
  onSendSuccess,
  onOpenAiAssistant,
  smtpConfig = { mode: 'simulated' as const, fromDefault: 'CloudPulse <noreply@service.mail>' },
  initialTemplateId,
  initialPayload,
}) => {
  // Form State
  const [fromAddress, setFromAddress] = useState('CloudPulse <noreply@service.mail>');
  const [toInput, setToInput] = useState('sarah.dev@example.com');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [subject, setSubject] = useState('Welcome to CloudPulse, Sarah!');
  
  // Body & Template State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || 'tmpl-welcome');
  const [viewMode, setViewMode] = useState<'preview' | 'html' | 'text'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  const [htmlContent, setHtmlContent] = useState<string>(() => {
    const tmpl = INITIAL_TEMPLATES.find(t => t.id === 'tmpl-welcome');
    return tmpl ? tmpl.html : '<p>Hello World!</p>';
  });
  const [textContent, setTextContent] = useState<string>('Hello! Welcome to CloudPulse.');

  // Dynamic Variables State
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({
    user_name: 'Sarah Mercer',
    company_name: 'CloudPulse',
    dashboard_url: 'https://cloudpulse.io/dashboard',
    support_email: 'help@cloudpulse.io',
  });

  // Attachments & Custom Headers
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [headers, setHeaders] = useState<EmailHeader[]>([
    { key: 'X-Priority', value: '3 (Normal)' },
  ]);
  const [tags, setTags] = useState<string[]>(['onboarding', 'transactional']);
  const [newTagInput, setNewTagInput] = useState('');

  // Status & Loading State
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessResult, setSendSuccessResult] = useState<any | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync initial payload if updated
  useEffect(() => {
    if (initialPayload) {
      if (initialPayload.from) setFromAddress(initialPayload.from);
      if (initialPayload.to) setToInput(typeof initialPayload.to === 'string' ? initialPayload.to : initialPayload.to.join(', '));
      if (initialPayload.subject) setSubject(initialPayload.subject);
      if (initialPayload.html) setHtmlContent(initialPayload.html);
      if (initialPayload.text) setTextContent(initialPayload.text);
      if (initialPayload.tags) setTags(initialPayload.tags);
      if (initialPayload.variables) setTemplateVariables(initialPayload.variables);
    }
  }, [initialPayload]);

  useEffect(() => {
    if (initialTemplateId) {
      handleSelectTemplate(initialTemplateId);
    }
  }, [initialTemplateId]);

  // Quick recipient chips
  const sampleRecipients = [
    { label: 'Sarah (Dev)', email: 'sarah.dev@example.com' },
    { label: 'Alex (Enterprise)', email: 'alex.lead@company.io' },
    { label: 'Bounce Test', email: 'bounce@test-invalid.com' },
  ];

  // Handle Template Selection
  const handleSelectTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    if (!tmplId) return;

    const tmpl = INITIAL_TEMPLATES.find(t => t.id === tmplId);
    if (tmpl) {
      setSubject(tmpl.subject.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
        const v = tmpl.variables.find(item => item.key === key);
        return v ? v.defaultValue : key;
      }));
      setHtmlContent(tmpl.html);
      
      const initialVars: Record<string, string> = {};
      tmpl.variables.forEach(v => {
        initialVars[v.key] = v.defaultValue;
      });
      setTemplateVariables(initialVars);
    }
  };

  // Compute live rendered HTML with substituted variables
  const getRenderedHtml = () => {
    let rendered = htmlContent;
    Object.entries(templateVariables).forEach(([k, v]) => {
      rendered = rendered.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
    });
    return rendered;
  };

  // Add Attachment
  const handleAddSampleAttachment = (type: 'pdf' | 'csv' | 'png') => {
    const samples: Record<string, EmailAttachment> = {
      pdf: { id: String(Date.now()), name: 'invoice_summary_2026.pdf', size: '245 KB', type: 'application/pdf' },
      csv: { id: String(Date.now()), name: 'user_export_dataset.csv', size: '42 KB', type: 'text/csv' },
      png: { id: String(Date.now()), name: 'welcome_badge.png', size: '1.2 MB', type: 'image/png' },
    };
    setAttachments([...attachments, samples[type]]);
  };

  const handleRemoveAttachment = (id?: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  // Headers
  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleUpdateHeader = (index: number, field: 'key' | 'value', val: string) => {
    const next = [...headers];
    next[index][field] = val;
    setHeaders(next);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  // Tags
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(newTagInput.trim())) {
        setTags([...tags, newTagInput.trim()]);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Reset form
  const handleResetForm = () => {
    handleSelectTemplate('tmpl-welcome');
    setToInput('sarah.dev@example.com');
    setCcInput('');
    setBccInput('');
    setAttachments([]);
    setSendSuccessResult(null);
    setSendError(null);
  };

  // Execute Send
  const handleSendEmail = async () => {
    if (!toInput.trim()) {
      setSendError('Recipient email address (To) is required.');
      return;
    }
    if (!subject.trim()) {
      setSendError('Subject line cannot be empty.');
      return;
    }

    setIsSending(true);
    setSendError(null);
    setSendSuccessResult(null);

    const payload: EmailPayload = {
      from: fromAddress,
      to: toInput,
      cc: ccInput || undefined,
      bcc: bccInput || undefined,
      replyTo: replyTo || undefined,
      subject: subject,
      html: getRenderedHtml(),
      text: textContent,
      templateId: selectedTemplateId || undefined,
      variables: templateVariables,
      headers: headers.filter(h => h.key && h.value),
      attachments: attachments,
      tags: tags,
      smtpConfigOverride: smtpConfig,
    };

    try {
      if (onSend) {
        await onSend(payload);
        setSendSuccessResult({
          status: 'delivered',
          messageId: `msg_${Date.now()}`,
          latencyMs: 142
        });
      } else {
        const res = await fetch('/api/v1/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to dispatch email');
        }

        setSendSuccessResult(data);
        if (onSendSuccess) {
          onSendSuccess(data.log);
        }
      }
    } catch (err: any) {
      setSendError(err.message || 'Dispatch error occurred');
    } finally {
      setIsSending(false);
    }
  };

  const currentTmpl = INITIAL_TEMPLATES.find(t => t.id === selectedTemplateId);

  return (
    <div className="space-y-4">
      {/* Top Banner / Notification */}
      {sendSuccessResult && (
        <div className="p-3.5 bg-green-50 border border-green-200 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-green-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <div>
              <div className="font-bold text-xs">
                Email dispatched successfully! (Status: {String(sendSuccessResult.status || 'OK').toUpperCase()})
              </div>
              <div className="text-[11px] text-green-700 font-mono mt-0.5">
                Message-ID: {sendSuccessResult.messageId || '250-OK'} &bull; Latency: {sendSuccessResult.latencyMs || 120}ms
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sendSuccessResult.previewUrl && (
              <a
                href={sendSuccessResult.previewUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium flex items-center gap-1 transition shadow-xs"
              >
                <span>View in Ethereal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              onClick={() => setSendSuccessResult(null)}
              className="text-xs text-green-700 hover:text-green-900 underline px-1.5 py-0.5"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {sendError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded flex items-center gap-2.5 text-red-800 text-xs shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <div className="flex-1 font-medium">{sendError}</div>
          <button onClick={() => setSendError(null)} className="text-xs text-red-700 hover:text-red-900 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left is Form, Right is Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Controls & Editor (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
          {/* Header Row */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-700">Dispatch Composer</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                SMTP Active
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetForm}
                className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded text-xs transition"
                title="Reset Form"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onOpenAiAssistant}
                id="btn-composer-ai-magic"
                className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded text-xs font-medium transition"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>AI Polish</span>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3 text-xs">
            {/* SENDER & RECIPIENTS */}
            <div className="space-y-2.5">
              {/* From */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <label className="font-bold text-gray-600 sm:col-span-1 text-xs">From Sender</label>
                <input
                  type="text"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                  id="input-from-address"
                  className="sm:col-span-3 bg-white border border-gray-300 text-gray-900 rounded text-xs px-2.5 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden font-mono"
                  placeholder="Sender Name <sender@example.com>"
                />
              </div>

              {/* To */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                <div className="flex items-center justify-between sm:col-span-1">
                  <label className="font-bold text-gray-600 text-xs">To Recipient</label>
                  <button
                    type="button"
                    onClick={() => setShowCcBcc(!showCcBcc)}
                    className="text-[11px] text-blue-600 hover:underline sm:hidden font-medium"
                  >
                    {showCcBcc ? 'Hide CC' : 'CC / BCC'}
                  </button>
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={toInput}
                      onChange={(e) => setToInput(e.target.value)}
                      id="input-to-recipients"
                      className="flex-1 bg-white border border-gray-300 text-gray-900 rounded text-xs px-2.5 py-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden font-mono"
                      placeholder="recipient@example.com (comma-separated for batch)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCcBcc(!showCcBcc)}
                      className="hidden sm:inline-block text-[11px] text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-gray-100 whitespace-nowrap"
                    >
                      {showCcBcc ? 'Hide CC/BCC' : '+ CC / BCC'}
                    </button>
                  </div>

                  {/* Quick Sample Buttons */}
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Test with:</span>
                    {sampleRecipients.map((rec) => (
                      <button
                        key={rec.email}
                        type="button"
                        onClick={() => setToInput(rec.email)}
                        className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 transition font-mono"
                      >
                        {rec.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* CC & BCC */}
              {showCcBcc && (
                <div className="space-y-2 pt-1 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                    <label className="font-bold text-gray-600 sm:col-span-1 text-xs">CC</label>
                    <input
                      type="text"
                      value={ccInput}
                      onChange={(e) => setCcInput(e.target.value)}
                      className="sm:col-span-3 bg-white border border-gray-300 text-gray-900 rounded text-xs px-2.5 py-1.5 focus:border-blue-500 outline-hidden font-mono"
                      placeholder="cc-recipient@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                    <label className="font-bold text-gray-600 sm:col-span-1 text-xs">BCC</label>
                    <input
                      type="text"
                      value={bccInput}
                      onChange={(e) => setBccInput(e.target.value)}
                      className="sm:col-span-3 bg-white border border-gray-300 text-gray-900 rounded text-xs px-2.5 py-1.5 focus:border-blue-500 outline-hidden font-mono"
                      placeholder="audit-bcc@compliance.io"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                    <label className="font-bold text-gray-600 sm:col-span-1 text-xs">Reply-To</label>
                    <input
                      type="text"
                      value={replyTo}
                      onChange={(e) => setReplyTo(e.target.value)}
                      className="sm:col-span-3 bg-white border border-gray-300 text-gray-900 rounded text-xs px-2.5 py-1.5 focus:border-blue-500 outline-hidden font-mono"
                      placeholder="replies@cloudpulse.io"
                    />
                  </div>
                </div>
              )}

              {/* SUBJECT */}
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 pt-1">
                <label className="font-bold text-gray-600 sm:col-span-1 text-xs">Subject</label>
                <div className="sm:col-span-3 relative">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    id="input-email-subject"
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded text-xs px-2.5 py-1.5 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden pr-8"
                    placeholder="Enter email subject line..."
                  />
                  <button
                    type="button"
                    onClick={onOpenAiAssistant}
                    title="Generate subject lines with AI"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-purple-600 hover:text-purple-800"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* TEMPLATE PICKER & VARIABLES */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-tight">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Responsive Template</span>
                </label>

                <select
                  value={selectedTemplateId}
                  onChange={(e) => handleSelectTemplate(e.target.value)}
                  id="select-email-template"
                  className="bg-white border border-gray-300 text-gray-800 text-xs rounded px-2.5 py-1 focus:border-blue-500 outline-hidden font-medium"
                >
                  <option value="">Custom Blank HTML</option>
                  {INITIAL_TEMPLATES.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name} ({tmpl.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Variables editor */}
              {currentTmpl && currentTmpl.variables && (
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Template Variables (Live Replaced)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentTmpl.variables.map((v) => (
                      <div key={v.key} className="space-y-0.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-gray-600 font-medium">{v.label}</span>
                          <code className="text-[10px] text-blue-600 font-mono">{`{{${v.key}}}`}</code>
                        </div>
                        <input
                          type="text"
                          value={templateVariables[v.key] ?? v.defaultValue}
                          onChange={(e) =>
                            setTemplateVariables({ ...templateVariables, [v.key]: e.target.value })
                          }
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 text-xs focus:border-blue-500 outline-hidden font-mono"
                          placeholder={v.defaultValue}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* VIEW SWITCHER & CODE EDITOR */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded border border-gray-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                      viewMode === 'preview' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('html')}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                      viewMode === 'html' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    <span>HTML Source</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('text')}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                      viewMode === 'text' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Plain Text</span>
                  </button>
                </div>

                {viewMode === 'preview' && (
                  <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded border border-gray-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1 rounded transition ${
                        previewDevice === 'desktop' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                      title="Desktop Preview"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1 rounded transition ${
                        previewDevice === 'mobile' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                      title="Mobile Preview (375px)"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* If HTML Source Mode */}
              {viewMode === 'html' && (
                <div className="space-y-1">
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    rows={12}
                    id="textarea-html-source"
                    className="w-full bg-[#111827] border border-gray-800 rounded p-2.5 font-mono text-xs text-gray-200 focus:border-blue-500 outline-hidden leading-relaxed"
                    placeholder="<html><body><h1>Email Content</h1></body></html>"
                  />
                </div>
              )}

              {/* If Plain Text Mode */}
              {viewMode === 'text' && (
                <div className="space-y-1">
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    rows={10}
                    className="w-full bg-white border border-gray-300 rounded p-2.5 text-xs text-gray-900 focus:border-blue-500 outline-hidden leading-relaxed font-mono"
                    placeholder="Plain text fallback..."
                  />
                </div>
              )}

              {/* If Preview Mode on mobile view inside left column if on mobile */}
              {viewMode === 'preview' && (
                <div className="lg:hidden p-2 bg-gray-100 border border-gray-200 rounded overflow-hidden">
                  <iframe
                    title="Mobile preview"
                    srcDoc={getRenderedHtml()}
                    className="w-full h-80 bg-white rounded border border-gray-200"
                    sandbox="allow-same-origin"
                  />
                </div>
              )}
            </div>

            {/* ADVANCED SETTINGS TOGGLE (Attachments, Custom Headers, Tags) */}
            <div className="pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (Headers, Attachments, Tags)'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3 p-3 bg-gray-50 border border-gray-200 rounded text-xs">
                  {/* Attachments */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-700 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                        <span>Attachments ({attachments.length})</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAddSampleAttachment('pdf')}
                          className="px-2 py-0.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded text-[11px]"
                        >
                          + Invoice PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSampleAttachment('csv')}
                          className="px-2 py-0.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded text-[11px]"
                        >
                          + Data CSV
                        </button>
                      </div>
                    </div>

                    {attachments.length > 0 ? (
                      <div className="space-y-1">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between p-1.5 bg-white border border-gray-200 rounded text-gray-800"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{att.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono">({att.size})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(att.id)}
                              className="text-red-500 hover:text-red-700 p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-[11px]">No attachments added.</div>
                    )}
                  </div>

                  {/* Custom Headers */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-gray-700">Custom RFC Headers</label>
                      <button
                        type="button"
                        onClick={handleAddHeader}
                        className="text-blue-600 hover:text-blue-800 text-[11px] font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Header
                      </button>
                    </div>
                    <div className="space-y-1">
                      {headers.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={h.key}
                            onChange={(e) => handleUpdateHeader(i, 'key', e.target.value)}
                            placeholder="Header-Name"
                            className="w-1/2 bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 text-xs font-mono"
                          />
                          <input
                            type="text"
                            value={h.value}
                            onChange={(e) => handleUpdateHeader(i, 'value', e.target.value)}
                            placeholder="Value"
                            className="w-1/2 bg-white border border-gray-300 rounded px-2 py-1 text-gray-900 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveHeader(i)}
                            className="text-gray-400 hover:text-red-600 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <label className="font-bold text-gray-700 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-purple-600" />
                      <span>Campaign & Routing Tags</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px] font-mono flex items-center gap-1"
                        >
                          <span>#{t}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="hover:text-red-700"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="+ tag (Enter)"
                        className="bg-white border border-gray-300 rounded px-2 py-0.5 text-[11px] text-gray-900 focus:border-purple-500 outline-hidden font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* DISPATCH ACTION BUTTON */}
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-4">
              <div className="text-xs text-gray-500 font-mono">
                Target Relay: <span className="font-bold text-gray-800">{smtpConfig.mode.toUpperCase()}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isSending}
                  id="btn-dispatch-email"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-bold tracking-wide transition shadow-xs"
                >
                  <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-bounce' : ''}`} />
                  <span>{isSending ? 'Dispatching...' : 'Send Email Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Responsive Canvas (5 cols) */}
        <div className="hidden lg:block lg:col-span-5 sticky top-20 space-y-3">
          <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-3.5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-700">Live Preview Frame</span>
              </div>

              <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-gray-300 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1 rounded transition ${
                    previewDevice === 'desktop' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="Desktop View (100%)"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1 rounded transition ${
                    previewDevice === 'mobile' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Email Header Preview Bar */}
            <div className="p-3 bg-gray-50/70 border-b border-gray-200 text-xs space-y-1 font-mono">
              <div className="text-gray-600 truncate">
                <span className="font-bold text-gray-400">From:</span> {fromAddress}
              </div>
              <div className="text-gray-600 truncate">
                <span className="font-bold text-gray-400">To:</span> {toInput}
              </div>
              <div className="text-gray-900 font-bold truncate">
                <span className="font-bold text-gray-400">Subject:</span> {subject}
              </div>
            </div>

            {/* Iframe Viewport Container */}
            <div
              className={`p-3 bg-gray-100 flex justify-center transition-all duration-200 ${
                previewDevice === 'mobile' ? 'max-w-[380px] mx-auto' : 'w-full'
              }`}
            >
              <iframe
                title="Live rendered email preview"
                srcDoc={getRenderedHtml()}
                className="w-full h-[460px] bg-white rounded border border-gray-300 shadow-xs"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
