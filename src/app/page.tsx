// src/app/page.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useGrid } from "../hooks/useGrid";
import { useFirestoreSync } from "../hooks/useFirestoreSync";

import AuthSection from "../components/AuthSection";
import ColorPalette from "../components/ColorPalette";
import TextureGrid from "../components/TextureGrid";
import ExportModal from "../components/ExportModal";
import PaywallModal from "../components/PaywallModal";

export default function HomePage() {
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
    palette,
    canvasRef,
    handleMouseDown,
    handleMouseEnter,
    handleMouseUp,
    clearGrid,
    fillGrid,
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
    if (gridSize === 64 || gridSize === 128) {
      setPaywallMessage(
        `Grid sizes ${gridSize}x${gridSize} require an upgrade. Please contact support.`
      );
      setShowPaywallModal(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setExportMessage("Error: Could not create canvas for export.");
      setShowExportModal(true);
      return;
    }

    const pixelSize = 16;
    canvas.width = gridSize * pixelSize;
    canvas.height = gridSize * pixelSize;
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
        ctx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
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
  }, [gridColors, gridSize, usageCount, appId, user, canvasRef]);

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
        <ColorPalette
          palette={palette}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          handleFillGrid={fillGrid}
        />
        <TextureGrid
          gridColors={gridColors}
          gridSize={gridSize}
          usageCount={usageCount}
          handleGridSizeChange={setGridSize}
          handleMouseDown={handleMouseDown}
          handleMouseEnter={handleMouseEnter}
          handleMouseUp={handleMouseUp}
          handleClearGrid={clearGrid}
          handleExportTexture={handleExportTexture}
        />
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
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
