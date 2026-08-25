# MailFlow Pro

MailFlow Pro is a local email operations workspace for composing messages, testing delivery flows, managing reusable templates, inspecting activity logs, and reviewing deliverability signals.

Intern ID: CITS7955

## Features

- Compose HTML and plain-text email messages.
- Send through a configured SMTP relay or use simulated delivery for development.
- Browse seeded and newly generated activity logs.
- Inspect a virtual inbox with delivery, open, and click states.
- Create and reuse transactional, authentication, notification, and marketing templates.
- Explore the REST API through the built-in API console.
- Test webhook payloads against a development endpoint.
- Review SPF, DKIM, DMARC, latency, and delivery metrics.
- Use the Gemini-powered assistant to generate subject lines, improve copy, audit spam risk, and create templates.

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- A Gemini API key for the assistant features

## Setup

Install the dependencies from the project directory:

```bash
npm install
```

Create a `.env` file by copying `.env.example`, then set the required values:

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
```

The application still runs without a Gemini key, but assistant requests will not be available until the key is configured.

## Development

Start the API and frontend together:

```bash
npm run dev
```

The development server uses port `3000` by default. Open the local application in a browser after the process starts.

## Production Build

Build the frontend and bundle the server:

```bash
npm run build
```

Run the compiled server:

```bash
npm start
```

The production server serves the generated frontend from `dist` and listens on port `3000`.

## Validation

Run the TypeScript check before committing changes:

```bash
npm run lint
```

The project has no external database. Email logs and simulated inbox state are stored in memory and reset whenever the server restarts.

## SMTP Modes

The default simulated mode lets you explore the interface without sending real email. SMTP settings can be configured from the application settings panel. When SMTP delivery is enabled, use a dedicated development account and verify the sender, recipient, host, port, security mode, username, and password before testing.

## API Overview

The server exposes a health endpoint and versioned email-operation endpoints. The built-in API console shows request examples and lets you exercise the available routes from the running application.

Health check:

```http
GET /api/health
```

Common operations include fetching and clearing logs, updating simulated delivery states, sending email payloads, analyzing message content, and testing webhooks.

## Project Structure

```text
index.html          Browser entry point
server.ts           Express API and Vite middleware server
src/App.tsx         Main application shell and state
src/components/     Dashboard views and modal workflows
src/data/           Built-in email templates
src/types.ts        Shared TypeScript models
```

## Notes

- Do not commit `.env` or API keys to source control.
- Use simulated delivery while developing UI workflows.
- Restart the server to reset the in-memory logs and inbox.
