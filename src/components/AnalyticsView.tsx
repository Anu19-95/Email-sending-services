import React from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Activity, 
  Globe, 
  Zap, 
  Flame, 
  Clock,
  Sparkles
} from 'lucide-react';
import { EmailLog } from '../types';

interface AnalyticsViewProps {
  logs: EmailLog[];
  onOpenAiAssistant: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ logs, onOpenAiAssistant }) => {
  const totalSent = logs.length;
  const delivered = logs.filter(l => l.status === 'delivered' || l.status === 'opened' || l.status === 'clicked').length;
  const opened = logs.filter(l => l.status === 'opened' || l.status === 'clicked').length;
  const clicked = logs.filter(l => l.status === 'clicked').length;
  const bounced = logs.filter(l => l.status === 'bounced').length;

  const deliveryRate = totalSent > 0 ? ((delivered / totalSent) * 100).toFixed(1) : '100.0';
  const openRate = delivered > 0 ? ((opened / delivered) * 100).toFixed(1) : '0.0';
  const clickRate = opened > 0 ? ((clicked / opened) * 100).toFixed(1) : '0.0';
  const bounceRate = totalSent > 0 ? ((bounced / totalSent) * 100).toFixed(1) : '0.0';

  const avgLatency = logs.length > 0 
    ? Math.round(logs.reduce((acc, curr) => acc + (curr.latencyMs || 0), 0) / logs.length) 
    : 142;

  // Domain breakdown
  const domainCounts: Record<string, number> = {};
  logs.forEach(l => {
    l.to.forEach(addr => {
      const parts = addr.split('@');
      const domain = parts[1] || 'other';
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });
  });

  const topDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const mockWeeklyData = [
    { day: 'Mon', count: 42, color: 'bg-blue-600' },
    { day: 'Tue', count: 68, color: 'bg-blue-600' },
    { day: 'Wed', count: 89, color: 'bg-blue-600' },
    { day: 'Thu', count: 110, color: 'bg-blue-600' },
    { day: 'Fri', count: 95, color: 'bg-blue-600' },
    { day: 'Sat', count: 34, color: 'bg-blue-600' },
    { day: 'Sun (Today)', count: totalSent || 28, color: 'bg-emerald-600' },
  ];

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-800">Deliverability & Telemetry</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-green-100 text-green-800">
                HEALTH: 99.8%
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Live inbox placement monitoring, DNS authentication audit & real-time gateway metrics
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded text-xs font-medium transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Audit Spam Score</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-3 bg-white border border-gray-200 rounded shadow-xs space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Processed Emails</div>
          <div className="text-xl font-black text-gray-900">{totalSent}</div>
          <div className="text-[10px] text-gray-400 font-mono">Live test session volume</div>
        </div>

        <div className="p-3 bg-white border border-gray-200 rounded shadow-xs space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Delivery Rate</div>
          <div className="text-xl font-black text-green-600">{deliveryRate}%</div>
          <div className="text-[10px] text-green-700 font-medium">99.9% target SLA</div>
        </div>

        <div className="p-3 bg-white border border-gray-200 rounded shadow-xs space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Open Rate</div>
          <div className="text-xl font-black text-blue-600">{openRate}%</div>
          <div className="text-[10px] text-blue-700 font-medium">{opened} recipients opened</div>
        </div>

        <div className="p-3 bg-white border border-gray-200 rounded shadow-xs space-y-0.5">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Click Rate (CTR)</div>
          <div className="text-xl font-black text-purple-600">{clickRate}%</div>
          <div className="text-[10px] text-purple-700 font-medium">{clicked} link clicks</div>
        </div>

        <div className="p-3 bg-white border border-gray-200 rounded shadow-xs space-y-0.5 col-span-2 lg:col-span-1">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Gateway Latency</div>
          <div className="text-xl font-black text-amber-600">{avgLatency} ms</div>
          <div className="text-[10px] text-amber-700 font-medium font-mono">Global MX Handshake</div>
        </div>
      </div>

      {/* SECTION 2: DNS AUTHENTICATION & SECURITY STATUS */}
      <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              DNS Authentication & Protocol Verification
            </h3>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-green-100 text-green-800">
            SENDER SCORE: 99.8 / 100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
          {/* SPF */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-900">SPF Record</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            </div>
            <code className="text-[10px] text-green-800 font-mono block bg-white p-1.5 rounded border border-gray-200 break-all">
              v=spf1 include:_spf.service.mail ~all
            </code>
            <p className="text-[10px] text-gray-500 leading-tight">
              Designates authorized outbound IP ranges to eliminate sender spoofing.
            </p>
          </div>

          {/* DKIM */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-900">DKIM 2048-bit</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            </div>
            <code className="text-[10px] text-green-800 font-mono block bg-white p-1.5 rounded border border-gray-200 break-all">
              s=202608 d=service.mail (RSA-256)
            </code>
            <p className="text-[10px] text-gray-500 leading-tight">
              Cryptographic header signatures guarantee email payload integrity in transit.
            </p>
          </div>

          {/* DMARC */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-900">DMARC Policy</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            </div>
            <code className="text-[10px] text-green-800 font-mono block bg-white p-1.5 rounded border border-gray-200 break-all">
              v=DMARC1; p=reject; rua=mailto:dmarc@...
            </code>
            <p className="text-[10px] text-gray-500 leading-tight">
              Enforces strict rejection policy for unauthenticated impostor traffic.
            </p>
          </div>

          {/* TLS */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-gray-900">Opportunistic TLS</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            </div>
            <code className="text-[10px] text-green-800 font-mono block bg-white p-1.5 rounded border border-gray-200 break-all">
              TLSv1.3 ECDHE-RSA-AES256-GCM
            </code>
            <p className="text-[10px] text-gray-500 leading-tight">
              End-to-end socket level encryption during SMTP relay handshake.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: VOLUME VISUALIZATION & DOMAIN BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Weekly Throughput (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Weekly Ingestion Volume</h3>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">Total: 462 Emails</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 p-4">
            {mockWeeklyData.map((item, idx) => {
              const heightPercent = Math.max(Math.round((item.count / 120) * 100), 12);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <div className="text-[10px] text-gray-500 font-mono font-semibold opacity-0 group-hover:opacity-100 transition">
                    {item.count}
                  </div>
                  <div className="w-full bg-gray-100 rounded-t h-28 flex items-end p-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full ${item.color} rounded-xs transition-all duration-300 shadow-xs`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-600 font-medium text-center truncate max-w-full">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Destination Domains (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-purple-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Top Recipient Domains</h3>
            </div>
          </div>

          <div className="space-y-3 p-4 text-xs">
            {topDomains.length > 0 ? (
              topDomains.map(([domain, count], i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between font-medium text-xs">
                    <span className="text-gray-800">{domain}</span>
                    <span className="text-gray-500 font-mono">{count} dispatches</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(Math.round((count / (totalSent || 1)) * 100), 100)}%` }}
                      className="bg-purple-600 h-full rounded-full"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-2.5">
                {['example.com', 'company.io', 'enterprise.com'].map((domain, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between font-medium text-xs">
                      <span className="text-gray-800">{domain}</span>
                      <span className="text-gray-400 font-mono text-[11px]">1 dispatches</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div style={{ width: '40%' }} className="bg-purple-600 h-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
