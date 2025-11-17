import ShapeRenderer from './ShapeRenderer.js';
import ColorParser from './ColorParser.js';
import CanvasUtils from './CanvasUtils.js';

/**
 * Renders text
 */
export default class TextRenderer extends ShapeRenderer {
  render(ctx, props) {
    const {
      x = 0,
      y = 0,
      text = '',
      color = '#000',
      fontSize = 16,
      fontFamily = 'sans-serif',
      fontWeight = 'normal',
      textAlign = 'left',
      textBaseline = 'top',
      maxWidth
    } = props;

    CanvasUtils.applyStyles(ctx, props);

    ctx.fillStyle = ColorParser.parse(color);
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;

    if (maxWidth) {
      ctx.fillText(text, x, y, maxWidth);
    } else {
      ctx.fillText(text, x, y);
    }
  }
}
