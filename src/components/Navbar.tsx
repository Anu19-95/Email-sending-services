import React from 'react';
import { 
  Send, 
  ListOrdered, 
  Inbox, 
  LayoutTemplate, 
  Terminal, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Sparkles,
  Mail,
  Zap,
  Radio,
  Server
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  unreadCount?: number;
  sentCount?: number;
  inboxCount?: number;
  logsCount?: number;
  onOpenAiModal?: () => void;
  onOpenSmtpSettings?: () => void;
  onOpenAiAssistant?: () => void;
  onOpenSettings?: () => void;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  unreadCount = 0,
  sentCount = 0,
  inboxCount,
  logsCount,
  onOpenAiModal,
  onOpenSmtpSettings,
  onOpenAiAssistant,
  onOpenSettings,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) => {
  const actualUnread = inboxCount !== undefined ? inboxCount : unreadCount;
  const actualSent = logsCount !== undefined ? logsCount : sentCount;
  const handleOpenAi = onOpenAiModal || onOpenAiAssistant || (() => {});
  const handleOpenSettings = onOpenSmtpSettings || onOpenSettings || (() => {});

  const coreNavItems = [
    { id: 'compose', label: 'Compose & Send', icon: Send },
    { id: 'logs', label: 'Activity Logs', icon: ListOrdered, badge: actualSent > 0 ? actualSent : null },
    { id: 'inbox', label: 'Virtual Inbox', icon: Inbox, badge: actualUnread > 0 ? actualUnread : null, badgeColor: 'bg-blue-600 text-white' },
    { id: 'templates', label: 'Templates Hub', icon: LayoutTemplate },
    { id: 'api', label: 'REST API & SDK', icon: Terminal },
    { id: 'analytics', label: 'Deliverability & Health', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[#111827] text-gray-300 flex flex-col border-r border-gray-800 shrink-0 h-full">
      {/* Brand Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs shadow-xs">
            M
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider text-white uppercase">MailFlow Pro</div>
            <div className="text-[10px] text-gray-400 font-mono">SMTP & REST v2.4.1</div>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-gray-800 text-gray-400 border border-gray-700 px-1.5 py-0.5 rounded">
          DEV
        </span>
      </div>

      {/* Navigation Groups */}
      <div className="p-3 flex-1 overflow-y-auto space-y-4">
        {/* Core Engine Group */}
        <div>
          <div className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 px-2 tracking-widest">
            Core Engine
          </div>
          <nav className="space-y-0.5">
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    onTabChange(item.id);
                    if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white font-semibold shadow-xs'
                      : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      item.badgeColor || 'bg-gray-700 text-gray-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Intelligence & System Group */}
        <div>
          <div className="text-[10px] uppercase font-bold text-gray-500 mb-1.5 px-2 tracking-widest">
            Intelligence & System
          </div>
          <nav className="space-y-0.5">
            <button
              onClick={handleOpenAi}
              id="btn-nav-ai-assistant"
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium text-gray-400 hover:bg-purple-950/40 hover:text-purple-300 border border-transparent hover:border-purple-800/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>AI Email Assistant</span>
              </div>
              <span className="text-[9px] uppercase font-bold bg-purple-900/60 text-purple-300 px-1.5 py-0.2 rounded border border-purple-700/50">
                Gemini
              </span>
            </button>

            <button
              onClick={handleOpenSettings}
              id="btn-nav-smtp-settings"
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Settings className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>SMTP Relay Config</span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">Port 587</span>
            </button>
          </nav>
        </div>

        {/* Health & SPF Overview */}
        <div className="p-3 bg-gray-900/80 border border-gray-800 rounded text-xs space-y-2">
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center justify-between">
            <span>DNS Authentication</span>
            <ShieldCheck className="w-3 h-3 text-green-400" />
          </div>
          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-500">SPF</span>
              <span className="text-green-400 font-bold">PASS (+all)</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-500">DKIM</span>
              <span className="text-green-400 font-bold">rsa-sha256</span>
            </div>
            <div className="flex justify-between items-center text-gray-300">
              <span className="text-gray-500">DMARC</span>
              <span className="text-blue-400 font-bold">p=quarantine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Footer */}
      <div className="p-3 border-t border-gray-800 text-xs flex items-center justify-between bg-[#0e1420]">
        <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[11px]">Relay: Online</span>
        </div>
        <span className="text-gray-500 font-mono text-[10px] bg-gray-800 px-1.5 py-0.5 rounded">
          250 OK
        </span>
      </div>
    </aside>
  );
};
