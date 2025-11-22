/**
 * Layout Manager - Dispatches to individual layout handlers
 */

import DecisionLayout from './layouts/DecisionLayout.js';
import TreeLayout from './layouts/TreeLayout.js';
import ListLayout from './layouts/ListLayout.js';
import GridLayout from './layouts/GridLayout.js';
import CircleLayout from './layouts/CircleLayout.js';

/**
 * Decision Layout
 * Delegates to DecisionLayout handler
 */
export const applyDecisionLayout = (nodes, edges) => {
  return DecisionLayout.apply(nodes, edges);
};

/**
 * Tree Layout (hierarchical top-down)
 * Delegates to TreeLayout handler
 */
export const applyTreeLayout = (nodes, edges) => {
  return TreeLayout.apply(nodes, edges);
};

/**
 * List Layout (vertical stacking with right-indentation)
 * Delegates to ListLayout handler
 */
export const applyListLayout = (nodes, edges) => {
  return ListLayout.apply(nodes, edges);
};

/**
 * Grid Layout
 * Delegates to GridLayout handler
 */
export const applyGridLayout = (nodes, edges) => {
  return GridLayout.apply(nodes, edges);
};

/**
 * Circle Layout
 * Delegates to CircleLayout handler
 */
export const applyCircleLayout = (nodes, edges) => {
  return CircleLayout.apply(nodes, edges);
};
