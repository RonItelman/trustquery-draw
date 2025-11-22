/**
 * Default styles for each node type
 * Shared between node components and StyleInspector
 */
export const nodeDefaults = {
  rectangle: {
    borderRadius: '3px',
    padding: '8px 12px',
    border: '1px solid #1a192b',
    background: '#fff',
    minWidth: '60px',
    minHeight: '60px',
    fontSize: '11px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  },

  circle: {
    borderRadius: '50%',
    padding: '15px',
    border: '1px solid #1a192b',
    background: '#e3f2fd',
    width: '60px',
    height: '60px',
    minWidth: '60px',
    minHeight: '60px',
    fontSize: '11px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  },

  square: {
    borderRadius: '3px',
    padding: '15px',
    border: '1px solid #1a192b',
    background: '#f3e5f5',
    width: '60px',
    height: '60px',
    minWidth: '60px',
    minHeight: '60px',
    fontSize: '11px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  },

  diamond: {
    padding: '15px 20px',
    border: '1px solid #1a192b',
    background: '#fff4e6',
    minWidth: '100px',
    fontSize: '11px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100px',
    whiteSpace: 'nowrap',
  },
};

export default nodeDefaults;
