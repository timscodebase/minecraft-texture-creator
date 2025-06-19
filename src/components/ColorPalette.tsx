// src/components/ColorPalette.tsx
import React from 'react';

interface ColorPaletteProps {
  palette: string[];
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  handleFillGrid: () => void;
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  palette,
  selectedColor,
  setSelectedColor,
  handleFillGrid,
}) => (
  <div className="w-full lg:w-1/3 p-4 bg-gray-800 rounded-xl shadow-lg flex flex-col">
    <h2 className="text-2xl font-semibold mb-4 text-orange-300">Color Palette</h2>
    <div className="flex flex-wrap gap-1 mb-4 max-h-96 overflow-y-auto pr-2">
      {palette.map((color, index) => (
        <div
          key={index}
          className={`w-6 h-6 rounded-sm cursor-pointer border-2 transition-all duration-100 ${
            selectedColor === color ? 'border-blue-400 scale-110' : 'border-transparent'
          }`}
          style={{ backgroundColor: color }}
          onClick={() => setSelectedColor(color)}
          title={color}
        ></div>
      ))}
    </div>
    <div className="flex items-center justify-between mt-auto p-2 bg-gray-700 rounded-lg">
      <div className="flex items-center">
        <span className="mr-2 text-gray-300">Selected:</span>
        <div
          className="w-8 h-8 rounded-full border-2 border-gray-500 shadow-md"
          style={{ backgroundColor: selectedColor }}
        ></div>
        <span className="ml-2 font-mono text-lg text-white">{selectedColor.toUpperCase()}</span>
      </div>
      <button
        onClick={handleFillGrid}
        className="px-4 py-2 bg-yellow-600 text-white font-bold rounded-xl shadow-md hover:bg-yellow-700 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75 text-sm"
        title="Fill the entire grid with the selected color"
      >
        Fill Grid
      </button>
    </div>
  </div>
);

export default ColorPalette;
