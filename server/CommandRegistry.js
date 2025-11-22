/**
 * CommandRegistry - Central registry for all diagram commands
 * Automatically generates documentation and system prompts for LLMs
 */
export class CommandRegistry {
  constructor() {
    this.commands = new Map();
    this.nodeShapes = [];
    this.layoutTypes = [];

    // Register all commands
    this.registerDefaultCommands();
  }

  /**
   * Register default commands that exist in the system
   */
  registerDefaultCommands() {
    // Node shapes
    this.registerNodeShapes(['rectangle', 'square', 'circle', 'diamond']);

    // Layout types
    this.registerLayoutTypes(['decision', 'tree', 'grid', 'circle']);

    // Node syntax
    this.register({
      category: 'nodes',
      syntax: 'nodeId',
      description: 'Create a rectangle node with the given ID',
      examples: ['login', 'validate_user', 'process_payment'],
      notes: 'Use lowercase with underscores for IDs'
    });

    this.register({
      category: 'nodes',
      syntax: 'shape:nodeId',
      description: 'Create a node with a specific shape',
      params: {
        shape: this.nodeShapes,
      },
      examples: [
        'circle:start',
        'diamond:decision',
        'square:database'
      ],
      notes: 'Diamonds are good for decisions, circles for start/end'
    });

    // Edge syntax
    this.register({
      category: 'edges',
      syntax: 'source->target',
      description: 'Create an edge from source node to target node',
      examples: ['start->login', 'validate->dashboard'],
    });

    this.register({
      category: 'edges',
      syntax: 'source-Label->target',
      description: 'Create a labeled edge',
      examples: ['decision-Yes->success', 'check-Failed->retry'],
      notes: 'Labels appear on the edge line'
    });

    // @ Commands
    this.register({
      category: 'commands',
      syntax: '@nodeId',
      description: 'Select a node by its ID (opens style inspector)',
      examples: ['@login', '@validate_user'],
    });

    this.register({
      category: 'commands',
      syntax: '@:nodeNumber',
      description: 'Select a node by its number (opens style inspector)',
      examples: ['@:1', '@:4', '@:10'],
      notes: 'Node numbers are assigned in creation order starting from 1'
    });

    // = Commands
    this.register({
      category: 'commands',
      syntax: '=rename(oldId, newLabel)',
      description: 'Rename a node to have a different display label',
      params: {
        oldId: 'The current node ID',
        newLabel: 'The new label to display'
      },
      examples: [
        '=rename(auth_check, Authenticated?)',
        '=rename(process, Process Payment)',
      ],
      notes: 'Use this to make labels more readable without changing the ID'
    });

    this.register({
      category: 'commands',
      syntax: '=layout(type)',
      description: 'Apply an automatic layout algorithm to arrange nodes',
      params: {
        type: this.layoutTypes,
      },
      examples: [
        '=layout(decision)',
        '=layout(tree)',
        '=layout(grid)',
        '=layout(circle)'
      ],
      notes: 'Apply layouts after creating all nodes and edges'
    });
  }

  /**
   * Register available node shapes
   */
  registerNodeShapes(shapes) {
    this.nodeShapes = shapes;
  }

  /**
   * Register available layout types
   */
  registerLayoutTypes(types) {
    this.layoutTypes = types;
  }

  /**
   * Register a command
   */
  register(commandDef) {
    const key = `${commandDef.category}:${commandDef.syntax}`;
    this.commands.set(key, commandDef);
  }

