import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Composer } from './components/Composer';
import { SentLogs } from './components/SentLogs';
import { VirtualInbox } from './components/VirtualInbox';
import { TemplatesView } from './components/TemplatesView';
import { ApiConsole } from './components/ApiConsole';
import { AnalyticsView } from './components/AnalyticsView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { SmtpSettingsModal } from './components/SmtpSettingsModal';
import { EmailDetailModal } from './components/EmailDetailModal';
import { EmailLog, SmtpConfig, EmailPayload } from './types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Menu, 
  Sparkles, 
  Settings, 
  Send, 
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'compose' | 'inbox' | 'logs' | 'templates' | 'api' | 'analytics'>('compose');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Logs & Messages
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Settings & SMTP
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>({
    mode: 'simulated',
    fromDefault: 'CloudPulse <noreply@service.mail>',
  });
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false);

  // AI Assistant Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiInitialTab, setAiInitialTab] = useState<'subject' | 'improve' | 'spam' | 'template'>('subject');

  // State to inject into Composer from Templates or Log duplication
  const [composerInitialTemplateId, setComposerInitialTemplateId] = useState<string | null>(null);
  const [composerInitialPayload, setComposerInitialPayload] = useState<Partial<EmailPayload> | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch sent logs from backend
  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/v1/logs?limit=50');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Dispatch Email from Composer
  const handleSendEmail = async (payload: EmailPayload) => {
    try {
      const res = await fetch('/api/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          smtpConfig,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch email');
      }

      showToast(`Email dispatched successfully (ID: ${data.messageId?.substring(0, 14)}...)`, 'success');
      
      // Refresh logs
      await fetchLogs();

      if (data.previewUrl) {
        console.log('Ethereal preview URL:', data.previewUrl);
      }
    } catch (err: any) {
      showToast(err.message || 'Error dispatching email', 'error');
      throw err;
    }
  };

  // Mark Log item read/unread in Virtual Inbox
  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    setLogs(prev => prev.map(l => l.id === id ? { ...l, isReadInInbox: isRead } : l));
    try {
      await fetch(`/api/v1/logs/${id}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReadInInbox: isRead }),
      });
    } catch (err) {
      console.error('Failed to update read state', err);
    }
  };

  // Simulate Open/Click event
  const handleSimulateStatus = async (id: string, newStatus: 'opened' | 'clicked') => {
    setLogs(prev => prev.map(l => {
      if (l.id === id) {
        const updated = { ...l, status: newStatus };
        if (newStatus === 'opened' && !l.openedAt) updated.openedAt = new Date().toISOString();
        if (newStatus === 'clicked' && !l.clickedAt) {
          updated.openedAt = l.openedAt || new Date().toISOString();
          updated.clickedAt = new Date().toISOString();
        }
        return updated;
      }
      return l;
    }));

    try {
      const endpoint = newStatus === 'opened' ? `/api/v1/simulate/open/${id}` : `/api/v1/simulate/click/${id}`;
      await fetch(endpoint, { method: 'POST' });
      showToast(`Simulated status: ${newStatus.toUpperCase()}`, 'success');
    } catch (err) {
      console.error('Failed to simulate status', err);
    }
  };

  // Clear Logs
  const handleClearLogs = async () => {
    try {
      await fetch('/api/v1/logs', { method: 'DELETE' });
      setLogs([]);
      setSelectedLog(null);
      showToast('All activity logs cleared.', 'success');
    } catch (err) {
      showToast('Failed to clear logs', 'error');
    }
  };

  // Use template in Composer
  const handleUseTemplate = (templateId: string, variables?: Record<string, string>) => {
    setComposerInitialTemplateId(templateId);
    if (variables) {
      setComposerInitialPayload({ variables });
    }
    setActiveTab('compose');
    showToast('Loaded template into composer.', 'success');
  };

  // Duplicate sent log into Composer
  const handleDuplicateToComposer = (log: EmailLog) => {
    setComposerInitialPayload({
      from: log.from,
      to: log.to.join(', '),
      subject: `Re: ${log.subject}`,
      html: log.html,
      text: log.text,
      tags: log.tags,
    });
    setIsDetailModalOpen(false);
    setActiveTab('compose');
    showToast('Loaded sent email data into composer.', 'success');
  };

  // Open AI Assistant with specific tab
  const handleOpenAiAssistant = (tab: 'subject' | 'improve' | 'spam' | 'template' = 'subject') => {
    setAiInitialTab(tab);
    setIsAiModalOpen(true);
  };

  // Counts
  const unreadCount = logs.filter(l => !l.isReadInInbox && l.status !== 'bounced').length;
  const sentCount = logs.length;

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    compose: { title: 'Core Engine', subtitle: 'Compose & Dispatch' },
    logs: { title: 'Core Engine', subtitle: 'Activity Logs & Deliverability' },
    inbox: { title: 'Core Engine', subtitle: 'Virtual Test Inbox' },
    templates: { title: 'Core Engine', subtitle: 'Templates Hub' },
    api: { title: 'Core Engine', subtitle: 'REST API & SDK Explorer' },
    analytics: { title: 'Intelligence', subtitle: 'Deliverability & Health Metrics' },
  };

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] text-[#1F2937] font-sans overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-300 text-gray-900 rounded shadow-lg animate-in slide-in-from-top-2 duration-150">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span className="text-xs font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-700 ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
          sentCount={sentCount}
          onOpenAiModal={() => handleOpenAiAssistant('subject')}
          onOpenSmtpSettings={() => setIsSmtpModalOpen(true)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative z-10 w-64">
            <Navbar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              unreadCount={unreadCount}
              sentCount={sentCount}
              onOpenAiModal={() => handleOpenAiAssistant('subject')}
              onOpenSmtpSettings={() => setIsSmtpModalOpen(true)}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#F3F4F6] text-[#1F2937]">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10">
          {/* Left Title & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded md:hidden text-gray-600 hover:bg-gray-100"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-gray-400 uppercase tracking-widest text-[11px]">
                {tabTitles[activeTab]?.title || 'Dashboard'}
              </span>
              <span className="text-gray-300">/</span>
              <span className="font-semibold text-gray-800 text-xs">
                {tabTitles[activeTab]?.subtitle || 'Overview'}
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAiAssistant('subject')}
              id="btn-header-ai"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded text-xs font-medium transition"
              title="Open Gemini AI Assistant"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">AI Helper</span>
            </button>

            <button
              onClick={() => setIsSmtpModalOpen(true)}
              id="btn-header-smtp"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded text-xs font-medium transition"
              title="Configure SMTP Relay"
            >
              <Settings className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">SMTP Settings</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('compose');
                setComposerInitialPayload(null);
                setComposerInitialTemplateId('tmpl-welcome');
              }}
              id="btn-header-new-email"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </button>

            {/* Quick Profile / System Indicator */}
            <div className="w-7 h-7 rounded bg-gray-200 border border-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 ml-1">
              CP
            </div>
          </div>
        </header>

        {/* Dynamic Main Body with scroll container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'compose' && (
            <Composer
              onSend={handleSendEmail}
              onSendSuccess={fetchLogs}
              onOpenAiAssistant={() => handleOpenAiAssistant('subject')}
              smtpConfig={smtpConfig}
              initialTemplateId={composerInitialTemplateId || undefined}
              initialPayload={composerInitialPayload}
            />
          )}

          {activeTab === 'inbox' && (
            <VirtualInbox
              logs={logs}
              onMarkAsRead={handleMarkAsRead}
              onClearInbox={handleClearLogs}
            />
          )}

          {activeTab === 'logs' && (
            <SentLogs
              logs={logs}
              isLoading={isLoadingLogs}
              onRefresh={fetchLogs}
              onClearLogs={handleClearLogs}
              onSelectLog={(log) => {
                setSelectedLog(log);
                setIsDetailModalOpen(true);
              }}
              onSimulateStatus={handleSimulateStatus}
              onNavigateToCompose={() => setActiveTab('compose')}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesView
              onUseTemplate={handleUseTemplate}
              onOpenAiAssistant={() => handleOpenAiAssistant('template')}
            />
          )}

          {activeTab === 'api' && <ApiConsole />}

          {activeTab === 'analytics' && (
            <AnalyticsView
              logs={logs}
              onOpenAiAssistant={() => handleOpenAiAssistant('spam')}
            />
          )}
        </main>
      </div>

      {/* Modals with High Density Styling */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentSubject=""
        currentBody=""
        onApplySubject={() => {}}
        onApplyBody={() => {}}
      />

      <SmtpSettingsModal
        isOpen={isSmtpModalOpen}
        onClose={() => setIsSmtpModalOpen(false)}
        config={smtpConfig}
        onSaveConfig={(newConfig) => {
          setSmtpConfig(newConfig);
          showToast('SMTP settings updated.', 'success');
        }}
      />

      <EmailDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        log={selectedLog}
        onSimulateStatus={handleSimulateStatus}
        onDuplicateToComposer={handleDuplicateToComposer}
      />
    </div>
  );
}

export default App;
