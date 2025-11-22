# AI-Powered Diagram Generation Setup

## Overview

This application now supports AI-powered diagram generation! Type `?` followed by a natural language description, and Claude will generate the diagram for you.

**Example:**
```
?draw a login authentication flow
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk express cors dotenv
```

### 2. Configure API Key

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get your Anthropic API key from: https://console.anthropic.com/

3. Add your API key to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```

### 3. Start the Server

```bash
node server/api.js
```

The server will start on `http://localhost:3001`

### 4. Use AI Generation

In the application, type:
- `?create a decision tree for user authentication`
- `?draw an org chart with CEO and 3 departments`
- `?show a payment processing flow`

## How It Works

1. **User types `?prompt`** - The "?" triggers AI mode
2. **Frontend calls API** - Sends prompt to `/api/generate-diagram`
3. **LLM generates commands** - Claude returns array of diagram commands
4. **Commands are executed** - Diagram is created automatically

## Command Registry

All available diagram commands are registered in `server/CommandRegistry.js`. When you add new commands, they're automatically included in the LLM's system prompt.

### Adding New Commands

```javascript
// In server/CommandRegistry.js
CommandRegistry.register({
  category: 'commands',        // 'nodes', 'edges', or 'commands'
  syntax: '=newCommand(arg1, arg2)',
  description: 'What this command does',
  examples: ['=newCommand(foo, bar)'],
  notes: 'Optional helpful notes'
});
```

The LLM will automatically know about your new command!

## Rate Limiting

- Default: 100 requests per user per 24 hours
- Based on IP address
- Check status: `GET http://localhost:3001/api/rate-limit`

## API Endpoints

- `POST /api/generate-diagram` - Generate diagram from natural language
- `GET /api/rate-limit` - Check current user's rate limit status
- `GET /api/health` - Health check
- `POST /api/refresh-prompt` - Refresh system prompt (dev only)

## Security Notes

- API key is stored server-side in `.env` (never commit this!)
- `.env.example` is safe to commit (no secrets)
- Rate limiting prevents abuse
- CORS enabled for localhost development

## Troubleshooting

### "API key not found"
- Make sure `.env` file exists with `ANTHROPIC_API_KEY`
- Restart the server after adding the API key

### "Rate limit exceeded"
- Wait 24 hours or increase `RATE_LIMIT_MAX` in `.env`
- Check status: `curl http://localhost:3001/api/rate-limit`

### "Connection refused"
- Make sure the server is running: `node server/api.js`
- Check the port (default 3001)

## Cost Management

Set a usage limit in your Anthropic dashboard to prevent unexpected charges:
https://console.anthropic.com/settings/limits
