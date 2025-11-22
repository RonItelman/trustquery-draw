import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { LLMHandler } from './LLMHandler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from root directory
app.use(express.static(path.join(__dirname, '..')));

// Serve dist directory for bundled files
app.use('/dist', express.static(path.join(__dirname, '../dist')));

// Serve examples directory
app.use('/examples', express.static(path.join(__dirname, '../examples')));

// Serve fonts directory
app.use('/fonts', express.static(path.join(__dirname, '../fonts')));

// Initialize LLM Handler
const llmHandler = new LLMHandler();

/**
 * POST /api/generate-diagram
 * Generate diagram commands from natural language
 *
 * Body:
 * - prompt: string (user's natural language description)
 * - model: string (optional, model to use)
 *
 * Response:
 * - commands: string[] (array of diagram commands)
 * - usage: object (token usage)
 */
app.post('/api/generate-diagram', async (req, res) => {
  try {
    const { prompt, model } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Prompt is required and must be a string',
      });
    }

    // Get user identifier for rate limiting (IP address)
    const userId = req.ip || req.connection.remoteAddress || 'unknown';

    console.log(`[API] Generate diagram request from ${userId}:`, prompt);

    // Generate diagram
    const result = await llmHandler.generateDiagram(
      prompt,
      model || 'claude-3-5-sonnet-20241022',
      userId
    );

    console.log(`[API] Generated ${result.commands.length} commands`);

    res.json({
      success: true,
      commands: result.commands,
      usage: result.usage,
    });
  } catch (error) {
    console.error('[API] Error generating diagram:', error);

    if (error.message === 'Rate limit exceeded. Please try again later.') {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: error.message,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * GET /api/rate-limit/:userId
 * Get rate limit status for a user
 */
app.get('/api/rate-limit/:userId', (req, res) => {
  const userId = req.params.userId || req.ip || 'unknown';
  const status = llmHandler.getRateLimitStatus(userId);

  res.json({
    success: true,
    ...status,
  });
});

/**
 * GET /api/rate-limit
 * Get rate limit status for current user (by IP)
 */
app.get('/api/rate-limit', (req, res) => {
  const userId = req.ip || req.connection.remoteAddress || 'unknown';
  const status = llmHandler.getRateLimitStatus(userId);

  res.json({
    success: true,
    userId,
    ...status,
  });
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/refresh-prompt
 * Refresh the system prompt from CommandRegistry
 * (useful during development)
 */
app.post('/api/refresh-prompt', (req, res) => {
  try {
    llmHandler.refreshSystemPrompt();
    res.json({
      success: true,
      message: 'System prompt refreshed',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to refresh prompt',
      message: error.message,
    });
  }
});

// Serve the main application
app.get('/', (req, res) => {
  res.redirect('/examples/basic.html');
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 TrustQuery Diagram Server');
  console.log('================================');
  console.log(`📱 Application: http://localhost:${PORT}`);
  console.log(`📊 Examples: http://localhost:${PORT}/examples/basic.html`);
  console.log(`🤖 API endpoint: http://localhost:${PORT}/api/generate-diagram`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log('================================');
  console.log('');
});

export default app;
