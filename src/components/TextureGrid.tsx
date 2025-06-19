// src/components/TextureGrid.tsx
import React from 'react';

interface TextureGridProps {
  gridColors: string[][];
  gridSize: number;
  usageCount: number;
  handleGridSizeChange: (size: number) => void;
  handleMouseDown: (row: number, col: number) => void;
  handleMouseEnter: (row: number, col: number) => void;
  handleMouseUp: () => void;
  handleClearGrid: () => void;
  handleExportTexture: () => void;
}

const TextureGrid: React.FC<TextureGridProps> = ({
  gridColors,
  gridSize,
  usageCount,
  handleGridSizeChange,
  handleMouseDown,
  handleMouseEnter,
  handleMouseUp,
  handleClearGrid,
  handleExportTexture,
}) => (
  <div className="w-full lg:w-2/3 p-4 bg-gray-800 rounded-xl shadow-lg flex flex-col items-center">
    <h2 className="text-2xl font-semibold mb-4 text-orange-300">Texture Grid ({gridSize}x{gridSize})</h2>
    <div className="mb-4 flex flex-wrap justify-center gap-2">
      {[16, 32, 64, 128].map((size) => (
        <button
          key={size}
          onClick={() => handleGridSizeChange(size)}
          className={`px-4 py-2 rounded-xl font-bold transition-all duration-200
            ${gridSize === size ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'}
            ${(usageCount >= 15 && (size === 16 || size === 32)) ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          disabled={ (usageCount >= 15 && (size === 16 || size === 32)) }
        >
          {size}x{size}
        </button>
      ))}
    </div>
    <div
      className="grid gap-px bg-gray-600 rounded-lg overflow-hidden border-2 border-gray-700 mx-auto"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        width: 'min(100%, 400px)',
        height: 'min(100%, 400px)',
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {gridColors.map((row, rowIndex) =>
        row.map((color, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className="w-full h-auto aspect-square cursor-pointer border border-gray-700 hover:scale-[1.01] transition-transform duration-75"
            style={{ backgroundColor: color }}
            onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
            onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
            title={`Row: ${rowIndex}, Col: ${colIndex}, Color: ${color}`}
          ></div>
        ))
      )}
    </div>
    <div className="mt-6 flex flex-wrap justify-center gap-4">
      <button
        onClick={handleClearGrid}
        className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md hover:bg-red-700 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
      >
        Clear Grid
      </button>
      <button
        onClick={handleExportTexture}
        className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
      >
        Export Texture (PNG)
      </button>
    </div>
  </div>
);

export default TextureGrid;
