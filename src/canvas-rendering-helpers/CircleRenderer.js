import ShapeRenderer from './ShapeRenderer.js';
import CanvasUtils from './CanvasUtils.js';

/**
 * Renders circle shapes
 */
export default class CircleRenderer extends ShapeRenderer {
  render(ctx, props) {
    const {
      x = 0,
      y = 0,
      radius = 50
    } = props;

    CanvasUtils.applyStyles(ctx, props);

    // Create circle path
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    // Apply fill and stroke
    this.applyFill(ctx, props);
    this.applyStroke(ctx, props);

    // Draw text if provided
    this.drawText(ctx, props, x, y);
  }
}
