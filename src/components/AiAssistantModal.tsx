import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Wand2, 
  FileCode, 
  ShieldAlert, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { SpamAnalysisResult } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubject: string;
  currentBody: string;
  onApplySubject: (subject: string) => void;
  onApplyBody: (html: string, text?: string) => void;
  onApplyTemplate?: (templateData: any) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  currentSubject,
  currentBody,
  onApplySubject,
  onApplyBody,
  onApplyTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<'subjects' | 'improve' | 'spam' | 'template'>('subjects');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subject Lines State
  const [subjectTopic, setSubjectTopic] = useState(currentSubject || currentBody.substring(0, 100) || 'Product update launch');
  const [subjectTone, setSubjectTone] = useState('High Open-Rate');
  const [generatedSubjects, setGeneratedSubjects] = useState<{ text: string; openRatePrediction: string; style: string }[]>([]);

  // Improve Copy State
  const [improvePrompt, setImprovePrompt] = useState(currentBody || 'Hi team, please find the latest weekly stats attached.');
  const [improveTone, setImproveTone] = useState('Professional & Concise');
  const [improvedResult, setImprovedResult] = useState<{
    improvedHtml: string;
    improvedText: string;
    suggestedSubject?: string;
    summaryOfImprovements?: string;
  } | null>(null);

  // Spam Audit State
  const [spamResult, setSpamResult] = useState<SpamAnalysisResult | null>(null);

  // Template Prompt State
  const [templatePrompt, setTemplatePrompt] = useState('A sleek modern dark-mode black friday discount newsletter with 30% off coupon code and clear CTA button');
  const [generatedTemplate, setGeneratedTemplate] = useState<any | null>(null);

  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateSubjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subject_lines',
          content: subjectTopic,
          tone: subjectTone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate subject lines');
      setGeneratedSubjects(data.subjects || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImproveCopy = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'improve_body',
          content: improvePrompt,
          subject: currentSubject,
          tone: improveTone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to polish email copy');
      setImprovedResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSpamCheck = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'spam_check',
          subject: currentSubject || subjectTopic,
          content: currentBody || improvePrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze deliverability');
      setSpamResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateTemplate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_template',
          prompt: templatePrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to build template');
      setGeneratedTemplate(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-gray-300 rounded shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-gray-900">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">AI Optimization Suite</h2>
              <p className="text-[11px] text-gray-500 font-mono">Gemini 3.7 Flash Intelligence Relay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="btn-close-ai-modal"
            className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 px-4 pt-1.5 gap-1 overflow-x-auto">
          {[
            { id: 'subjects', label: 'Subject Lines', icon: Wand2 },
            { id: 'improve', label: 'Rewrite & Polish', icon: RefreshCw },
            { id: 'spam', label: 'Spam & Deliverability', icon: ShieldAlert },
            { id: 'template', label: 'Generate Template', icon: FileCode },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
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

        {/* Content Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: SUBJECT LINES */}
          {activeTab === 'subjects' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Email Topic / Purpose
                </label>
                <textarea
                  value={subjectTopic}
                  onChange={(e) => setSubjectTopic(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 outline-hidden font-mono"
                  placeholder="e.g. Announcing 50% summer discount for all Pro plan subscriptions..."
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-500 font-bold uppercase">Tone:</span>
                  {['High Open-Rate', 'Curiosity', 'Professional', 'Urgent'].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setSubjectTone(tone)}
                      className={`px-2 py-0.5 text-xs rounded border transition ${
                        subjectTone === tone
                          ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSubjects}
                  disabled={isLoading || !subjectTopic.trim()}
                  id="btn-ai-generate-subjects"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded transition shadow-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isLoading ? 'Generating...' : 'Generate 5 Variations'}</span>
                </button>
              </div>

              {/* Generated Subjects List */}
              {generatedSubjects.length > 0 && (
                <div className="mt-3 space-y-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Generated Subject Suggestions
                  </h3>
                  <div className="space-y-1.5">
                    {generatedSubjects.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-gray-50 border border-gray-200 rounded flex items-center justify-between gap-2 hover:border-blue-400 transition"
                      >
                        <div className="flex-1 truncate">
                          <div className="text-xs font-medium text-gray-900 truncate">{s.text}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-green-800 bg-green-100 px-1.5 py-0.2 rounded font-mono">
                              Est. Open Rate: {s.openRatePrediction}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">{s.style}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(s.text, `subj-${idx}`)}
                            className="p-1 text-gray-500 hover:text-gray-800 bg-white border border-gray-200 rounded text-xs"
                            title="Copy to clipboard"
                          >
                            {copiedIndex === `subj-${idx}` ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onApplySubject(s.text);
                              onClose();
                            }}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold flex items-center gap-1 transition shadow-xs"
                          >
                            <span>Use</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REWRITE & POLISH */}
          {activeTab === 'improve' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Draft Body to Polish
                </label>
                <textarea
                  value={improvePrompt}
                  onChange={(e) => setImprovePrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 outline-hidden font-mono"
                  placeholder="Paste or write your raw draft..."
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-500 font-bold uppercase">Tone:</span>
                  {['Professional', 'Friendly & Casual', 'Persuasive Marketing', 'Concise Executive'].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setImproveTone(tone)}
                      className={`px-2 py-0.5 text-xs rounded border transition ${
                        improveTone === tone
                          ? 'bg-purple-100 border-purple-300 text-purple-900 font-bold'
                          : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleImproveCopy}
                  disabled={isLoading || !improvePrompt.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded transition shadow-xs"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Enhancing...' : 'Enhance Copy'}</span>
                </button>
              </div>

              {improvedResult && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded space-y-2">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="text-xs font-bold text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enhanced Email Output
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyBody(improvedResult.improvedHtml, improvedResult.improvedText);
                        if (improvedResult.suggestedSubject) onApplySubject(improvedResult.suggestedSubject);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center gap-1 transition shadow-xs"
                    >
                      <span>Apply to Composer</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {improvedResult.suggestedSubject && (
                    <div className="text-xs text-gray-800">
                      <span className="font-bold text-gray-500">Suggested Subject:</span>{' '}
                      {improvedResult.suggestedSubject}
                    </div>
                  )}

                  {improvedResult.summaryOfImprovements && (
                    <div className="p-2 bg-white rounded text-xs text-gray-600 border border-gray-200">
                      <span className="font-bold text-gray-800">Key Improvements: </span>
                      {improvedResult.summaryOfImprovements}
                    </div>
                  )}

                  <div className="p-2.5 bg-white text-gray-900 rounded border border-gray-200 text-xs max-h-40 overflow-y-auto leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: improvedResult.improvedHtml }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SPAM & DELIVERABILITY AUDIT */}
          {activeTab === 'spam' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                Scan subject and email body against SpamAssassin, Barracuda, and modern ISP filtering algorithms to maximize inbox placement.
              </p>

              <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded text-xs">
                <div className="truncate mr-2">
                  <span className="text-gray-500 font-bold">Subject: </span>
                  <span className="font-mono text-gray-800">{currentSubject || '(Empty subject)'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunSpamCheck}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded font-bold flex items-center gap-1 transition shrink-0 shadow-xs"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Scanning...' : 'Run Spam Audit'}</span>
                </button>
              </div>

              {spamResult && (
                <div className="space-y-3">
                  {/* Score Card */}
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Deliverability Score</div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className={`text-2xl font-black ${
                          spamResult.score < 25 ? 'text-green-600' : spamResult.score < 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {100 - spamResult.score} / 100
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          spamResult.score < 25
                            ? 'bg-green-100 text-green-800'
                            : spamResult.score < 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {spamResult.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-gray-600 max-w-xs leading-tight">
                      {spamResult.summary}
                    </div>
                  </div>

                  {/* Trigger Words Flags */}
                  {spamResult.flags && spamResult.flags.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                        Detected Trigger Words
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {spamResult.flags.map((flag, i) => (
                          <div key={i} className="p-2 bg-red-50/60 border border-red-200 rounded text-xs space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-red-700 font-mono">"{flag.word}"</span>
                              <span className="text-[9px] text-gray-500 bg-white px-1 py-0.2 rounded border border-gray-200 uppercase">{flag.category}</span>
                            </div>
                            <p className="text-gray-600 text-[10px]">{flag.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deliverability Tips */}
                  {spamResult.deliverabilityTips && (
                    <div className="p-2.5 bg-gray-50 border border-gray-200 rounded space-y-1">
                      <h4 className="text-[10px] font-bold uppercase text-gray-600 tracking-wider">Deliverability Recommendations</h4>
                      <ul className="space-y-0.5">
                        {spamResult.deliverabilityTips.map((tip, idx) => (
                          <li key={idx} className="text-[11px] text-gray-600 flex items-start gap-1">
                            <span className="text-blue-600 font-bold">&bull;</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GENERATE HTML TEMPLATE */}
          {activeTab === 'template' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Describe what email template you want to build
                </label>
                <textarea
                  value={templatePrompt}
                  onChange={(e) => setTemplatePrompt(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded p-2 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 outline-hidden font-mono"
                  placeholder="e.g. Modern webinar invitation with speaker photos, date & time banner, and RSVP button..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleGenerateTemplate}
                  disabled={isLoading || !templatePrompt.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded transition shadow-xs"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Generating Template...' : 'Generate Full Template'}</span>
                </button>
              </div>

              {generatedTemplate && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{generatedTemplate.templateName}</h4>
                      <p className="text-[10px] text-gray-500 font-mono">Subject: {generatedTemplate.subject}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyBody(generatedTemplate.html);
                        onApplySubject(generatedTemplate.subject);
                        if (onApplyTemplate) onApplyTemplate(generatedTemplate);
                        onClose();
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center gap-1 transition shadow-xs"
                    >
                      <span>Load into Composer</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-2 bg-[#111827] rounded text-xs font-mono text-gray-200 max-h-36 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{generatedTemplate.html}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
