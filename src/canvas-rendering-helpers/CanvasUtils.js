/**
 * Utility functions for canvas drawing operations
 */
export default class CanvasUtils {
  /**
   * Draw a rounded rectangle path
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {number|string} radius
   */
  static roundRect(ctx, x, y, width, height, radius) {
    const r = typeof radius === 'number' ? radius : parseFloat(radius);

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /**
   * Apply common styling properties to context
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} props
   */
  static applyStyles(ctx, props) {
    if (props.opacity !== undefined) {
      ctx.globalAlpha = props.opacity;
    }

    if (props.shadowColor) {
      ctx.shadowColor = props.shadowColor;
      ctx.shadowBlur = props.shadowBlur || 0;
      ctx.shadowOffsetX = props.shadowOffsetX || 0;
      ctx.shadowOffsetY = props.shadowOffsetY || 0;
    }
  }

  /**
   * Parse numeric value with unit (e.g., "10px" -> 10)
   * @param {number|string} value
   * @returns {number}
   */
  static parseNumeric(value) {
    if (typeof value === 'number') return value;
    return parseFloat(String(value));
  }
}
