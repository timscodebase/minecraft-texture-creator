// src/components/MainApp.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useGrid } from "../hooks/useGrid";
import { useFirestoreSync } from "../hooks/useFirestoreSync";

import AuthSection from "./AuthSection";
import ColorPalette from "./ColorPalette";
import TextureGrid from "./TextureGrid";
import ExportModal from "./ExportModal";
import PaywallModal from "./PaywallModal";
import Toolbar from "./Toolbar";

export default function MainApp() {
  // Auth
  const { user, isAuthReady, signIn, signOut } = useAuth();

  // Grid
  const {
    gridSize,
    setGridSize,
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
    handleMouseEnter,
    handleMouseUp,
    handleMouseLeave,
    clearGrid,
    fillGrid,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useGrid();

  // App-specific state
  const [appId, setAppId] = useState("default-app-id");
  const [usageCount, setUsageCount] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [paywallMessage, setPaywallMessage] = useState("");

  // Set appId from window (client only)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const windowWithAppId = window as { __app_id?: string };
      if (windowWithAppId.__app_id) {
        setAppId(windowWithAppId.__app_id);
      }
    }
  }, []);

  // Firestore sync
  useFirestoreSync({
    user,
    appId,
    setGridColors,
    setUsageCount,
    setGridSize,
    isAuthReady,
  });

  // Export handler: save grid, gridSize, and increment usageCount in Firestore
  const handleExportTexture = React.useCallback(async () => {
    if (usageCount >= 15 && (gridSize === 16 || gridSize === 32)) {
      setPaywallMessage(
        `You have reached the limit of 15 exports for 16x16 and 32x32 grids. Please upgrade to continue.`
      );
      setShowPaywallModal(true);
      return;
    }
    if (gridSize >= 64) {
      setPaywallMessage(
        `Grid sizes ${gridSize}x${gridSize} require an upgrade. Please contact support.`
      );
      setShowPaywallModal(true);
      return;
    }

    const canvas = exportCanvasRef.current;
    if (!canvas) {
      setExportMessage("Error: Could not create canvas for export.");
      setShowExportModal(true);
      return;
    }

    const exportPixelSize = 1; // Draw 1x1 pixels for the export
    canvas.width = gridSize;
    canvas.height = gridSize;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setExportMessage("Error: Could not get 2D context for canvas.");
      setShowExportModal(true);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        ctx.fillStyle = gridColors[r][c];
        ctx.fillRect(c * exportPixelSize, r * exportPixelSize, exportPixelSize, exportPixelSize);
      }
    }

    try {
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `minecraft_texture_${gridSize}x${gridSize}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Save grid, gridSize, and increment usageCount in Firestore
      const { db } = await import("../utils/firebase");
      const { doc, setDoc, increment } = await import("firebase/firestore");
      const userId = user?.uid;
      if (userId) {
        const userTextureDocRef = doc(
          db,
          `artifacts/${appId}/users/${userId}/textures`,
          "currentTexture"
        );
        await setDoc(
          userTextureDocRef,
          {
            grid: JSON.stringify(gridColors),
            gridSize: gridSize,
            usageCount: increment(1),
          },
          { merge: true }
        );
      }

      setExportMessage(
        `Texture exported successfully as minecraft_texture_${gridSize}x${gridSize}.png!`
      );
      setShowExportModal(true);
    } catch (e) {
      setExportMessage(`Error exporting texture: ${(e as Error).message}`);
      setShowExportModal(true);
    }
  }, [gridColors, gridSize, usageCount, appId, user, exportCanvasRef]);

  // Hydration-safe loading
  if (!isAuthReady) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-[#170a01] text-white'>
        <p>Loading application...</p>
      </div>
    );
  }

  // If not signed in, show sign in button
  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-[#170a01] text-white'>
        <h1 className='text-4xl font-bold mb-6 text-lime-500'>
          Minecraft Texture Creator
        </h1>
        <AuthSection user={user} onSignIn={signIn} onSignOut={signOut} />
      </div>
    );
  }

  // Main app UI
  return (
    <div className='min-h-screen bg-[#170a01] text-gray-100 font-inter p-4 flex flex-col items-center justify-center'>
      <h1 className='text-4xl font-bold mb-6 text-lime-500'>
        Minecraft Texture Creator
      </h1>
      <AuthSection user={user} onSignIn={signIn} onSignOut={signOut} />
      <p className='text-md mb-4 text-gray-300'>
        Total Exports:{" "}
        <span className='font-bold text-yellow-300'>{usageCount}</span>
      </p>
      <div className='flex flex-col lg:flex-row gap-8 w-full max-w-6xl'>
        <div className="flex flex-col gap-8 w-full lg:w-1/3">
          <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
          <ColorPalette
            palette={palette}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            secondaryColor={secondaryColor}
            setSecondaryColor={setSecondaryColor}
            handleFillGrid={fillGrid}
          />
        </div>
        <TextureGrid
          gridSize={gridSize}
          usageCount={usageCount}
          handleGridSizeChange={setGridSize}
          handleMouseDown={handleMouseDown}
          handleMouseEnter={handleMouseEnter}
          handleMouseUp={handleMouseUp}
          handleMouseLeave={handleMouseLeave}
          handleClearGrid={clearGrid}
          handleExportTexture={handleExportTexture}
          canvasRef={canvasRef}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
      </div>
      <canvas ref={exportCanvasRef} style={{ display: 'none' }} />
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
