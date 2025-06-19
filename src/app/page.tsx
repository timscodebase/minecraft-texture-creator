// src/app/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { generate256ColorPalette } from '../utils/palette';
import { DEFAULT_GRID_COLOR } from '../utils/constants';

import ColorPalette from '../components/ColorPalette';
import TextureGrid from '../components/TextureGrid';
import ExportModal from '../components/ExportModal';
import PaywallModal from '../components/PaywallModal';

// Firebase config from global (window) or fallback
/* eslint-disable @typescript-eslint/no-explicit-any */
const appId =
  typeof window !== 'undefined' && (window as any).__app_id
    ? (window as any).__app_id
    : 'default-app-id';
const initialAuthToken =
  typeof window !== 'undefined' && (window as any).__initial_auth_token
    ? (window as any).__initial_auth_token
    : null;

export default function HomePage() {
  // State
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [gridSize, setGridSize] = useState(16);
  const [usageCount, setUsageCount] = useState(0);
  const [gridColors, setGridColors] = useState<string[][]>(
    Array(16)
      .fill(null)
      .map(() => Array(16).fill(DEFAULT_GRID_COLOR))
  );
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [palette] = useState<string[]>(generate256ColorPalette());
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [paywallMessage, setPaywallMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error('Error signing in:', error);
        }
      }
      setCurrentUserId(auth.currentUser?.uid || crypto.randomUUID());
      setIsAuthReady(true);
    });

    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  // Save grid/colors/usage to Firestore
  const saveGridColors = useCallback(
    async (currentGrid: string[][], currentSize: number, currentCount: number) => {
      if (!currentUserId) {
        console.warn('User ID not available, cannot save texture.');
        return;
      }
      const userTextureDocRef = doc(
        db,
        `artifacts/${appId}/users/${currentUserId}/textures`,
        'currentTexture'
      );
      try {
        await setDoc(
          userTextureDocRef,
          {
            grid: JSON.stringify(currentGrid),
            usageCount: currentCount,
            gridSize: currentSize,
          },
          { merge: true }
        );
      } catch (e) {
        console.error('Error saving texture:', e);
      }
    },
    [currentUserId]
  );

  // Firestore Data Listener
  useEffect(() => {
    if (!isAuthReady || !currentUserId) return;

    const userTextureDocRef = doc(
      db,
      `artifacts/${appId}/users/${currentUserId}/textures`,
      'currentTexture'
    );

    const unsubscribe = onSnapshot(
      userTextureDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          let loadedGrid = Array(16)
            .fill(null)
            .map(() => Array(16).fill(DEFAULT_GRID_COLOR));
          let loadedUsageCount = 0;
          let loadedGridSize = 16;

          if (data) {
            if (data.grid) {
              try {
                loadedGrid = JSON.parse(data.grid);
              } catch (e) {
                console.error('Error parsing grid data from Firestore:', e);
              }
            }
            loadedUsageCount = data.usageCount || 0;
            loadedGridSize = data.gridSize || 16;
          }

          // Ensure loaded grid dimensions match the loadedGridSize
          if (
            loadedGrid.length !== loadedGridSize ||
            (loadedGrid.length > 0 && loadedGrid[0].length !== loadedGridSize)
          ) {
            loadedGrid = Array(loadedGridSize)
              .fill(null)
              .map(() => Array(loadedGridSize).fill(DEFAULT_GRID_COLOR));
          }

          setGridColors(loadedGrid);
          setUsageCount(loadedUsageCount);
          setGridSize(loadedGridSize);
        } else {
          const initialGrid = Array(16)
            .fill(null)
            .map(() => Array(16).fill(DEFAULT_GRID_COLOR));
          setGridColors(initialGrid);
          setUsageCount(0);
          setGridSize(16);
        }
      },
      (error) => {
        console.error('Error listening to texture data:', error);
      }
    );

    return () => unsubscribe();
  }, [isAuthReady, currentUserId]);

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
      saveGridColors(gridColors, gridSize, usageCount);
    }
  }, [isDrawing, gridColors, gridSize, usageCount, saveGridColors]);

  // Grid size change
  const handleGridSizeChange = useCallback(
    (newSize: number) => {
      let message = '';
      let paywallTriggered = false;

      if (newSize === 64 || newSize === 128) {
        message = `Grid sizes ${newSize}x${newSize} require an upgrade. Please contact support.`;
        paywallTriggered = true;
      } else if (usageCount >= 15 && (newSize === 16 || newSize === 32)) {
        message = `You have reached the limit of 15 exports for 16x16 and 32x32 grids. Please upgrade to continue.`;
        paywallTriggered = true;
      }

      if (paywallTriggered) {
        setPaywallMessage(message);
        setShowPaywallModal(true);
        return;
      }

      const newClearedGrid = Array(newSize)
        .fill(null)
        .map(() => Array(newSize).fill(DEFAULT_GRID_COLOR));
      setGridSize(newSize);
      setGridColors(newClearedGrid);
      saveGridColors(newClearedGrid, newSize, usageCount);
    },
    [usageCount, saveGridColors]
  );

  // Clear grid
  const handleClearGrid = useCallback(() => {
    let message = '';
    let paywallTriggered = false;

    if (usageCount >= 15 && (gridSize === 16 || gridSize === 32)) {
      message = `You have reached the limit of 15 exports for 16x16 and 32x32 grids. Please upgrade to continue.`;
      paywallTriggered = true;
    }

    if (paywallTriggered) {
      setPaywallMessage(message);
      setShowPaywallModal(true);
      return;
    }

    const clearedGrid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(DEFAULT_GRID_COLOR));
    setGridColors(clearedGrid);
    saveGridColors(clearedGrid, gridSize, usageCount);
  }, [gridSize, usageCount, saveGridColors]);

  // Fill grid
  const handleFillGrid = useCallback(() => {
    let message = '';
    let paywallTriggered = false;

    if (usageCount >= 15 && (gridSize === 16 || gridSize === 32)) {
      message = `You have reached the limit of 15 exports for 16x16 and 32x32 grids. Please upgrade to continue.`;
      paywallTriggered = true;
    }

    if (paywallTriggered) {
      setPaywallMessage(message);
      setShowPaywallModal(true);
      return;
    }

    const filledGrid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(selectedColor));
    setGridColors(filledGrid);
    saveGridColors(filledGrid, gridSize, usageCount);
  }, [gridSize, selectedColor, usageCount, saveGridColors]);

  // Export texture
  const handleExportTexture = useCallback(() => {
    if (usageCount >= 15 && (gridSize === 16 || gridSize === 32)) {
      setPaywallMessage(
        `You have reached the limit of 15 exports for 16x16 and 32x32 grids. Please upgrade to continue.`
      );
      setShowPaywallModal(true);
      return;
    }
    if (gridSize === 64 || gridSize === 128) {
      setPaywallMessage(
        `Grid sizes ${gridSize}x${gridSize} require an upgrade. Please contact support.`
      );
      setShowPaywallModal(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setExportMessage('Error: Could not create canvas for export.');
      setShowExportModal(true);
      return;
    }

    const pixelSize = 16;
    canvas.width = gridSize * pixelSize;
    canvas.height = gridSize * pixelSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setExportMessage('Error: Could not get 2D context for canvas.');
      setShowExportModal(true);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        ctx.fillStyle = gridColors[r][c];
        ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
      }
    }

    try {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `minecraft_texture_${gridSize}x${gridSize}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const newUsageCount = usageCount + 1;
      setUsageCount(newUsageCount);
      saveGridColors(gridColors, gridSize, newUsageCount);

      setExportMessage(
        `Texture exported successfully as minecraft_texture_${gridSize}x${gridSize}.png!`
      );
      setShowExportModal(true);
    } catch (e) {
      setExportMessage(`Error exporting texture: ${(e as Error).message}`);
      setShowExportModal(true);
    }
  }, [gridColors, gridSize, usageCount, saveGridColors]);

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-inter p-4 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6 text-green-400">Minecraft Texture Creator</h1>
      {currentUserId && (
        <p className="text-sm mb-4 text-gray-400">
          User ID:{' '}
          <span className="font-mono bg-gray-800 p-1 rounded">{currentUserId}</span>
        </p>
      )}
      <p className="text-md mb-4 text-gray-300">
        Total Exports: <span className="font-bold text-yellow-300">{usageCount}</span>
      </p>
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
        <ColorPalette
          palette={palette}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          handleFillGrid={handleFillGrid}
        />
        <TextureGrid
          gridColors={gridColors}
          gridSize={gridSize}
          usageCount={usageCount}
          handleGridSizeChange={handleGridSizeChange}
          handleMouseDown={handleMouseDown}
          handleMouseEnter={handleMouseEnter}
          handleMouseUp={handleMouseUp}
          handleClearGrid={handleClearGrid}
          handleExportTexture={handleExportTexture}
        />
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <ExportModal
        show={showExportModal}
        message={exportMessage}
        onClose={() => setShowExportModal(false)}
      />
      <PaywallModal
        show={showPaywallModal}
        message={paywallMessage}
        onClose={() => setShowPaywallModal(false)}
      />
    </div>
  );
}
