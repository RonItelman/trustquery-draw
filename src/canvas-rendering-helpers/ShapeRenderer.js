import ColorParser from './ColorParser.js';
import CanvasUtils from './CanvasUtils.js';

/**
 * Base class for shape renderers
 */
export default class ShapeRenderer {
  /**
   * Render a shape
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} props
   */
  render(ctx, props) {
    throw new Error('render() must be implemented by subclass');
  }

  /**
   * Apply fill styling
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} props
   */
  applyFill(ctx, props) {
    if (props.backgroundColor || props.fillColor) {
      const color = props.backgroundColor || props.fillColor;
      ctx.fillStyle = ColorParser.parse(color);
      ctx.fill();
    }
  }

  /**
   * Apply stroke/border styling
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} props
   */
  applyStroke(ctx, props) {
    if (props.borderColor || props.strokeColor) {
      const color = props.borderColor || props.strokeColor;
      ctx.strokeStyle = ColorParser.parse(color);
      ctx.lineWidth = props.borderWidth || props.strokeWidth || 1;
      ctx.stroke();
    }
  }

  /**
   * Draw text within a shape
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} props
   * @param {number} centerX
   * @param {number} centerY
   */
  drawText(ctx, props, centerX, centerY) {
    if (!props.text) return;

    const {
      text,
      textColor = '#000',
      fontSize = 14,
      fontFamily = 'sans-serif',
      fontWeight = 'normal',
      textAlign = 'center',
      textBaseline = 'middle'
    } = props;

    ctx.fillStyle = ColorParser.parse(textColor);
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;
    ctx.fillText(text, centerX, centerY);
  }
}
