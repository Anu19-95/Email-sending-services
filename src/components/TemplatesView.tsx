import React, { useState } from 'react';
import { 
  LayoutTemplate, 
  Eye, 
  Code, 
  Copy, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  Monitor, 
  Layers
} from 'lucide-react';
import { EmailTemplate } from '../types';
import { INITIAL_TEMPLATES } from '../data/templates';

interface TemplatesViewProps {
  onUseTemplate: (templateId: string, variables?: Record<string, string>) => void;
  onOpenAiAssistant: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onUseTemplate,
  onOpenAiAssistant,
}) => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(INITIAL_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0].id);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);

  // Variables state for selected template
  const [variables, setVariables] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    templates[0].variables.forEach((v) => {
      initial[v.key] = v.defaultValue;
    });
    return initial;
  });

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleSelectTemplate = (tmpl: EmailTemplate) => {
    setSelectedTemplateId(tmpl.id);
    const newVars: Record<string, string> = {};
    tmpl.variables.forEach((v) => {
      newVars[v.key] = v.defaultValue;
    });
    setVariables(newVars);
  };

  // Interpolate HTML with current variables
  const getRenderedHtml = () => {
    let html = selectedTemplate.html;
    Object.entries(variables).forEach(([k, v]) => {
      html = html.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v);
    });
    return html;
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(selectedTemplate.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = ['All', 'Auth', 'Transactional', 'Notification', 'Marketing'];

  const filteredTemplates = templates.filter(
    (t) => categoryFilter === 'All' || t.category === categoryFilter
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <LayoutTemplate className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-800">Email Template Repository</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                {templates.length} PRE-BUILT
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Production-ready HTML email components compatible with Gmail, Apple Mail, Outlook & mobile clients
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded text-xs font-medium transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Generate with AI</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: Template Gallery & Variable Customizer (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded border border-gray-200 text-xs overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded font-medium whitespace-nowrap text-xs transition ${
                  categoryFilter === cat
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Template Card List */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
            {filteredTemplates.map((tmpl) => {
              const isSelected = selectedTemplate.id === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`p-3 rounded border cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{tmpl.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 uppercase">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400 font-mono">
                    <span>{tmpl.variables.length} Dynamic Variables</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Variable Parameter Sandbox */}
          <div className="bg-white border border-gray-200 rounded shadow-xs p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Live Variables Sandbox</span>
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Auto Replaced</span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {selectedTemplate.variables.map((v) => (
                <div key={v.key} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <label className="font-medium text-gray-700">{v.label}</label>
                    <code className="text-[10px] text-blue-600 font-mono">{`{{${v.key}}}`}</code>
                  </div>
                  <input
                    type="text"
                    value={variables[v.key] ?? v.defaultValue}
                    onChange={(e) => setVariables({ ...variables, [v.key]: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 focus:border-blue-500 outline-hidden font-mono"
                    placeholder={v.defaultValue}
                  />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCopyHtml}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-medium transition"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>

              <button
                type="button"
                onClick={() => onUseTemplate(selectedTemplate.id, variables)}
                id="btn-use-template-in-composer"
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition shadow-xs"
              >
                <Send className="w-3 h-3" />
                <span>Use in Composer</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Render Viewport (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
            {/* View Mode & Device Controls */}
            <div className="bg-gray-50 border-b border-gray-200 px-3.5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs font-bold text-gray-900">{selectedTemplate.name}</span>
                <span className="text-gray-300">&bull;</span>
                <span className="text-[11px] text-gray-500 font-mono truncate max-w-xs">
                  {selectedTemplate.subject}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Code vs Visual Toggle */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-gray-300 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('preview')}
                    className={`px-2 py-0.5 rounded font-medium transition ${
                      viewMode === 'preview' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('code')}
                    className={`px-2 py-0.5 rounded font-medium transition ${
                      viewMode === 'code' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Code className="w-3 h-3" />
                  </button>
                </div>

                {/* Device Switcher */}
                {viewMode === 'preview' && (
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-gray-300 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`p-1 rounded ${
                        previewDevice === 'desktop' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500 hover:text-gray-900'
                      }`}
                      title="Desktop View"
                    >
                      <Monitor className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`p-1 rounded ${
                        previewDevice === 'mobile' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-500 hover:text-gray-900'
                      }`}
                      title="Mobile View"
                    >
                      <Smartphone className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Viewport Frame */}
            {viewMode === 'preview' ? (
              <div
                className={`p-3 bg-gray-100 flex justify-center transition-all ${
                  previewDevice === 'mobile' ? 'max-w-[380px] mx-auto' : 'w-full'
                }`}
              >
                <iframe
                  title="Template Render Viewport"
                  srcDoc={getRenderedHtml()}
                  className="w-full h-[520px] bg-white rounded border border-gray-300 shadow-xs"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <div className="p-4 bg-[#111827] font-mono text-xs text-gray-200 max-h-[520px] overflow-y-auto">
                <pre className="whitespace-pre-wrap">{selectedTemplate.html}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
