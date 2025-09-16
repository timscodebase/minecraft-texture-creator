// src/components/TextureGrid.tsx
import React from "react";
import styles from './TextureGrid.module.css';

interface TextureGridProps {
  gridSize: number;
  usageCount: number;
  handleGridSizeChange: (size: number) => void;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseEnter: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
  handleClearGrid: () => void;
  handleExportTexture: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const CANVAS_DISPLAY_SIZE = 600;

const TextureGrid: React.FC<TextureGridProps> = ({
  gridSize,
  usageCount,
  handleGridSizeChange,
  handleMouseDown,
  handleMouseMove,
  handleMouseEnter,
  handleMouseUp,
  handleMouseLeave,
  handleClearGrid,
  handleExportTexture,
  canvasRef,
  undo,
  redo,
  canUndo,
  canRedo,
}) => (
  <div className={styles.wrapper}>
    <h2 className={styles.title}>
      Texture Grid ({gridSize}x{gridSize})
    </h2>
    <div className={styles.gridSizeButtons}>
      {[16, 32, 64].map((size) => (
        <button
          key={size}
          onClick={() => handleGridSizeChange(size)}
          className={`${styles.gridSizeButton} ${
            gridSize === size ? styles.gridSizeButtonActive : ''
          } ${
            usageCount >= 15 && (size === 16 || size === 32)
              ? styles.gridSizeButtonDisabled
              : ""
          }`}
          disabled={usageCount >= 15 && (size === 16 || size === 32)}
        >
          {size}x{size}
        </button>
      ))}
    </div>
    <canvas
      ref={canvasRef}
      width={CANVAS_DISPLAY_SIZE}
      height={CANVAS_DISPLAY_SIZE}
      className={styles.canvas}
      style={{ width: "min(100%, 600px)", height: "min(100%, 600px)" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      title='Texture Canvas'
    ></canvas>
    <div className={styles.actionButtons}>
       <button
        onClick={undo}
        disabled={!canUndo}
        className={`${styles.actionButton} ${styles.undoButton} ${!canUndo ? styles.actionButtonDisabled : ''}`}>
        Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className={`${styles.actionButton} ${styles.redoButton} ${!canRedo ? styles.actionButtonDisabled : ''}`}>
        Redo
      </button>
      <button
        onClick={handleClearGrid}
        className={`${styles.actionButton} ${styles.clearButton}`}>
        Clear Grid
      </button>
      <button
        onClick={handleExportTexture}
        className={`${styles.actionButton} ${styles.exportButton}`}>
        Export Texture (PNG)
      </button>
    </div>
  </div>
);

export default TextureGrid;