// src/components/Toolbar.tsx
import React from 'react';

export type Tool = 'pixel' | 'bucket' | 'line' | 'gradient';

const TOOLS: Tool[] = ['pixel', 'bucket', 'line', 'gradient'];

interface ToolbarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, setActiveTool }) => {
  return (
    <div className='w-full lg:w-1/3 p-4 bg-[#013503] rounded-xl shadow-lg flex flex-col items-center'>
      <h2 className='text-2xl font-semibold mb-4 text-orange-300'>Tools</h2>
      <div className='grid grid-cols-2 gap-2 w-full'>
        {TOOLS.map((tool) => (
          <button
            key={tool}
            onClick={() => setActiveTool(tool)}
            className={`px-4 py-2 rounded-xl font-bold capitalize transition-all duration-200 ${
              activeTool === tool
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            }`}
          >
            {tool}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
