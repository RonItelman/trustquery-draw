/**
 * EdgeSyntaxParser - Parses arrow syntax for edges
 * Handles: ->, <-, <->, and labeled arrows like -label->
 */
export class EdgeSyntaxParser {
  constructor() {
    // Arrow pattern matches: <-label->, <->, -label->, ->, <-
    this.arrowPattern = /<-([^<>]+)->|<->|-([^-<>]+)->|->|<-/g;
  }

  /**
   * Find all arrows in a line
   * @param {string} line - Line to parse
   * @returns {Array} Array of arrow objects with {index, length, direction, edgeLabel, raw}
   */
  findArrows(line) {
    const arrows = [];
    let match;

    // Reset regex lastIndex
    this.arrowPattern.lastIndex = 0;

    while ((match = this.arrowPattern.exec(line)) !== null) {
      const arrowType = match[0];
      let edgeLabel = null;
      let direction = 'forward';

      if (match[1]) {
        // Bidirectional with label: <-label->
        edgeLabel = match[1].trim();
        direction = 'bidirectional';
      } else if (match[2]) {
        // Forward with label: -label->
        edgeLabel = match[2].trim();
        direction = 'forward';
      } else if (arrowType === '<->') {
        direction = 'bidirectional';
      } else if (arrowType === '<-') {
        direction = 'backward';
      }

      arrows.push({
        index: match.index,
        length: arrowType.length,
        direction,
        edgeLabel,
        raw: arrowType
      });
    }

    return arrows;
  }

  /**
   * Extract node labels between arrows
   * @param {string} line - Line to parse
   * @param {Array} arrows - Array of arrow objects
   * @returns {Array} Array of node labels
   */
  extractNodeLabels(line, arrows) {
    if (arrows.length === 0) {
      return [];
    }

    const nodes = [];
    let lastIndex = 0;

    arrows.forEach((arrow, i) => {
      // Get text before this arrow
      const nodeLabel = line.substring(lastIndex, arrow.index).trim();
      if (nodeLabel) {
        nodes.push(nodeLabel);
      }

      // If this is the last arrow, get text after it
      if (i === arrows.length - 1) {
        const finalLabel = line.substring(arrow.index + arrow.length).trim();
        if (finalLabel) {
          nodes.push(finalLabel);
        }
      }

      lastIndex = arrow.index + arrow.length;
    });

    return nodes;
  }

  /**
   * Parse a line with arrow syntax
   * @param {string} line - Line to parse
   * @returns {Object} {nodeLabels: Array, arrows: Array}
   */
  parseLine(line) {
    const arrows = this.findArrows(line);
    const nodeLabels = this.extractNodeLabels(line, arrows);

    return { nodeLabels, arrows };
  }
}
