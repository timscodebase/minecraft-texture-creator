// src/utils/palette.ts
export function generate256ColorPalette(): string[] {
  const palette: string[] = [];
  const webSafeValues = [0x00, 0x33, 0x66, 0x99, 0xCC, 0xFF];
  for (const r of webSafeValues) {
    for (const g of webSafeValues) {
      for (const b of webSafeValues) {
        const hexR = r.toString(16).padStart(2, '0');
        const hexG = g.toString(16).padStart(2, '0');
        const hexB = b.toString(16).padStart(2, '0');
        palette.push(`#${hexR}${hexG}${hexB}`);
      }
    }
  }
  const remainingColors = 256 - palette.length;
  for (let i = 0; i < remainingColors; i++) {
    const value = Math.round((i / (remainingColors - 1)) * 255);
    const hex = value.toString(16).padStart(2, '0');
    palette.push(`#${hex}${hex}${hex}`);
  }
  palette.sort();
  return palette;
}
