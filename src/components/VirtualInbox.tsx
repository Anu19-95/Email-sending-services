import React, { useState } from 'react';
import { 
  Inbox, 
  Search, 
  Mail, 
  MailOpen, 
  Paperclip, 
  Clock, 
  User, 
  Trash2, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  ExternalLink
} from 'lucide-react';
import { EmailLog } from '../types';

interface VirtualInboxProps {
  logs: EmailLog[];
  onMarkAsRead: (id: string, isRead: boolean) => void;
  onClearInbox: () => void;
}

export const VirtualInbox: React.FC<VirtualInboxProps> = ({
  logs,
  onMarkAsRead,
  onClearInbox,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(logs.length > 0 ? logs[0].id : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');
  const [viewDevice, setViewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Filter delivered messages
  const deliveredMessages = logs.filter(l => l.status !== 'bounced');

  const filteredMessages = deliveredMessages.filter((msg) => {
    const matchesSearch =
      searchQuery === '' ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.to.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRead = filterMode === 'all' || !msg.isReadInInbox;

    return matchesSearch && matchesRead;
  });

  const selectedMessage = logs.find(l => l.id === selectedId) || (filteredMessages.length > 0 ? filteredMessages[0] : null);

  const handleSelect = (msg: EmailLog) => {
    setSelectedId(msg.id);
    if (!msg.isReadInInbox) {
      onMarkAsRead(msg.id, true);
    }
  };

  const unreadCount = deliveredMessages.filter(m => !m.isReadInInbox).length;

  return (
    <div className="space-y-4">
      {/* Top Banner / Stats */}
      <div className="bg-white border border-gray-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-800">In-App Virtual Mailbox</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                {unreadCount} UNREAD
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Live recipient environment to inspect rendered HTML emails and verification headers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearInbox}
            disabled={deliveredMessages.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-gray-700 rounded text-xs font-medium transition disabled:opacity-50"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Mailbox</span>
          </button>
        </div>
      </div>

      {/* Split Pane Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white border border-gray-200 shadow-xs overflow-hidden min-h-[580px]">
        {/* LEFT PANE: Message List (5 cols) */}
        <div className="lg:col-span-5 border-r border-gray-200 flex flex-col bg-gray-50/50">
          {/* List Search & Filter Header */}
          <div className="p-3 border-b border-gray-200 space-y-2 bg-gray-50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipient inbox..."
                className="w-full bg-white border border-gray-300 rounded text-xs pl-8 pr-3 py-1.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-gray-300 text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`flex-1 py-1 rounded text-[11px] font-medium transition ${
                  filterMode === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({deliveredMessages.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('unread')}
                className={`flex-1 py-1 rounded text-[11px] font-medium transition ${
                  filterMode === 'unread' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[540px]">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                const isUnread = !msg.isReadInInbox;

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelect(msg)}
                    className={`p-3 cursor-pointer transition relative ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-blue-600'
                        : 'hover:bg-gray-100/70 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                        )}
                        <span className={`text-xs truncate ${isUnread ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                          {msg.from}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className={`text-xs mt-1 truncate ${isUnread ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>
                      {msg.subject}
                    </div>

                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-gray-400 font-mono">
                      <span className="truncate max-w-[170px]">To: {msg.to.join(', ')}</span>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <span className="flex items-center gap-0.5 text-gray-500 font-bold">
                          <Paperclip className="w-3 h-3" />
                          <span>{msg.attachments.length}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                No messages found in mailbox.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Email Reading Pane (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              {/* Message Header bar */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-green-100 text-green-800 flex items-center gap-1 uppercase">
                        <ShieldCheck className="w-3 h-3" /> SPF / DKIM Pass
                      </span>
                      <span className="text-[11px] text-gray-500 font-mono">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Device Toggle */}
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-gray-300 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewDevice('desktop')}
                      className={`p-1 rounded ${
                        viewDevice === 'desktop' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500 hover:text-gray-900'
                      }`}
                      title="Desktop View"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewDevice('mobile')}
                      className={`p-1 rounded ${
                        viewDevice === 'mobile' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500 hover:text-gray-900'
                      }`}
                      title="Mobile View"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sender/Receiver Details */}
                <div className="p-2.5 bg-white rounded border border-gray-200 text-xs space-y-0.5 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">From: <strong className="text-gray-800">{selectedMessage.from}</strong></span>
                    {selectedMessage.previewUrl && (
                      <a
                        href={selectedMessage.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>Ethereal Preview</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div className="text-gray-500">
                    To: <span className="text-gray-800">{selectedMessage.to.join(', ')}</span>
                  </div>
                  {selectedMessage.cc && (
                    <div className="text-gray-500">
                      CC: <span className="text-gray-800">{selectedMessage.cc.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Attachments pills */}
                {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Attachments:</span>
                    {selectedMessage.attachments.map((att, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white border border-gray-300 text-gray-700 text-xs flex items-center gap-1 font-medium font-mono"
                      >
                        <Paperclip className="w-3 h-3 text-blue-600" />
                        <span>{att.name}</span>
                        <span className="text-[10px] text-gray-400">({att.size})</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Email Content Frame */}
              <div className="p-3 flex-1 flex justify-center bg-gray-100 overflow-y-auto">
                <div
                  className={`bg-white rounded border border-gray-300 shadow-xs overflow-hidden transition-all duration-200 ${
                    viewDevice === 'mobile' ? 'w-[375px]' : 'w-full'
                  }`}
                >
                  <iframe
                    title="Rendered Inbox Message"
                    srcDoc={selectedMessage.html || `<div style="font-family: sans-serif; padding: 20px;">${selectedMessage.text}</div>`}
                    className="w-full h-[480px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-12 text-center text-gray-400 text-xs">
              Select an email from the left pane to view rendered payload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
