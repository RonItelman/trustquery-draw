/**
 * Helper class for parsing and normalizing color values
 */
export default class ColorParser {
  static namedColors = {
    red: '#FF0000',
    blue: '#0000FF',
    green: '#00FF00',
    yellow: '#FFFF00',
    orange: '#FFA500',
    purple: '#800080',
    pink: '#FFC0CB',
    black: '#000000',
    white: '#FFFFFF',
    gray: '#808080',
    grey: '#808080',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    lime: '#00FF00',
    navy: '#000080',
    teal: '#008080',
    olive: '#808000',
    maroon: '#800000',
    aqua: '#00FFFF',
    silver: '#C0C0C0'
  };

  /**
   * Parse color - handles named colors, hex, rgb, rgba
   * @param {string|undefined} color - Color value
   * @param {string} defaultColor - Default color if undefined
   * @returns {string} Parsed color value
   */
  static parse(color, defaultColor = '#000') {
    if (!color) return defaultColor;

    const colorStr = String(color).toLowerCase().trim();

    // Check if it's a named color
    if (this.namedColors[colorStr]) {
      return this.namedColors[colorStr];
    }

    // Return as-is for hex, rgb, rgba, hsl, etc.
    return color;
  }
}
