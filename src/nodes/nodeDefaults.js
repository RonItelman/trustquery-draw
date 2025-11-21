/**
 * Default styles for each node type
 * Shared between node components and StyleInspector
 */
export const nodeDefaults = {
  rectangle: {
    borderRadius: '3px',
    padding: '8px 12px',
    border: '2px solid #1a192b',
    background: '#fff',
    minWidth: '60px',
    fontSize: '12px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  },

  diamond: {
    padding: '15px 20px',
    border: '2px solid #1a192b',
    background: '#fff4e6',
    minWidth: '60px',
    fontSize: '12px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60px',
    whiteSpace: 'nowrap',
  },

  circle: {
    borderRadius: '50%',
    padding: '15px',
    border: '2px solid #1a192b',
    background: '#e3f2fd',
    width: '60px',
    height: '60px',
    minWidth: '60px',
    minHeight: '60px',
    fontSize: '12px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  },

  square: {
    borderRadius: '3px',
    padding: '15px',
    border: '2px solid #1a192b',
    background: '#f3e5f5',
    width: '60px',
    height: '60px',
    minWidth: '60px',
    minHeight: '60px',
    fontSize: '12px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
  },

  star: {
    padding: '0',
    background: '#fff9c4',
    minWidth: '60px',
    fontSize: '11px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pentagon: {
    padding: '0',
    background: '#e0f2f1',
    minWidth: '60px',
    fontSize: '11px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  hexagon: {
    padding: '0',
    background: '#fce4ec',
    minWidth: '60px',
    fontSize: '11px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default nodeDefaults;
