import Anthropic from '@anthropic-ai/sdk';
import CommandRegistry from './CommandRegistry.js';

/**
 * LLMHandler - Handles LLM API calls for diagram generation
 */
export class LLMHandler {
  constructor(apiKey, commandRegistry = null) {
    this.anthropic = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
    });

    // Use provided registry or default singleton
    this.commandRegistry = commandRegistry || CommandRegistry;

    // Generate system prompt from registry
    this.systemPrompt = this.commandRegistry.generateSystemPrompt();

    console.log('[LLMHandler] System prompt generated from CommandRegistry');

    // Rate limiting state (in-memory, could be Redis in production)
    this.requestCounts = new Map(); // userId -> { count, resetTime }
  }

  /**
   * Regenerate system prompt (useful if commands are added dynamically)
   */
  refreshSystemPrompt() {
    this.systemPrompt = this.commandRegistry.generateSystemPrompt();
    console.log('[LLMHandler] System prompt refreshed');
  }

  /**
   * Check rate limit for a user
   * @param {string} userId - User identifier (IP, session, etc.)
   * @param {number} limit - Max requests per time window
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} - True if allowed, false if rate limited
   */
  checkRateLimit(userId, limit = 100, windowMs = 24 * 60 * 60 * 1000) {
    const now = Date.now();
    const userStats = this.requestCounts.get(userId);

    if (!userStats || now > userStats.resetTime) {
      // Reset or first request
      this.requestCounts.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    if (userStats.count >= limit) {
      return false; // Rate limited
    }

    // Increment count
    userStats.count++;
    return true;
  }

  /**
   * Generate diagram commands from natural language
   * @param {string} userPrompt - User's natural language description
   * @param {string} model - Model to use (default: claude-3-5-sonnet-20241022)
   * @param {string} userId - User identifier for rate limiting
   * @returns {Promise<{commands: string[], usage: object}>}
   */
  async generateDiagram(userPrompt, model = 'claude-3-5-haiku-20241022', userId = 'default') {
    // Check rate limit
    if (!this.checkRateLimit(userId)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      console.log('[LLMHandler] Generating diagram for prompt:', userPrompt);

      const message = await this.anthropic.messages.create({
        model: model,
        max_tokens: 1024,
        system: this.systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      console.log('[LLMHandler] Response received:', message.content[0].text);

      // Parse the response
      const responseText = message.content[0].text.trim();

      // Try to extract JSON array if wrapped in markdown code blocks
      let jsonText = responseText;
      const codeBlockMatch = responseText.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/);
      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      }

      // Parse JSON
      let commands;
      try {
        commands = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('[LLMHandler] Failed to parse JSON:', jsonText);
        throw new Error('Invalid JSON response from LLM');
      }

      if (!Array.isArray(commands)) {
        throw new Error('LLM response is not an array');
      }

      return {
        commands,
        usage: {
          input_tokens: message.usage.input_tokens,
          output_tokens: message.usage.output_tokens,
        },
      };
    } catch (error) {
      console.error('[LLMHandler] Error generating diagram:', error);
      throw error;
    }
  }

  /**
   * Get rate limit status for a user
   * @param {string} userId - User identifier
   * @returns {object} - { remaining, resetTime }
   */
  getRateLimitStatus(userId) {
    const userStats = this.requestCounts.get(userId);
    const limit = 100;

    if (!userStats) {
      return { remaining: limit, resetTime: null };
    }

    return {
      remaining: Math.max(0, limit - userStats.count),
      resetTime: userStats.resetTime,
    };
  }
}

export default LLMHandler;
