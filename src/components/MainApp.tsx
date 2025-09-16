// src/components/MainApp.tsx
"use client";

import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useGrid } from "../hooks/useGrid";
import { useFirestoreSync } from "../hooks/useFirestoreSync";
import styles from './MainApp.module.css';

import AuthSection from "./AuthSection";
import ColorPalette from "./ColorPalette";
import TextureGrid from "./TextureGrid";
import ExportModal from "./ExportModal";
import PaywallModal from "./PaywallModal";
import Toolbar from "./Toolbar";
import ThemeSwitcher from './ThemeSwitcher';

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
    handleMouseMove,
    handleMouseEnter,
    handleMouseUp,
    handleMouseLeave,
    clearGrid,
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
  const [theme, setTheme] = useState('dark');

  // Set appId from window (client only)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

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
      <div className={styles.loadingWrapper}>
        <p>Loading application...</p>
      </div>
    );
  }

  // If not signed in, show sign in button
  if (!user) {
    return (
      <div className={styles.signInWrapper}>
        <h1 className={styles.title}>
          Minecraft Texture Creator
        </h1>
        <AuthSection user={user} onSignIn={signIn} onSignOut={signOut} />
      </div>
    );
  }

  // Main app UI
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>
        Minecraft Texture Creator
      </h1>
      <div className={styles.auth}>
        <AuthSection user={user} onSignIn={signIn} onSignOut={signOut} />
      </div>
      <p className={styles.usageText}>
        Total Exports:{" "}
        <span className={styles.usageCount}>{usageCount}</span>
      </p>
      <div className={styles.mainContent}>
        <div className={styles.sidebar}>
          <ThemeSwitcher theme={theme} setTheme={setTheme} />
          <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
          <ColorPalette
            palette={palette}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            secondaryColor={secondaryColor}
            setSecondaryColor={setSecondaryColor}
          />
        </div>
        <TextureGrid
          gridSize={gridSize}
          usageCount={usageCount}
          handleGridSizeChange={setGridSize}
          handleMouseDown={handleMouseDown}
          handleMouseMove={handleMouseMove}
          handleMouseEnter={handleMouseEnter}
          handleMouseUp={handleMouseUp}
          handleMouseLeave={handleMouseLeave}
          handleClearGrid={clearGrid}
          handleExportTexture={handleExportTexture}
          canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
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
