import RectangleRenderer from './canvas-rendering-helpers/RectangleRenderer.js';
import CircleRenderer from './canvas-rendering-helpers/CircleRenderer.js';
import EllipseRenderer from './canvas-rendering-helpers/EllipseRenderer.js';
import LineRenderer from './canvas-rendering-helpers/LineRenderer.js';
import TextRenderer from './canvas-rendering-helpers/TextRenderer.js';
import PolygonRenderer from './canvas-rendering-helpers/PolygonRenderer.js';

export default class CanvasRenderer {
  constructor() {
    // Initialize shape renderers
    this.renderers = {
      rectangle: new RectangleRenderer(),
      rect: new RectangleRenderer(),
      circle: new CircleRenderer(),
      ellipse: new EllipseRenderer(),
      line: new LineRenderer(),
      text: new TextRenderer(),
      polygon: new PolygonRenderer()
    };
  }

  /**
   * Render visualization on canvas
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {string|Object} params - Parameters from =draw(params) - can be object or JSON string
   */
  render(canvas, params) {
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      // Parse params if it's a string
      const drawConfig = typeof params === 'string' ? this.parseParams(params) : params;

      // Render each shape in the config
      this.renderShapes(ctx, drawConfig);

      console.log('[CanvasRenderer] Rendered shapes:', drawConfig);
    } catch (error) {
      console.error('[CanvasRenderer] Error rendering:', error);
      this.renderError(ctx, error.message);
    }
  }

  /**
   * Parse params string into object
   * @param {string} params - JSON string or object literal
   * @returns {Object} Parsed configuration
   */
  parseParams(params) {
    let cleaned = params.trim();

    // Try to parse as JS object or JSON
    try {
      // If it starts with {, try to evaluate it as a JS object
      if (cleaned.startsWith('{')) {
        // Use Function constructor to safely evaluate object literal
        // This allows for unquoted property names and color values like 'red'
        return new Function('return ' + cleaned)();
      }
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('[CanvasRenderer] Failed to parse params:', e);
      throw new Error('Invalid draw syntax. Expected a JavaScript object.');
    }
  }

  /**
   * Render all shapes from the configuration
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} config - Draw configuration object
   */
  renderShapes(ctx, config) {
    // Iterate through each shape type in the config
    for (const [shapeType, shapeProps] of Object.entries(config)) {
      // Handle arrays of shapes or single shape
      const shapes = Array.isArray(shapeProps) ? shapeProps : [shapeProps];

      shapes.forEach(props => {
        this.renderShape(ctx, shapeType, props);
      });
    }
  }

  /**
   * Render a single shape using the appropriate renderer
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} shapeType - Type of shape (rectangle, circle, line, text, etc.)
   * @param {Object} props - Shape properties
   */
  renderShape(ctx, shapeType, props) {
    const renderer = this.renderers[shapeType.toLowerCase()];

    if (renderer) {
      ctx.save();
      renderer.render(ctx, props);
      ctx.restore();
    } else {
      console.warn(`[CanvasRenderer] Unknown shape type: ${shapeType}`);
    }
  }

  /**
   * Render error message on canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} message
   */
  renderError(ctx, message) {
    ctx.fillStyle = '#ff0000';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Error: ${message}`, 20, 30);
  }
}
