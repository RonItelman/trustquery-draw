import ShapeRenderer from './ShapeRenderer.js';
import CanvasUtils from './CanvasUtils.js';

/**
 * Renders ellipse shapes
 */
export default class EllipseRenderer extends ShapeRenderer {
  render(ctx, props) {
    const {
      x = 0,
      y = 0,
      radiusX = 75,
      radiusY = 50,
      rotation = 0
    } = props;

    CanvasUtils.applyStyles(ctx, props);

    // Create ellipse path
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);

    // Apply fill and stroke
    this.applyFill(ctx, props);
    this.applyStroke(ctx, props);

    // Draw text if provided
    this.drawText(ctx, props, x, y);
  }
}
