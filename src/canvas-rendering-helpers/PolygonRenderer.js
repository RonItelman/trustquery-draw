import ShapeRenderer from './ShapeRenderer.js';
import CanvasUtils from './CanvasUtils.js';

/**
 * Renders polygon shapes
 */
export default class PolygonRenderer extends ShapeRenderer {
  render(ctx, props) {
    const {
      points = [],
      closePath = true
    } = props;

    if (points.length < 2) {
      console.warn('[PolygonRenderer] Need at least 2 points');
      return;
    }

    CanvasUtils.applyStyles(ctx, props);

    // Create polygon path
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    if (closePath) {
      ctx.closePath();
    }

    // Apply fill and stroke
    this.applyFill(ctx, props);
    this.applyStroke(ctx, props);
  }
}
