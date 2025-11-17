# TrustQuery Draw Syntax Reference

The new `=draw()` syntax uses GSAP/CSS-style JavaScript objects for intuitive and powerful canvas rendering.

## Basic Syntax

```javascript
=draw({
  shapeType: {
    property: value,
    property: value
    // ...
  }
})
```

## Supported Shapes

### Rectangle / Rect

```javascript
=draw({
  rectangle: {
    text: "my node",
    x: 300,
    y: 400,
    width: 100,
    height: 60,
    backgroundColor: "#ffcc44",
    borderColor: "red",
    borderWidth: 2,
    borderRadius: 8,
    opacity: 1,
    textColor: "#000",
    fontSize: 14,
    fontFamily: "sans-serif"
  }
})
```

### Circle

```javascript
=draw({
  circle: {
    text: "Node A",
    x: 200,
    y: 150,
    radius: 50,
    backgroundColor: "lightblue",
    borderColor: "blue",
    borderWidth: 2,
    opacity: 1,
    textColor: "#000",
    fontSize: 16
  }
})
```

### Ellipse

```javascript
=draw({
  ellipse: {
    x: 250,
    y: 200,
    radiusX: 75,
    radiusY: 50,
    rotation: 0,
    backgroundColor: "yellow",
    borderColor: "orange",
    borderWidth: 2
  }
})
```

### Line

```javascript
=draw({
  line: {
    x1: 0,
    y1: 0,
    x2: 100,
    y2: 100,
    strokeColor: "#000",
    strokeWidth: 2,
    lineCap: "round",
    lineDash: [5, 5],
    opacity: 1
  }
})
```

### Text

```javascript
=draw({
  text: {
    text: "Hello World",
    x: 100,
    y: 50,
    color: "#000",
    fontSize: 24,
    fontFamily: "Arial",
    fontWeight: "bold",
    textAlign: "center",
    textBaseline: "middle",
    maxWidth: 200
  }
})
```

### Polygon

```javascript
=draw({
  polygon: {
    points: [
      {x: 100, y: 50},
      {x: 150, y: 100},
      {x: 100, y: 150},
      {x: 50, y: 100}
    ],
    backgroundColor: "purple",
    borderColor: "white",
    borderWidth: 2,
    closePath: true
  }
})
```

## Multiple Shapes

You can draw multiple shapes in a single command:

```javascript
=draw({
  rectangle: {
    x: 50,
    y: 50,
    width: 100,
    height: 60,
    backgroundColor: "lightgreen",
    borderRadius: 4
  },
  circle: {
    x: 250,
    y: 80,
    radius: 30,
    backgroundColor: "coral"
  },
  line: {
    x1: 150,
    y1: 80,
    x2: 220,
    y2: 80,
    strokeColor: "gray",
    strokeWidth: 2
  }
})
```

## Color Formats

All color properties support multiple formats:

- **Named colors**: `red`, `blue`, `green`, `yellow`, `orange`, `purple`, `pink`, etc.
- **Hex colors**: `#FF0000`, `#00FF00`, `#0000FF`
- **RGB/RGBA**: `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`
- **HSL/HSLA**: `hsl(0, 100%, 50%)`, `hsla(0, 100%, 50%, 0.5)`

## Common Properties

### Position & Size
- `x`, `y` - Position coordinates
- `width`, `height` - Dimensions (rectangles)
- `radius` - Radius (circles)
- `radiusX`, `radiusY` - Radii (ellipses)

### Styling
- `backgroundColor` / `fillColor` - Fill color
- `borderColor` / `strokeColor` - Stroke/outline color
- `borderWidth` / `strokeWidth` - Stroke thickness
- `borderRadius` - Corner radius (rectangles)
- `opacity` - Transparency (0-1)

### Text
- `text` - Text content
- `textColor` / `color` - Text color
- `fontSize` - Font size in pixels
- `fontFamily` - Font family name
- `fontWeight` - Font weight (normal, bold, etc.)
- `textAlign` - Alignment (left, center, right)
- `textBaseline` - Baseline (top, middle, bottom)

## Examples

### Simple Node
```javascript
=draw({rectangle: {text: "Start", x: 100, y: 100, width: 80, height: 40, backgroundColor: "lightblue", borderRadius: 4}})
```

### Diagram with Multiple Elements
```javascript
=draw({
  rectangle: {text: "Process A", x: 50, y: 50, width: 120, height: 60, backgroundColor: "#e3f2fd", borderColor: "#1976d2", borderWidth: 2, borderRadius: 8},
  rectangle: {text: "Process B", x: 250, y: 50, width: 120, height: 60, backgroundColor: "#fff3e0", borderColor: "#f57c00", borderWidth: 2, borderRadius: 8},
  line: {x1: 170, y1: 80, x2: 250, y2: 80, strokeColor: "#666", strokeWidth: 2}
})
```

### Styled Circle Node
```javascript
=draw({circle: {text: "A", x: 200, y: 150, radius: 40, backgroundColor: "#ffcc44", borderColor: "red", borderWidth: 3, textColor: "white", fontSize: 20}})
```
