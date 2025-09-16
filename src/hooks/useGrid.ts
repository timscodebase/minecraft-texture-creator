// src/hooks/useGrid.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { generate256ColorPalette } from '../utils/palette';
import { DEFAULT_GRID_COLOR } from '../utils/constants';
import { Tool } from '../components/Toolbar';

const hexToRgb = (hex: string): [number, number, number] | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// Bresenham's line algorithm
function getLinePixels(x0: number, y0: number, x1: number, y1: number): [number, number][] {
  const pixels: [number, number][] = [];
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    pixels.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
  return pixels;
}

function applyGradient(
  grid: string[][],
  start: [number, number],
  end: [number, number],
  startColor: string,
  endColor: string
): string[][] {
  const newGrid = grid.map(r => [...r]);
  const startRgb = hexToRgb(startColor);
  const endRgb = hexToRgb(endColor);

  if (!startRgb || !endRgb) return newGrid; // Invalid color format

  const [x0, y0] = start;
  const [x1, y1] = end;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) return newGrid; // Start and end points are the same

  for (let r = 0; r < newGrid.length; r++) {
    for (let c = 0; c < newGrid[r].length; c++) {
      // Project pixel onto the gradient line to find interpolation factor t
      const t = ((c - x0) * dx + (r - y0) * dy) / lenSq;
      const clampedT = Math.max(0, Math.min(1, t)); // Clamp t between 0 and 1

      const R = startRgb[0] + clampedT * (endRgb[0] - startRgb[0]);
      const G = startRgb[1] + clampedT * (endRgb[1] - startRgb[1]);
      const B = startRgb[2] + clampedT * (endRgb[2] - startRgb[2]);

      newGrid[r][c] = rgbToHex(R, G, B);
    }
  }

  return newGrid;
}

// Helper to draw the entire grid - for full updates
function drawGrid(
  ctx: CanvasRenderingContext2D,
  grid: string[][],
  gridSize: number
) {
  const canvas = ctx.canvas;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const pixelSize = canvas.width / gridSize;

  // Draw the pixel colors
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      ctx.fillStyle = grid[r][c];
      ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
    }
  }

  // Draw the grid lines
  ctx.strokeStyle = '#4a5568'; // gray-700
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= gridSize; i++) {
    // Vertical lines
    ctx.moveTo(i * pixelSize, 0);
    ctx.lineTo(i * pixelSize, canvas.height);
    // Horizontal lines
    ctx.moveTo(0, i * pixelSize);
    ctx.lineTo(canvas.width, i * pixelSize);
  }
  ctx.stroke();
}

