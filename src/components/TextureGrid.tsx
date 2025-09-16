// src/components/TextureGrid.tsx
import React from "react";

interface TextureGridProps {
  gridSize: number;
  usageCount: number;
  handleGridSizeChange: (size: number) => void;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
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
  <div className='w-full lg:w-2/3 p-4 bg-[#013503] rounded-xl shadow-lg flex flex-col items-center'>
    <h2 className='text-2xl font-semibold mb-4 text-orange-300'>
      Texture Grid ({gridSize}x{gridSize})
    </h2>
    <div className='mb-4 flex flex-wrap justify-center gap-2'>
      {[16, 32, 64].map((size) => (
        <button
          key={size}
          onClick={() => handleGridSizeChange(size)}
          className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
            gridSize === size
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-200 hover:bg-gray-600"
          } ${
            usageCount >= 15 && (size === 16 || size === 32)
              ? "opacity-50 cursor-not-allowed"
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
      className='rounded-lg overflow-hidden border-2 border-gray-700 cursor-pointer'
      style={{ width: "min(100%, 600px)", height: "min(100%, 600px)" }}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      title='Texture Canvas'
    ></canvas>
    <div className='mt-6 flex flex-wrap justify-center gap-4'>
       <button
        onClick={undo}
        disabled={!canUndo}
        className='px-6 py-3 bg-gray-500 text-white font-bold rounded-xl shadow-md hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
      >
        Undo
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className='px-6 py-3 bg-gray-500 text-white font-bold rounded-xl shadow-md hover:bg-gray-600 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
      >
        Redo
      </button>
      <button
        onClick={handleClearGrid}
        className='px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md hover:bg-red-700 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75'
      >
        Clear Grid
      </button>
      <button
        onClick={handleExportTexture}
        className='px-6 py-3 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75'
      >
        Export Texture (PNG)
      </button>
    </div>
  </div>
);

export default TextureGrid;