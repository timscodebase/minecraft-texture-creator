// src/components/ColorPalette.tsx
import React from "react";
import styles from './ColorPalette.module.css';

interface ColorPaletteProps {
  palette: string[];
  selectedColor: string;
  secondaryColor: string;
  setSelectedColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  palette,
  selectedColor,
  secondaryColor,
  setSelectedColor,
  setSecondaryColor,
}) => (
  <div className={styles.wrapper}>
    <h2 className={styles.title}>
      Color Palette
    </h2>
    <div className={styles.palette}>
      {palette.map((color, index) => (
        <div
          key={index}
          className={`${styles.colorBox} ${selectedColor === color ? styles.colorBoxSelected : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => setSelectedColor(color)}
          onContextMenu={(e) => {
            e.preventDefault();
            setSecondaryColor(color);
          }}
          title={`Left-click: ${color}
Right-click: set secondary`}
        ></div>
      ))}
    </div>
    <div className={styles.controls}>
      <div className={styles.colorInfo}>
        <div className={styles.colorDisplay}>
          <span className={styles.colorLabel}>Primary:</span>
          <div
            className={styles.colorPreview}
            style={{ backgroundColor: selectedColor }}
          ></div>
          <span className={styles.colorValue}>
            {selectedColor.toUpperCase()}
          </span>
        </div>
        <div className={styles.colorDisplay}>
          <span className={styles.colorLabel}>Secondary:</span>
          <div
            className={styles.colorPreview}
            style={{ backgroundColor: secondaryColor }}
          ></div>
          <span className={styles.colorValue}>
            {secondaryColor.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  </div>
);

export default ColorPalette;
