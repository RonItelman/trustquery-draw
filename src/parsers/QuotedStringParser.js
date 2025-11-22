/**
 * QuotedStringParser - Handles quoted strings for multi-line labels
 * Extracts quoted strings and replaces them with placeholders
 */
export class QuotedStringParser {
  constructor() {
    this.quotedStrings = new Map();
    this.placeholderPrefix = '__QUOTED_';
    this.placeholderCounter = 0;
  }

  /**
   * Extract quoted strings from input and replace with placeholders
   * Supports multi-line quoted strings
   * @param {string} input - Raw input text
   * @returns {string} Input with quoted strings replaced by placeholders
   */
  extractQuotedStrings(input) {
    this.quotedStrings.clear();
    this.placeholderCounter = 0;

    // Match quoted strings (handles multi-line)
    // Matches: "text" or "multi\nline\ntext"
    const quotedPattern = /"([^"]*)"/g;

    return input.replace(quotedPattern, (match, content) => {
      const placeholder = `${this.placeholderPrefix}${this.placeholderCounter++}`;
      this.quotedStrings.set(placeholder, content);
      return placeholder;
    });
  }

  /**
   * Restore quoted strings from placeholders
   * @param {string} text - Text with placeholders
   * @returns {string} Text with original quoted strings restored
   */
  restoreQuotedStrings(text) {
    let result = text;
    this.quotedStrings.forEach((original, placeholder) => {
      result = result.replace(placeholder, original);
    });
    return result;
  }

  /**
   * Check if a string is a placeholder
   * @param {string} text - Text to check
   * @returns {boolean} True if text is a placeholder
   */
  isPlaceholder(text) {
    return text.startsWith(this.placeholderPrefix);
  }

  /**
   * Get original string from placeholder
   * @param {string} placeholder - Placeholder text
   * @returns {string} Original quoted string content
   */
  getOriginal(placeholder) {
    return this.quotedStrings.get(placeholder) || placeholder;
  }
}
