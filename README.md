# @trustquery/trustquery-draw

Draw extension for TrustQuery - render diagrams and visualizations inline with the `=draw()` command.

## Overview

`@trustquery/trustquery-draw` is a lightweight extension that detects `=draw(<params>)` syntax in textarea elements and renders visualizations inline in the conversation flow. It creates canvas elements dynamically and can be integrated with `@trustquery/browser` or used standalone.

## Features

- **Pattern Detection**: Automatically detects `=draw(...)` commands in textarea input
- **Inline Canvas Rendering**: Creates canvas elements in the conversation flow
- **Flexible Configuration**: Customizable canvas size, trigger maps, and event handlers
- **Zero External Dependencies**: Works standalone without requiring `@trustquery/browser`
- **Placeholder Rendering**: Shows parameters until full rendering logic is implemented
- **Event Callbacks**: Hook into draw events with `onDraw` and `onError` callbacks

## Installation

```bash
npm install @trustquery/trustquery-draw
```

## Quick Start

### Basic HTML Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>TrustQuery-Diagram</title>
</head>
<body>
  <div id="output-container"></div>
  <textarea id="textarea" placeholder="Type =draw(...) command"></textarea>

  <script type="module">
    import TrustQueryDraw from '@trustquery/trustquery-draw';

    // Initialize
    const draw = TrustQueryDraw.init('textarea', 'output-container', {
      canvasWidth: 600,
      canvasHeight: 400,
      onDraw: (data) => {
        console.log('Draw command detected:', data);
      }
    });
  </script>
</body>
</html>
```

### Try It Out

1. Type in the textarea: `=draw(hello world)`
2. Press Enter or continue typing
3. A canvas element will appear in the output container with placeholder rendering

## API Reference

### `TrustQueryDraw.init(textareaId, outputContainerId, options)`

Initialize TrustQueryDraw on a textarea element.

**Parameters:**

- `textareaId` (string|HTMLElement): Textarea element or ID to watch for `=draw()` commands
- `outputContainerId` (string|HTMLElement): Container element or ID where canvas visualizations will be rendered
- `options` (Object): Configuration options

**Options:**

```javascript
{
  // Trigger map configuration
  triggerMap: {
    source: 'url',              // 'url', 'data', or null
    url: './triggers.json',     // URL to trigger map JSON
    data: {...}                 // Inline trigger map data
  },

  // Visual settings
  canvasWidth: 600,             // Canvas width in pixels (default: 600)
  canvasHeight: 400,            // Canvas height in pixels (default: 400)
  autoRender: true,             // Auto-render on detection (default: true)

  // Event callbacks
  onDraw: (data) => {},         // Called when =draw() is detected
  onError: (error) => {}        // Called on errors
}
```

**Returns:** TrustQueryDraw instance

### Instance Methods

#### `enable()`

Enable the draw extension (enabled by default).

```javascript
draw.enable();
```

#### `disable()`

Disable the draw extension.

```javascript
draw.disable();
```

#### `drawHandler.clearAll()`

Clear all rendered canvas visualizations.

```javascript
draw.drawHandler.clearAll();
```

## The `=draw()` Command

### Syntax

```
=draw(<params>)
```

Where `<params>` can be any string. The params syntax is flexible and will be defined in future versions based on visualization needs.

### Examples

```
=draw(hello world)
=draw(node: A, node: B, edge: A->B)
=draw(diagram: flowchart, direction: TB)
=draw(chart: bar, data: [1,2,3,4,5])
```

**Note:** Currently, all params are displayed as placeholders. Full rendering logic will be implemented in future versions based on the finalized params syntax.

## Integration with @trustquery/browser

`@trustquery/trustquery-draw` can be used alongside `@trustquery/browser` for a complete TrustQuery experience:

```javascript
import TrustQuery from '@trustquery/browser';
import TrustQueryDraw from '@trustquery/trustquery-draw';

// Initialize TrustQuery
const tq = new TrustQuery('textarea', {
  // TrustQuery options...
});

// Initialize Draw extension
const draw = TrustQueryDraw.init('textarea', 'output-container', {
  canvasWidth: 700,
  canvasHeight: 300
});
```

## Trigger Map Format

The trigger map follows TrustQuery's standard format:

```json
{
  "tql-triggers": {
    "draw": [
      {
        "type": "regex",
        "category": "draw-command",
        "regex": ["=draw\\(([^)]*)\\)"],
        "handler": {
          "render": true,
          "message-state": "draw",
          "message": "Draw command detected"
        }
      }
    ]
  }
}
```

## Development

### Build

```bash
npm install
npm run build
```

Output will be in `dist/trustquery-draw.js`.

### Development Mode (with watch)

```bash
npm run dev
```

### Run Demo

```bash
npm install
npm run build
npx serve examples -p 3001
```

Then open http://localhost:3001/basic.html in your browser.

## Project Structure

```
trustquery-draw/
├── src/
│   ├── TrustQueryDraw.js          # Main entry point
│   ├── DrawCommandHandler.js      # Detects =draw() and creates canvas
│   └── CanvasRenderer.js          # Placeholder rendering logic
├── dist/                           # Build output (generated)
├── examples/
│   ├── basic.html                 # Simple demo
│   └── tql-draw-triggers.json     # Trigger config for =draw()
├── package.json
├── rollup.config.js
├── README.md
└── LICENSE
```

## Roadmap

### Current Version (0.1.0)

- Pattern detection for `=draw()` commands
- Canvas element creation and insertion
- Placeholder rendering
- Event callbacks
- Trigger map support

### Future Versions

- Define params syntax for various visualization types
- Implement actual rendering logic for:
  - Node/edge diagrams
  - Flowcharts
  - Bar charts
  - Line graphs
  - Custom visualizations
- Interactive canvas elements
- Export visualizations as images
- Animation support

## License

MIT

## Repository

https://github.com/RonItelman/trustquery-draw

## Author

TrustQuery

## Keywords

`trustquery`, `visualization`, `canvas`, `draw`
