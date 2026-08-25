import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Copy, 
  Eye, 
  Terminal, 
  ListTree, 
  FileText, 
  Smartphone, 
  Monitor, 
  ShieldCheck,
  Send,
  MousePointerClick
} from 'lucide-react';
import { EmailLog } from '../types';

interface EmailDetailModalProps {
  log: EmailLog | null;
  isOpen: boolean;
  onClose: () => void;
  onSimulateStatus?: (id: string, status: 'opened' | 'clicked') => void;
  onDuplicateToComposer?: (log: EmailLog) => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({
  log,
  isOpen,
  onClose,
  onSimulateStatus,
  onDuplicateToComposer,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'timeline' | 'headers' | 'json'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !log) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-green-100 text-green-800">DELIVERED (250 OK)</span>;
      case 'opened':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">OPENED</span>;
      case 'clicked':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800">CLICKED</span>;
      case 'bounced':
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-800">BOUNCED (550)</span>;
      default:
        return <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800">QUEUED</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-gray-300 rounded shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-gray-900">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-gray-900 truncate">{log.subject}</h2>
                {getStatusBadge(log.status)}
              </div>
              <div className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                {log.messageId} &bull; {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onDuplicateToComposer && (
              <button
                type="button"
                onClick={() => {
                  onDuplicateToComposer(log);
                  onClose();
                }}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-semibold rounded transition"
              >
                <Send className="w-3 h-3" />
                <span>Resend / Edit</span>
              </button>
            )}
            <button
              onClick={onClose}
              id="btn-close-detail-modal"
              className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/70 px-4 pt-1.5">
          <div className="flex gap-1">
            {[
              { id: 'preview', label: 'Visual Preview', icon: Eye },
              { id: 'timeline', label: 'Delivery Timeline', icon: ListTree },
              { id: 'headers', label: 'RFC Headers', icon: ShieldCheck },
              { id: 'json', label: 'Raw API JSON', icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 transition-all ${
                    isActive
                      ? 'border-blue-600 text-blue-700 bg-white shadow-xs rounded-t'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Simulation Trigger on Delivered Logs */}
          <div className="flex items-center gap-1.5 pb-1">
            {onSimulateStatus && log.status === 'delivered' && (
              <>
                <button
                  type="button"
                  onClick={() => onSimulateStatus(log.id, 'opened')}
                  className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded flex items-center gap-1 transition"
                  title="Simulate recipient opening email"
                >
                  <Eye className="w-3 h-3" />
                  <span>Simulate Open</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSimulateStatus(log.id, 'clicked')}
                  className="px-2 py-0.5 text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded flex items-center gap-1 transition"
                  title="Simulate recipient clicking link"
                >
                  <MousePointerClick className="w-3 h-3" />
                  <span>Simulate Click</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs">
          {/* TAB 1: VISUAL PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-xs font-mono">
                <div className="text-gray-600 truncate">
                  <span className="text-gray-400 font-bold">To: </span>
                  <span className="text-gray-900">{log.to.join(', ')}</span>
                  <span className="mx-2 text-gray-300">&bull;</span>
                  <span className="text-gray-400 font-bold">From: </span>
                  <span className="text-gray-900">{log.from}</span>
                </div>

                <div className="flex items-center gap-2">
                  {log.previewUrl && (
                    <a
                      href={log.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 bg-white border border-gray-300 hover:bg-gray-100 text-blue-600 text-[11px] font-medium rounded flex items-center gap-1"
                    >
                      <span>Ethereal URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <div className="flex items-center gap-0.5 bg-white p-0.5 rounded border border-gray-300 text-xs">
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1 rounded ${
                        previewDevice === 'desktop' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500'
                      }`}
                    >
                      <Monitor className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1 rounded ${
                        previewDevice === 'mobile' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`p-3 bg-gray-100 flex justify-center transition-all rounded border border-gray-200 ${
                  previewDevice === 'mobile' ? 'max-w-[380px] mx-auto' : 'w-full'
                }`}
              >
                <iframe
                  title="Sent Email Render"
                  srcDoc={log.html || `<p>${log.text}</p>`}
                  className="w-full h-[440px] bg-white rounded border border-gray-300 shadow-xs"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Lifecycle Handshake & Event Timeline
                </h3>
                <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-gray-200">
                  {log.timeline && log.timeline.map((evt, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-5 top-0.5 w-4 h-4 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900">{evt.stage}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-normal">{evt.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SMTP Diagnostic Info */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1">
                <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">SMTP Gateway Diagnostic</h4>
                <div className="text-xs font-mono text-green-800 bg-white p-2 rounded border border-gray-200">
                  {log.smtpResponse}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HEADERS & AUTH */}
          {activeTab === 'headers' && (
            <div className="space-y-3">
              {/* Auth Verification Badges */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded text-center">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">SPF Record</div>
                  <div className="text-xs font-bold text-green-700 mt-0.5 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> {log.spfStatus?.toUpperCase() || 'PASS'}
                  </div>
                </div>
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded text-center">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">DKIM 2048-bit</div>
                  <div className="text-xs font-bold text-green-700 mt-0.5 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> {log.dkimStatus?.toUpperCase() || 'PASS'}
                  </div>
                </div>
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded text-center">
                  <div className="text-[10px] text-gray-500 uppercase font-bold">DMARC Policy</div>
                  <div className="text-xs font-bold text-green-700 mt-0.5 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> {log.dmarcStatus?.toUpperCase() || 'PASS'}
                  </div>
                </div>
              </div>

              {/* Raw Headers Table */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1.5">
                <div className="flex items-center justify-between border-b border-gray-200 pb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">RFC 2822 Email Headers</span>
                  <button
                    type="button"
                    onClick={() => copyText(JSON.stringify(log.headers, null, 2), 'headers')}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'headers' ? 'Copied' : 'Copy Headers'}</span>
                  </button>
                </div>

                <div className="space-y-1 font-mono text-xs max-h-52 overflow-y-auto">
                  {log.headers && Object.entries(log.headers).map(([key, val]) => (
                    <div key={key} className="p-1 hover:bg-white rounded flex items-start gap-2">
                      <span className="font-bold text-gray-500 w-32 shrink-0 truncate">{key}:</span>
                      <span className="text-gray-800 break-all">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RAW API JSON */}
          {activeTab === 'json' && (
            <div className="space-y-1.5">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => copyText(JSON.stringify(log, null, 2), 'json')}
                  className="px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'json' ? 'Copied JSON' : 'Copy Full JSON'}</span>
                </button>
              </div>
              <div className="p-3 bg-[#111827] rounded border border-gray-800 font-mono text-xs text-gray-200 max-h-80 overflow-y-auto">
                <pre>{JSON.stringify(log, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
