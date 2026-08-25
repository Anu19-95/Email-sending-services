import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  Server, 
  CheckCircle2, 
  Lock, 
  ShieldCheck, 
  Zap, 
  Mail,
  Info
} from 'lucide-react';
import { SmtpConfig } from '../types';

interface SmtpSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SmtpConfig;
  onSaveConfig: (newConfig: SmtpConfig) => void;
}

export const SmtpSettingsModal: React.FC<SmtpSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [mode, setMode] = useState<'simulated' | 'ethereal' | 'custom'>(config.mode);
  const [host, setHost] = useState(config.host || 'smtp.sendgrid.net');
  const [port, setPort] = useState<number>(config.port || 587);
  const [secure, setSecure] = useState<boolean>(config.secure || false);
  const [user, setUser] = useState(config.user || '');
  const [pass, setPass] = useState(config.pass || '');
  const [fromDefault, setFromDefault] = useState(config.fromDefault || 'CloudPulse <noreply@service.mail>');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      mode,
      host,
      port,
      secure,
      user,
      pass,
      fromDefault,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-gray-300 rounded shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden text-gray-900">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Settings className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">SMTP & Delivery Engine Config</h2>
              <p className="text-[11px] text-gray-500 font-mono">Routing behavior & gateway credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {savedSuccess && (
            <div className="p-2.5 bg-green-50 border border-green-200 rounded text-green-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          {/* Mode Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-gray-700 uppercase tracking-wider block text-xs">
              Dispatch Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                {
                  id: 'simulated',
                  title: 'Instant Sandbox',
                  desc: 'High-speed simulated delivery with RFC timeline',
                  icon: Zap,
                },
                {
                  id: 'ethereal',
                  title: 'Ethereal Box',
                  desc: 'Generates real web preview link on ethereal.email',
                  icon: Mail,
                },
                {
                  id: 'custom',
                  title: 'Custom SMTP',
                  desc: 'Connect your SendGrid, AWS SES or Mailgun server',
                  icon: Server,
                },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id as any)}
                    className={`p-2.5 rounded border text-left flex flex-col justify-between transition ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5 font-bold text-xs text-gray-900">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span>{m.title}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-tight">{m.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Sender */}
          <div className="space-y-1">
            <label className="font-bold text-gray-700">Default Sender Address</label>
            <input
              type="text"
              value={fromDefault}
              onChange={(e) => setFromDefault(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-900 font-mono focus:border-blue-500 outline-hidden"
              placeholder="Name <noreply@yourdomain.com>"
            />
          </div>

          {/* Custom SMTP Details if active */}
          {mode === 'custom' && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-1 text-blue-600 font-bold text-xs border-b border-gray-200 pb-1.5 uppercase tracking-tight">
                <Server className="w-3.5 h-3.5" />
                <span>Custom SMTP Server Parameters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 space-y-0.5">
                  <label className="text-[11px] font-medium text-gray-600">SMTP Host</label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 font-mono focus:border-blue-500 outline-hidden"
                    placeholder="smtp.mailgun.org"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[11px] font-medium text-gray-600">Port</label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 font-mono focus:border-blue-500 outline-hidden"
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[11px] font-medium text-gray-600">Username / API User</label>
                  <input
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 font-mono focus:border-blue-500 outline-hidden"
                    placeholder="apikey / username"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[11px] font-medium text-gray-600">Password / Secret Key</label>
                  <input
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 font-mono focus:border-blue-500 outline-hidden"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-0.5">
                <input
                  type="checkbox"
                  id="secure-tls"
                  checked={secure}
                  onChange={(e) => setSecure(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-0"
                />
                <label htmlFor="secure-tls" className="text-gray-700 cursor-pointer text-xs">
                  Use SSL/TLS (Port 465)
                </label>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded font-medium transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-smtp-settings"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition shadow-xs text-xs"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
