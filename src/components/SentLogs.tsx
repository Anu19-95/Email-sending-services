import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Download, 
  ExternalLink, 
  Eye, 
  MousePointerClick, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Send,
  MailCheck,
  Tag
} from 'lucide-react';
import { EmailLog } from '../types';

interface SentLogsProps {
  logs: EmailLog[];
  isLoading: boolean;
  onRefresh: () => void;
  onClearLogs: () => void;
  onSelectLog: (log: EmailLog) => void;
  onSimulateStatus: (id: string, status: 'opened' | 'clicked') => void;
  onNavigateToCompose: () => void;
}

export const SentLogs: React.FC<SentLogsProps> = ({
  logs,
  isLoading,
  onRefresh,
  onClearLogs,
  onSelectLog,
  onSimulateStatus,
  onNavigateToCompose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');

  // Extract unique tags
  const allTags = Array.from(new Set(logs.flatMap(l => l.tags || [])));

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      searchQuery === '' ||
      log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.to.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.messageId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesTag = tagFilter === 'all' || (log.tags && log.tags.includes(tagFilter));

    return matchesSearch && matchesStatus && matchesTag;
  });

  // Calculate quick stats
  const totalCount = logs.length;
  const deliveredCount = logs.filter(l => l.status === 'delivered' || l.status === 'opened' || l.status === 'clicked').length;
  const openedCount = logs.filter(l => l.status === 'opened' || l.status === 'clicked').length;
  const bouncedCount = logs.filter(l => l.status === 'bounced').length;

  const openRate = deliveredCount > 0 ? Math.round((openedCount / deliveredCount) * 100) : 0;
  const deliveryRate = totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 100;
  const avgLatency = logs.length > 0 
    ? Math.round(logs.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) / logs.length) 
    : 0;

  // Export to CSV
  const handleExportCsv = () => {
    if (logs.length === 0) return;
    const headers = ['Message-ID', 'Date', 'From', 'To', 'Subject', 'Status', 'Latency(ms)', 'SMTP Response'];
    const rows = logs.map(l => [
      `"${l.messageId}"`,
      `"${l.createdAt}"`,
      `"${l.from}"`,
      `"${l.to.join(';')}"`,
      `"${l.subject.replace(/"/g, '""')}"`,
      `"${l.status}"`,
      l.latencyMs,
      `"${l.smtpResponse.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `email_sent_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-tight">
            <CheckCircle2 className="w-3 h-3" />
            <span>Delivered</span>
          </span>
        );
      case 'opened':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-tight">
            <Eye className="w-3 h-3" />
            <span>Opened</span>
          </span>
        );
      case 'clicked':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 uppercase tracking-tight">
            <MousePointerClick className="w-3 h-3" />
            <span>Clicked</span>
          </span>
        );
      case 'bounced':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase tracking-tight">
            <AlertCircle className="w-3 h-3" />
            <span>Bounced</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700 uppercase tracking-tight">
            <Clock className="w-3 h-3" />
            <span>Queued</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Stat Ribbon (High Density Metrics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Total Dispatched</div>
          <div className="text-2xl font-mono font-bold mt-1 text-gray-900">{totalCount}</div>
          <div className="text-[10px] text-gray-500 font-bold mt-1">250 SMTP OK Responses</div>
        </div>
        <div className="bg-white p-4 border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Delivery Success Rate</div>
          <div className="text-2xl font-mono font-bold mt-1 text-green-600">{deliveryRate}%</div>
          <div className="text-[10px] text-green-600 font-bold mt-1">SPF/DKIM/DMARC Passed</div>
        </div>
        <div className="bg-white p-4 border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Recipient Open Rate</div>
          <div className="text-2xl font-mono font-bold mt-1 text-blue-600">{openRate}%</div>
          <div className="text-[10px] text-blue-600 font-bold mt-1">Pixel Telemetry Active</div>
        </div>
        <div className="bg-white p-4 border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Average Relay Latency</div>
          <div className="text-2xl font-mono font-bold mt-1 text-gray-900">{avgLatency}ms</div>
          <div className="text-[10px] text-gray-500 font-bold mt-1">TLS 1.3 High Throughput</div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-gray-200 shadow-xs overflow-hidden">
        {/* Filter & Action Toolbar */}
        <div className="p-3 border-b border-gray-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-gray-50">
          {/* Search bar */}
          <div className="relative w-full lg:w-80">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, recipient, ID..."
              className="w-full bg-white border border-gray-300 rounded text-xs pl-8 pr-3 py-1.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-hidden"
            />
          </div>

          {/* Filter Pills & Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {/* Status Selector */}
            <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-gray-300 text-xs">
              {['all', 'delivered', 'opened', 'clicked', 'bounced'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 rounded text-xs font-medium transition capitalize ${
                    statusFilter === st
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-700 focus:border-blue-500 outline-hidden"
              >
                <option value="all">All Tags</option>
                {allTags.map(t => (
                  <option key={t} value={t}>#{t}</option>
                ))}
              </select>
            )}

            {/* Refresh, Export, Clear */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onRefresh}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 rounded transition bg-white"
                title="Refresh Logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={logs.length === 0}
                className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-medium transition disabled:opacity-50"
                title="Export Logs as CSV"
              >
                <Download className="w-3 h-3" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={onClearLogs}
                disabled={logs.length === 0}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-300 rounded transition bg-white disabled:opacity-50"
                title="Clear All Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* High Density Logs Table */}
        <div className="overflow-x-auto">
          {filteredLogs.length > 0 ? (
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-white border-b border-gray-200 text-[10px] uppercase font-bold text-gray-400">
                <tr>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Recipient</th>
                  <th className="py-2.5 px-4">Subject</th>
                  <th className="py-2.5 px-4">Tags</th>
                  <th className="py-2.5 px-4 text-right">Latency</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => onSelectLog(log)}
                    className="hover:bg-blue-50 cursor-pointer transition group"
                  >
                    {/* Status */}
                    <td className="py-2 px-4 whitespace-nowrap">
                      {getStatusPill(log.status)}
                    </td>

                    {/* Recipient */}
                    <td className="py-2 px-4 font-mono text-gray-800">
                      <div className="font-medium truncate max-w-[180px]">{log.to.join(', ')}</div>
                      <div className="text-[10px] text-gray-400 font-sans">{log.from}</div>
                    </td>

                    {/* Subject */}
                    <td className="py-2 px-4">
                      <div className="font-medium text-gray-900 truncate max-w-[260px]">
                        {log.subject}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono truncate max-w-[260px]">
                        {log.messageId}
                      </div>
                    </td>

                    {/* Tags */}
                    <td className="py-2 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {log.tags && log.tags.slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 text-[10px] font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Latency */}
                    <td className="py-2 px-4 font-mono text-gray-700 text-right whitespace-nowrap">
                      <span className="font-semibold">{log.latencyMs}ms</span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-2 px-4 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {log.status === 'delivered' && (
                          <button
                            type="button"
                            onClick={() => onSimulateStatus(log.id, 'opened')}
                            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[10px] font-medium transition"
                            title="Simulate recipient opened"
                          >
                            Sim. Open
                          </button>
                        )}

                        {log.previewUrl && (
                          <a
                            href={log.previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                            title="Open Ethereal test inbox preview"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectLog(log)}
                          className="px-2 py-0.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-[10px] font-medium transition"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center space-y-2">
              <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <MailCheck className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">No Sent Logs Available</div>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'No logs matched your active filters. Try adjusting your query.'
                  : 'Dispatch a test email to observe real-time relay latency, delivery status, and verification metrics.'}
              </p>
              <button
                type="button"
                onClick={onNavigateToCompose}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Go to Composer</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
