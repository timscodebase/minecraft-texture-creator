// src/components/Toolbar.tsx
import React from 'react';
import styles from './Toolbar.module.css';

export type Tool = 'pixel' | 'bucket' | 'line' | 'gradient';

const TOOLS: Tool[] = ['pixel', 'bucket', 'line', 'gradient'];

interface ToolbarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool }) => {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Tools</h2>
      <div className={styles.toolGrid}>
        {TOOLS.map((tool) => (
          <button
            key={tool}
            onClick={() => setActiveTool(tool)}
            className={`${styles.toolButton} ${
              activeTool === tool ? styles.toolButtonActive : ''
            }`}>
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