export function useGrid(initialSize = 16) {
  const [gridSize, setGridSize] = useState(initialSize);
  const [gridColors, setGridColors] = useState<string[][]>(() =>
    Array(initialSize)
      .fill(null)
      .map(() => Array(initialSize).fill(DEFAULT_GRID_COLOR))
  );
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');
  const [activeTool, setActiveTool] = useState<Tool>('pixel');
  const [isDrawing, setIsDrawing] = useState(false);

  // Tool-specific state
  const [lineStart, setLineStart] = useState<[number, number] | null>(null);
  const [gradientStart, setGradientStart] = useState<[number, number] | null>(null);
  const [endCoords, setEndCoords] = useState<[number, number] | null>(null);
  const [previewGridColors, setPreviewGridColors] = useState<string[][] | null>(null);

  const [palette] = useState<string[]>(generate256ColorPalette());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);

  // Undo/Redo state
  const history = useRef<string[][][]>([]);
  const redoStack = useRef<string[][][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const MAX_HISTORY_SIZE = 50;

  const pushToHistory = useCallback((grid: string[][]) => {
    if (history.current.length >= MAX_HISTORY_SIZE) {
      history.current.shift(); // Keep history size manageable
    }
    history.current.push(grid);
    redoStack.current = []; // Clear redo stack on new action
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  // Effect to draw the grid whenever it's replaced entirely
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      // Draw the preview grid if it exists, otherwise draw the main grid
      drawGrid(ctx, previewGridColors || gridColors, gridSize);
    }
  }, [gridColors, gridSize, previewGridColors]);

  const undo = useCallback(() => {
    if (history.current.length === 0) return;

    const lastState = history.current.pop();
    if (lastState) {
      redoStack.current.push(gridColors);
      setGridColors(lastState);
      setCanRedo(true);
    }
    if (history.current.length === 0) {
      setCanUndo(false);
    }
  }, [gridColors]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;

    const nextState = redoStack.current.pop();
    if (nextState) {
      history.current.push(gridColors);
      setGridColors(nextState);
      setCanUndo(true);
    }
    if (redoStack.current.length === 0) {
      setCanRedo(false);
    }
  }, [gridColors]);

  // Effect for Keyboard Shortcuts (Undo/Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd on Mac or Ctrl on Windows/Linux
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z') {
          e.preventDefault(); // Prevent native browser undo/redo
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  const getCoordsFromEvent = (
    e: React.MouseEvent<HTMLCanvasElement>
  ): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const pixelSize = canvas.width / gridSize;
    const col = Math.floor(x / pixelSize);
    const row = Math.floor(y / pixelSize);

    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
      return [row, col];
    }
    return null;
  };

  const updatePixelOnCanvas = (
    row: number,
    col: number,
    color: string
  ) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const pixelSize = canvas.width / gridSize;
    ctx.fillStyle = color;
    // Draw a full-sized pixel. The grid line will be temporarily covered during a drag.
    ctx.fillRect(col * pixelSize, row * pixelSize, pixelSize, pixelSize);
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getCoordsFromEvent(e);
      if (!coords) return;

      switch (activeTool) {
        case 'pixel': {
          pushToHistory(gridColors);
          setIsDrawing(true);
          const [row, col] = coords;
          setGridColors((prev) => {
            const newGrid = prev.map((r) => [...r]);
            if (newGrid[row][col] !== selectedColor) {
              newGrid[row][col] = selectedColor;
              updatePixelOnCanvas(row, col, selectedColor);
            }
            return newGrid;
          });
          break;
        }
        case 'bucket': {
          pushToHistory(gridColors);
          const [startRow, startCol] = coords;
          const targetColor = gridColors[startRow][startCol];

          if (targetColor === selectedColor) break; // No need to fill

          const newGrid = gridColors.map((r) => [...r]);
          const queue: [number, number][] = [[startRow, startCol]];
          const visited = new Set<string>();
          visited.add(`${startRow},${startCol}`);

          while (queue.length > 0) {
            const [row, col] = queue.shift()!;
            newGrid[row][col] = selectedColor;

            [
              [row - 1, col], // Up
              [row + 1, col], // Down
              [row, col - 1], // Left
              [row, col + 1], // Right
            ].forEach(([nextRow, nextCol]) => {
              const key = `${nextRow},${nextCol}`;
              if (
                nextRow >= 0 &&
                nextRow < gridSize &&
                nextCol >= 0 &&
                nextCol < gridSize &&
                newGrid[nextRow][nextCol] === targetColor &&
                !visited.has(key)
              ) {
                visited.add(key);
                queue.push([nextRow, nextCol]);
              }
            });
          }
          setGridColors(newGrid);
          break;
        }
        case 'line': {
          setIsDrawing(true);
          setLineStart(coords);
          break;
        }
        case 'gradient': {
          setIsDrawing(true);
          setGradientStart(coords);
          break;
        }
      }
    },
    [selectedColor, gridSize, gridColors, pushToHistory, activeTool]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;

      if (activeTool === 'pixel') {
        const coords = getCoordsFromEvent(e);
        if (!coords) return;

        const [row, col] = coords;
        setGridColors((prev) => {
          if (prev[row][col] === selectedColor) return prev;

          const newGrid = prev.map((r) => [...r]);
          newGrid[row][col] = selectedColor;
          updatePixelOnCanvas(row, col, selectedColor);
          return newGrid;
        });
      } else if (activeTool === 'line' || activeTool === 'gradient') {
        const coords = getCoordsFromEvent(e);
        if (coords && lineStart && activeTool === 'line') {
          setEndCoords(coords);
          const [startRow, startCol] = lineStart;
          const [endRow, endCol] = coords;
          const linePixels = getLinePixels(startCol, startRow, endCol, endRow);
          const tempGrid = gridColors.map(r => [...r]);
          linePixels.forEach(([c, r]) => {
            if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
              tempGrid[r][c] = selectedColor;
            }
          });
          setPreviewGridColors(tempGrid);
        } else if (coords && gradientStart && activeTool === 'gradient') {
          setEndCoords(coords);
          const [startRow, startCol] = gradientStart;
          const [endRow, endCol] = coords;
          const tempGrid = applyGradient(gridColors, [startCol, startRow], [endCol, endRow], selectedColor, secondaryColor);
          setPreviewGridColors(tempGrid);
        }
      }
    },
    [isDrawing, selectedColor, activeTool]
  );

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      if (activeTool === 'line' && lineStart && endCoords) {
        pushToHistory(gridColors);
        const [startRow, startCol] = lineStart;
        const [endRow, endCol] = endCoords;
        const linePixels = getLinePixels(startCol, startRow, endCol, endRow);
        const newGrid = gridColors.map(r => [...r]);
        linePixels.forEach(([c, r]) => {
          if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
            newGrid[r][c] = selectedColor;
          }
        });
        setGridColors(newGrid);
        setPreviewGridColors(null); // Clear preview after drawing
      } else if (activeTool === 'gradient' && gradientStart && endCoords) {
        pushToHistory(gridColors);
        const [startRow, startCol] = gradientStart;
        const [endRow, endCol] = endCoords;
        const newGrid = applyGradient(gridColors, [startCol, startRow], [endCol, endRow], selectedColor, secondaryColor);
        setGridColors(newGrid);
        setPreviewGridColors(null); // Clear preview after drawing
      }
      setLineStart(null);
      setGradientStart(null);
      setEndCoords(null);
    }
  }, [isDrawing, activeTool, gridColors, pushToHistory, lineStart, gradientStart, endCoords, selectedColor, secondaryColor, gridSize]);

  const handleMouseLeave = useCallback(() => {
    setIsDrawing(false);
    setPreviewGridColors(null); // Clear preview if mouse leaves canvas during drawing
  }, []);

  const clearGrid = useCallback(() => {
    pushToHistory(gridColors);
    setGridColors(
      Array(gridSize)
        .fill(null)
        .map(() => Array(gridSize).fill(DEFAULT_GRID_COLOR))
    );
  }, [gridSize, gridColors, pushToHistory]);


  const changeGridSize = useCallback((newSize: number) => {
    history.current = [];
    redoStack.current = [];
    setCanUndo(false);
    setCanRedo(false);

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
    secondaryColor,
    setSecondaryColor,
    activeTool,
    setActiveTool,
    palette,
    canvasRef,
    exportCanvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    clearGrid,
    undo,
    redo,
    canUndo,
    canRedo,
    previewGridColors,
  };
}
