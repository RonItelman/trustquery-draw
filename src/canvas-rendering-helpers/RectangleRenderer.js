import ShapeRenderer from './ShapeRenderer.js';
import CanvasUtils from './CanvasUtils.js';

/**
 * Renders rectangle shapes
 */
export default class RectangleRenderer extends ShapeRenderer {
  render(ctx, props) {
    const {
      x = 0,
      y = 0,
      width = 100,
      height = 60,
      borderRadius = 0
    } = props;

    CanvasUtils.applyStyles(ctx, props);

    // Create path
    if (borderRadius > 0) {
      CanvasUtils.roundRect(ctx, x, y, width, height, borderRadius);
    } else {
      ctx.beginPath();
      ctx.rect(x, y, width, height);
    }

    // Apply fill and stroke
    this.applyFill(ctx, props);
    this.applyStroke(ctx, props);

    // Draw text if provided
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    this.drawText(ctx, props, centerX, centerY);
  }
}