  /**
   * Get all commands
   */
  getAllCommands() {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands by category
   */
  getCommandsByCategory(category) {
    return this.getAllCommands().filter(cmd => cmd.category === category);
  }

  /**
   * Generate system prompt for LLM
   */
  generateSystemPrompt() {
    const sections = [];

    // Header
    sections.push(`# Diagram Generator System Prompt

You are a diagram generator. The user will describe a diagram in natural language, and you must return ONLY a JSON array of command strings that will create the diagram.`);

    // Node syntax
    sections.push(`\n## Node Syntax\n`);
    this.getCommandsByCategory('nodes').forEach(cmd => {
      sections.push(`### ${cmd.syntax}`);
      sections.push(cmd.description);
      if (cmd.params) {
        Object.entries(cmd.params).forEach(([param, values]) => {
          if (Array.isArray(values)) {
            sections.push(`- **${param}**: ${values.join(', ')}`);
          } else {
            sections.push(`- **${param}**: ${values}`);
          }
        });
      }
      if (cmd.examples) {
        sections.push(`\n**Examples:**`);
        cmd.examples.forEach(ex => sections.push(`- \`${ex}\``));
      }
      if (cmd.notes) {
        sections.push(`\n*Note: ${cmd.notes}*`);
      }
      sections.push('');
    });

    // Edge syntax
    sections.push(`\n## Edge Syntax\n`);
    this.getCommandsByCategory('edges').forEach(cmd => {
      sections.push(`### ${cmd.syntax}`);
      sections.push(cmd.description);
      if (cmd.examples) {
        sections.push(`\n**Examples:**`);
        cmd.examples.forEach(ex => sections.push(`- \`${ex}\``));
      }
      if (cmd.notes) {
        sections.push(`\n*Note: ${cmd.notes}*`);
      }
      sections.push('');
    });

    // Commands
    sections.push(`\n## Commands\n`);
    this.getCommandsByCategory('commands').forEach(cmd => {
      sections.push(`### ${cmd.syntax}`);
      sections.push(cmd.description);
      if (cmd.params) {
        sections.push(`\n**Parameters:**`);
        Object.entries(cmd.params).forEach(([param, values]) => {
          if (Array.isArray(values)) {
            sections.push(`- **${param}**: ${values.join(', ')}`);
          } else {
            sections.push(`- **${param}**: ${values}`);
          }
        });
      }
      if (cmd.examples) {
        sections.push(`\n**Examples:**`);
        cmd.examples.forEach(ex => sections.push(`- \`${ex}\``));
      }
      if (cmd.notes) {
        sections.push(`\n*Note: ${cmd.notes}*`);
      }
      sections.push('');
    });

    // Response format
    sections.push(`\n## Response Format

**CRITICAL**: Return ONLY a JSON array of command strings. No explanations, no markdown code blocks, no additional text.

Example:
\`\`\`json
["start->login", "login->authenticate", "=layout(tree)"]
\`\`\`

## Complete Examples

### Example 1: Simple Flow
User: "Draw a login flow"
Response: ["start->login", "login->authenticate", "authenticate->dashboard"]

### Example 2: Decision Tree
User: "Create a user authentication decision"
Response: ["input->diamond:check", "check-Valid->success", "check-Invalid->retry", "retry->input", "=rename(check, Authenticated?)", "=layout(decision)"]

### Example 3: Org Chart
User: "CEO with 2 VPs"
Response: ["ceo->vp_eng", "ceo->vp_sales", "=rename(ceo, CEO)", "=rename(vp_eng, VP Engineering)", "=rename(vp_sales, VP Sales)", "=layout(tree)"]

## Best Practices

1. **Meaningful IDs**: Use descriptive IDs like \`user_login\` not \`node1\`
2. **Appropriate shapes**:
   - rectangle: Processes, actions (default)
   - diamond: Decisions, yes/no questions
   - circle: Start/end states, milestones
   - square: Data stores, entities
3. **Rename for clarity**: Use \`=rename()\` to make labels human-readable
4. **Apply layouts**: Use \`=layout()\` for better visual organization
5. **Keep it simple**: Clear is better than comprehensive

## Critical Rules

- Return ONLY the JSON array
- No markdown code blocks around the JSON
- No explanatory text before or after
- Ensure all JSON is valid and properly escaped
- Response must start with \`[\` and end with \`]\``);

    return sections.join('\n');
  }

  /**
   * Generate markdown documentation
   */
  generateMarkdownDocs() {
    const sections = [];

    sections.push('# Diagram Syntax Reference\n');

    // Nodes
    sections.push('## Nodes\n');
    this.getCommandsByCategory('nodes').forEach(cmd => {
      sections.push(`### \`${cmd.syntax}\``);
      sections.push(cmd.description);
      if (cmd.examples) {
        sections.push('\nExamples:');
        cmd.examples.forEach(ex => sections.push(`- \`${ex}\``));
      }
      sections.push('');
    });

    // Edges
    sections.push('## Edges\n');
    this.getCommandsByCategory('edges').forEach(cmd => {
      sections.push(`### \`${cmd.syntax}\``);
      sections.push(cmd.description);
      if (cmd.examples) {
        sections.push('\nExamples:');
        cmd.examples.forEach(ex => sections.push(`- \`${ex}\``));
      }
      sections.push('');
    });

    // Commands
    sections.push('## Commands\n');
    this.getCommandsByCategory('commands').forEach(cmd => {
      sections.push(`### \`${cmd.syntax}\``);
      sections.push(cmd.description);
      if (cmd.examples) {
        sections.push('\nExamples:');
        cmd.examples.forEach(ex => sections.push(`- \`${ex}\``));
      }
      sections.push('');
    });

    return sections.join('\n');
  }
}

// Create singleton instance
const registry = new CommandRegistry();

export default registry;
