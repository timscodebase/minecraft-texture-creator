// src/hooks/useFirestoreSync.ts
import { useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { DEFAULT_GRID_COLOR } from '../utils/constants';

interface UseFirestoreSyncProps {
  user: { uid: string } | null;
  appId: string;
  setGridColors: (grid: string[][]) => void;
  setUsageCount: (count: number) => void;
  setGridSize: (size: number) => void;
  isAuthReady: boolean;
}

export function useFirestoreSync({
  user,
  appId,
  setGridColors,
  setUsageCount,
  setGridSize,
  isAuthReady,
}: UseFirestoreSyncProps) {
  useEffect(() => {
    if (!isAuthReady || !user) return;

    const userTextureDocRef = doc(
      db,
      `artifacts/${appId}/users/${user.uid}/textures`,
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
  }, [isAuthReady, user, appId, setGridColors, setUsageCount, setGridSize]);
}
