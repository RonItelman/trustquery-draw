/**
 * UIControls - Manages the UI control panel with global buttons,
 * pattern commands, and shape buttons
 */
export default class UIControls {
  constructor(draw, textarea) {
    this.draw = draw;
    this.textarea = textarea;
    this.buttons = {};

    this.init();
  }

  init() {
    // Cache button references
    this.buttons = {
      fitView: document.getElementById('fit-view-btn'),
      authExample: document.getElementById('auth-example-btn'),
      decisionExample: document.getElementById('decision-example-btn'),
      addRectangle: document.getElementById('add-rectangle-btn'),
      addSquare: document.getElementById('add-square-btn'),
      addCircle: document.getElementById('add-circle-btn'),
      addDiamond: document.getElementById('add-diamond-btn'),
    };

    // Cache model selector
    this.modelSelector = document.getElementById('model-selector');
    this.selectedModel = this.modelSelector?.value || 'claude-3-5-sonnet-20241022';

    // Setup event listeners
    this.setupGlobalButtons();
    this.setupPatternCommands();
    this.setupShapeButtons();
    this.setupModelSelector();
  }

  /**
   * Setup global button handlers (fit view, etc.)
   */
  setupGlobalButtons() {
    if (this.buttons.fitView) {
      this.buttons.fitView.addEventListener('click', () => {
        this.handleFitView();
      });
    }
  }

  /**
   * Setup pattern command handlers (Auth, Decision, etc.)
   */
  setupPatternCommands() {
    if (this.buttons.authExample) {
      this.buttons.authExample.addEventListener('click', () => {
        this.insertAuthPattern();
      });
    }

    if (this.buttons.decisionExample) {
      this.buttons.decisionExample.addEventListener('click', () => {
        this.insertDecisionPattern();
      });
    }
  }

  /**
   * Setup shape button handlers (rectangle, square, circle, diamond)
   */
  setupShapeButtons() {
    if (this.buttons.addRectangle) {
      this.buttons.addRectangle.addEventListener('click', () => {
        this.addShape('rectangle');
      });
    }

    if (this.buttons.addSquare) {
      this.buttons.addSquare.addEventListener('click', () => {
        this.addShape('square');
      });
    }

    if (this.buttons.addCircle) {
      this.buttons.addCircle.addEventListener('click', () => {
        this.addShape('circle');
      });
    }

    if (this.buttons.addDiamond) {
      this.buttons.addDiamond.addEventListener('click', () => {
        this.addShape('diamond');
      });
    }
  }

  /**
   * Setup model selector handler
   */
  setupModelSelector() {
    if (this.modelSelector) {
      this.modelSelector.addEventListener('change', (e) => {
        this.selectedModel = e.target.value;
        console.log('[UIControls] Model changed to:', this.selectedModel);
      });
    }
  }

  /**
   * Get currently selected model
   */
  getSelectedModel() {
    return this.selectedModel;
  }

  /**
   * Handle fit view button click
   */
  handleFitView() {
    if (this.draw && this.draw.fitView) {
      this.draw.fitView();
    } else {
      console.warn('[UIControls] Fit view not available');
    }
  }

  /**
   * Insert auth pattern diagram
   */
  insertAuthPattern() {
    const authDiagram = `start->login
login->enter_credentials
enter_credentials->validate
validate->authenticated?
authenticated?->success
authenticated?->retry
retry->login
success->dashboard
dashboard->logout
logout->start`;

    this.textarea.value = authDiagram;
    this.textarea.focus();
  }

  /**
   * Insert decision pattern diagram
   */
  insertDecisionPattern() {
    const decisionDiagram = `Input->diamond
diamond-Yes->True
diamond-No->False
=rename(diamond, Decision?)
=layout(decision)`;

    this.textarea.value = decisionDiagram;
    this.textarea.focus();
  }

  /**
   * Add a shape to the diagram directly (without modifying textarea)
   * @param {string} shapeType - The type of shape (rectangle, square, circle, diamond)
   */
  addShape(shapeType) {
    if (this.draw && this.draw.addNode) {
      this.draw.addNode(shapeType);
    } else {
      console.warn('[UIControls] addNode method not available on draw instance');
    }
  }

  /**
   * Cleanup - remove event listeners
   */
  destroy() {
    // Event listeners are automatically cleaned up when buttons are removed
    // This method is here for future cleanup needs
    this.buttons = {};
  }
}
