/**
 * Default styles for each node type
 * Shared between node components and StyleInspector
 */
export const nodeDefaults = {
  rectangle: {
    borderRadius: '3px',
    padding: '10px',
    border: '2px solid #1a192b',
    background: '#fff',
    minWidth: '100px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  diamond: {
    padding: '20px 30px',
    border: '2px solid #1a192b',
    background: '#fff4e6',
    minWidth: '100px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100px',
    height: '100px',
  },

  circle: {
    borderRadius: '50%',
    padding: '0',
    width: '100px',
    height: '100px',
    border: '2px solid #1a192b',
    background: '#e3f2fd',
    minWidth: '100px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default nodeDefaults;
