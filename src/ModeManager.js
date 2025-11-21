/**
 * ModeManager - Manages toggle states and content persistence
 *
 * Responsibilities:
 * - Toggle state management (only one active at a time)
 * - Content saving and restoration per mode
 * - Mode switching logic
 */
export default class ModeManager {
  constructor(textarea, options = {}) {
    this.textarea = textarea;
    this.currentMode = 'off';
    this.savedContent = {};
    this.toggles = new Map();
    this.onModeChange = options.onModeChange || (() => {});
  }

  /**
   * Register a toggle with its mode name
   * @param {HTMLElement} toggleElement - The checkbox input element
   * @param {string} modeName - The mode identifier (e.g., 'arrow', 'shapes')
   */
  registerToggle(toggleElement, modeName) {
    this.savedContent[modeName] = '';
    this.toggles.set(modeName, toggleElement);

    toggleElement.addEventListener('change', () => {
      if (toggleElement.checked) {
        this.activateMode(modeName);
      } else {
        this.deactivateMode(modeName);
      }
    });

    // If toggle is already checked, activate it
    if (toggleElement.checked) {
      this.activateMode(modeName);
    }
  }

  /**
   * Activate a mode
   * @param {string} modeName - The mode to activate
   */
  activateMode(modeName) {
    console.log(`[ModeManager] Activating mode: ${modeName}`);

    // Turn off all other toggles and save their content
    this.toggles.forEach((toggle, mode) => {
      if (mode !== modeName && toggle.checked) {
        this.savedContent[mode] = this.textarea.value;
        toggle.checked = false;
        console.log(`[ModeManager] Saved content for ${mode}:`, this.savedContent[mode]);
      }
    });

    // Restore saved content for this mode
    this.textarea.value = this.savedContent[modeName] || '';
    this.currentMode = modeName;
    console.log(`[ModeManager] Restored content for ${modeName}:`, this.savedContent[modeName]);

    // Notify mode change
    this.onModeChange(modeName);

    // Trigger parsing if there's content
    if (this.savedContent[modeName]) {
      this.textarea.dispatchEvent(new Event('input'));
    }
  }

  /**
   * Deactivate a mode
   * @param {string} modeName - The mode to deactivate
   */
  deactivateMode(modeName) {
    console.log(`[ModeManager] Deactivating mode: ${modeName}`);

    // Save current content
    this.savedContent[modeName] = this.textarea.value;
    console.log(`[ModeManager] Saved content for ${modeName}:`, this.savedContent[modeName]);

    // Clear input
    this.textarea.value = '';
    this.currentMode = 'off';

    // Notify mode change
    this.onModeChange('off');
  }

  /**
   * Get the current active mode
   * @returns {string} Current mode name or 'off'
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * Get saved content for a specific mode
   * @param {string} modeName - The mode name
   * @returns {string} Saved content
   */
  getSavedContent(modeName) {
    return this.savedContent[modeName] || '';
  }
}
