import React, { useState } from 'react';
import { 
  Terminal, 
  Code, 
  Copy, 
  CheckCircle2, 
  Play, 
  Key, 
  Webhook, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Server,
  ExternalLink
} from 'lucide-react';
import { ApiKey } from '../types';

export const ApiConsole: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<'curl' | 'node' | 'python' | 'go' | 'php'>('curl');
  const [selectedEndpoint, setSelectedEndpoint] = useState<'send' | 'logs'>('send');
  const [requestJson, setRequestJson] = useState<string>(
    JSON.stringify(
      {
        from: 'CloudPulse <noreply@service.mail>',
        to: 'sarah.dev@example.com',
        subject: 'API Automated Notification',
        html: '<div style="font-family: sans-serif; padding: 20px;"><h2>Hello from API!</h2><p>This email was dispatched via REST API payload.</p></div>',
        text: 'Hello from API! Dispatched via REST.',
        tags: ['api-dispatch', 'production'],
      },
      null,
      2
    )
  );

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseLatency, setResponseLatency] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'key_live_1',
      name: 'Default Production Key',
      key: 'sk_live_98a72f10d481b992ce',
      createdAt: '2026-08-20',
      rateLimit: 1200,
    },
    {
      id: 'key_test_2',
      name: 'Staging Sandbox Key',
      key: 'sk_test_410bf9e30a5c1840aa',
      createdAt: '2026-08-24',
      rateLimit: 100,
    },
  ]);

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/mock-endpoint-id');
  const [webhookEvent, setWebhookEvent] = useState('email.delivered');
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Execute Live API Request
  const handleExecuteRequest = async () => {
    setIsExecuting(true);
    setApiResponse(null);
    setResponseStatus(null);
    const start = Date.now();

    try {
      let endpointUrl = '/api/v1/send';
      let method = 'POST';
      let body: any = undefined;

      if (selectedEndpoint === 'send') {
        endpointUrl = '/api/v1/send';
        method = 'POST';
        body = JSON.parse(requestJson);
      } else if (selectedEndpoint === 'logs') {
        endpointUrl = '/api/v1/logs?limit=10';
        method = 'GET';
      }

      const res = await fetch(endpointUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk_live_demo',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const latency = Date.now() - start;
      const data = await res.json();

      setResponseStatus(res.status);
      setResponseLatency(latency);
      setApiResponse(data);
    } catch (err: any) {
      setResponseStatus(500);
      setApiResponse({ error: err.message || 'Request failed' });
    } finally {
      setIsExecuting(false);
    }
  };

  // Generate new API Key
  const handleCreateApiKey = () => {
    const newKey: ApiKey = {
      id: 'key_' + Date.now(),
      name: 'Custom Ingestion Key #' + (apiKeys.length + 1),
      key: 'sk_live_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString().split('T')[0],
      rateLimit: 500,
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleRevokeApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  // Test Webhook
  const handleTestWebhook = async () => {
    setIsSendingWebhook(true);
    setWebhookResult(null);
    try {
      const res = await fetch('/api/v1/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          event: webhookEvent,
        }),
      });
      const data = await res.json();
      setWebhookResult(data);
    } catch (err: any) {
      setWebhookResult({ error: err.message });
    } finally {
      setIsSendingWebhook(false);
    }
  };

  // Code generator
  const getCodeSnippet = () => {
    const origin = window.location.origin;
    switch (selectedLang) {
      case 'curl':
        return `curl -X POST "${origin}/api/v1/send" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk_live_98a72f10d481b992ce" \\
  -d '${requestJson.replace(/'/g, "\\'")}'`;

      case 'node':
        return `// Node.js 18+ (Fetch API)
const response = await fetch("${origin}/api/v1/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk_live_98a72f10d481b992ce"
  },
  body: JSON.stringify(${requestJson})
});

const result = await response.json();
console.log("Dispatched:", result.messageId);`;

      case 'python':
        return `import requests

url = "${origin}/api/v1/send"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer sk_live_98a72f10d481b992ce"
}
payload = ${requestJson.replace(/true/g, 'True').replace(/false/g, 'False')}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

      case 'go':
        return `package main

import (
	"bytes"
	"fmt"
	"net/http"
	"io"
)

func main() {
	url := "${origin}/api/v1/send"
	var jsonData = []byte(\`${requestJson}\`)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer sk_live_98a72f10d481b992ce")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	fmt.Println(string(body))
}`;

      case 'php':
        return `<?php
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${origin}/api/v1/send",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => '${requestJson.replace(/'/g, "\\'")}',
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "Authorization: Bearer sk_live_98a72f10d481b992ce"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-800">REST API & Developer Playground</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                v1.0 ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Direct programmatic integration via JSON payloads with authentication tokens and webhook simulation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded border border-gray-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Base URL: <code className="text-gray-900 font-bold">{window.location.origin}/api/v1</code></span>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE REST PLAYGROUND */}
      <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Interactive Request Console
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEndpoint}
              onChange={(e) => setSelectedEndpoint(e.target.value as any)}
              className="bg-white border border-gray-300 text-gray-800 text-xs rounded px-2.5 py-1 font-mono outline-hidden"
            >
              <option value="send">POST /api/v1/send</option>
              <option value="logs">GET /api/v1/logs</option>
            </select>

            <button
              type="button"
              onClick={handleExecuteRequest}
              disabled={isExecuting}
              id="btn-execute-api-request"
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-bold transition shadow-xs"
            >
              <Play className={`w-3 h-3 ${isExecuting ? 'animate-spin' : ''}`} />
              <span>{isExecuting ? 'Sending...' : 'Send Request'}</span>
            </button>
          </div>
        </div>

        {/* Two Column Playground */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          {/* Request Payload */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Request Body (JSON)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(requestJson, 'req-body')}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedKey === 'req-body' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              value={requestJson}
              onChange={(e) => setRequestJson(e.target.value)}
              rows={12}
              className="w-full bg-[#111827] border border-gray-800 rounded p-2.5 font-mono text-xs text-emerald-400 focus:border-blue-500 outline-hidden leading-relaxed"
            />
          </div>

          {/* Response Output */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-tight">Server Response</span>
                {responseStatus !== null && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {responseStatus} OK
                  </span>
                )}
                {responseLatency !== null && (
                  <span className="text-[10px] text-gray-400 font-mono">
                    ({responseLatency}ms)
                  </span>
                )}
              </div>

              {apiResponse && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(apiResponse, null, 2), 'res-body')}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedKey === 'res-body' ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            <div className="w-full h-[270px] bg-[#111827] border border-gray-800 rounded p-2.5 font-mono text-xs text-gray-200 overflow-y-auto">
              {apiResponse ? (
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-xs font-mono">
                  Click "Send Request" to test live API dispatch.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MULTI-LANGUAGE SDK GENERATOR */}
      <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Code className="w-3.5 h-3.5 text-purple-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Integration Code Snippets
            </h3>
          </div>

          {/* Language selector */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded border border-gray-300 text-xs">
            {[
              { id: 'curl', label: 'cURL' },
              { id: 'node', label: 'Node.js' },
              { id: 'python', label: 'Python' },
              { id: 'go', label: 'Go' },
              { id: 'php', label: 'PHP' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id as any)}
                className={`px-2.5 py-0.5 rounded font-medium transition text-xs ${
                  selectedLang === lang.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative p-4">
          <button
            type="button"
            onClick={() => copyToClipboard(getCodeSnippet(), 'code-snippet')}
            className="absolute right-6 top-6 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium rounded flex items-center gap-1 transition"
          >
            {copiedKey === 'code-snippet' ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedKey === 'code-snippet' ? 'Copied' : 'Copy Code'}</span>
          </button>
          <pre className="p-3 bg-[#111827] border border-gray-800 rounded font-mono text-xs text-blue-300 overflow-x-auto leading-relaxed">
            {getCodeSnippet()}
          </pre>
        </div>
      </div>

      {/* SECTION 3: API KEYS & WEBHOOKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* API Keys Card */}
        <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">API Keys & Tokens</h3>
            </div>
            <button
              type="button"
              onClick={handleCreateApiKey}
              className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded text-xs font-semibold transition"
            >
              <Plus className="w-3 h-3" />
              <span>Generate Key</span>
            </button>
          </div>

          <div className="p-3 space-y-2">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="p-2.5 bg-gray-50 border border-gray-200 rounded flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-gray-900">{k.name}</div>
                  <code className="text-gray-600 font-mono text-[11px] block mt-0.5">{k.key}</code>
                  <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                    Created {k.createdAt} &bull; Rate Limit: {k.rateLimit} req/min
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(k.key, k.id)}
                    className="p-1 text-gray-500 hover:text-gray-900 bg-white border border-gray-300 rounded"
                    title="Copy Key"
                  >
                    {copiedKey === k.id ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRevokeApiKey(k.id)}
                    className="p-1 text-gray-400 hover:text-red-600 bg-white border border-gray-300 rounded"
                    title="Revoke Key"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Webhooks Test Card */}
        <div className="bg-white border border-gray-200 rounded shadow-xs overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Webhook className="w-3.5 h-3.5 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Webhook Dispatcher Simulator</h3>
            </div>
          </div>

          <div className="p-3 space-y-2.5 text-xs">
            <div>
              <label className="font-bold text-gray-600 block mb-1">Target Endpoint URL</label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-900 font-mono focus:border-blue-500 outline-hidden"
                placeholder="https://api.yourdomain.com/webhooks/mail"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-600">Trigger Event:</span>
                <select
                  value={webhookEvent}
                  onChange={(e) => setWebhookEvent(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-2 py-1 text-gray-800 font-mono text-xs"
                >
                  <option value="email.delivered">email.delivered</option>
                  <option value="email.opened">email.opened</option>
                  <option value="email.bounced">email.bounced</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={isSendingWebhook || !webhookUrl.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded font-bold transition shadow-xs"
              >
                {isSendingWebhook ? 'Triggering...' : 'Dispatch Webhook'}
              </button>
            </div>

            {webhookResult && (
              <div className="p-2.5 bg-[#111827] rounded border border-gray-800 font-mono text-[11px] text-gray-200 max-h-32 overflow-y-auto">
                <pre>{JSON.stringify(webhookResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
