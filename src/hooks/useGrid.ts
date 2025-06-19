// src/hooks/useGrid.ts
import { useState, useCallback, useRef } from 'react';
import { generate256ColorPalette } from '../utils/palette';
import { DEFAULT_GRID_COLOR } from '../utils/constants';

export function useGrid(initialSize = 16) {
  const [gridSize, setGridSize] = useState(initialSize);
  const [gridColors, setGridColors] = useState<string[][]>(
    Array(initialSize).fill(null).map(() => Array(initialSize).fill(DEFAULT_GRID_COLOR))
  );
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [palette] = useState<string[]>(generate256ColorPalette());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Color a single cell
  const colorCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      setGridColors((prevGrid) => {
        const newGrid = prevGrid.map((row, rIdx) =>
          row.map((color, cIdx) =>
            rIdx === rowIndex && cIdx === colIndex ? selectedColor : color
          )
        );
        return newGrid;
      });
    },
    [selectedColor]
  );

  // Mouse events for drawing
  const handleMouseDown = useCallback(
    (rowIndex: number, colIndex: number) => {
      setIsDrawing(true);
      colorCell(rowIndex, colIndex);
    },
    [colorCell]
  );

  const handleMouseEnter = useCallback(
    (rowIndex: number, colIndex: number) => {
      if (isDrawing) {
        colorCell(rowIndex, colIndex);
      }
    },
    [isDrawing, colorCell]
  );

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  }, [isDrawing]);

  // Clear the grid
  const clearGrid = useCallback(() => {
    setGridColors(
      Array(gridSize)
        .fill(null)
        .map(() => Array(gridSize).fill(DEFAULT_GRID_COLOR))
    );
  }, [gridSize]);

  // Fill the grid with the selected color
  const fillGrid = useCallback(() => {
    setGridColors(
      Array(gridSize)
        .fill(null)
        .map(() => Array(gridSize).fill(selectedColor))
    );
  }, [gridSize, selectedColor]);

  // Change grid size and reset grid
  const changeGridSize = useCallback((newSize: number) => {
    setGridSize(newSize);
    setGridColors(
      Array(newSize)
        .fill(null)
        .map(() => Array(newSize).fill(DEFAULT_GRID_COLOR))
    );
  }, []);

  return {
    gridSize,
    setGridSize: changeGridSize,
    gridColors,
    setGridColors,
    selectedColor,
    setSelectedColor,
    palette,
    canvasRef,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    clearGrid,
    fillGrid,
  };
}
