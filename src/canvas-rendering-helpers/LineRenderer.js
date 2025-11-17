import ShapeRenderer from './ShapeRenderer.js';
import ColorParser from './ColorParser.js';
import CanvasUtils from './CanvasUtils.js';

/**
 * Renders line shapes
 */
export default class LineRenderer extends ShapeRenderer {
  render(ctx, props) {
    const {
      x1 = 0,
      y1 = 0,
      x2 = 100,
      y2 = 100,
      strokeColor = '#000',
      strokeWidth = 1,
      lineCap = 'butt',
      lineDash = []
    } = props;

    CanvasUtils.applyStyles(ctx, props);

    ctx.strokeStyle = ColorParser.parse(strokeColor);
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = lineCap;
    ctx.setLineDash(lineDash);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
