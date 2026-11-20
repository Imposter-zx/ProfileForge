// lib/ascii/image-to-ascii.ts

export interface ImageToAsciiOptions {
  cols: number; // e.g. 30..120
  charset: "dense" | "blocks" | "minimal";
  colorMode: "color" | "mono";
  invert?: boolean;
  darkTheme?: boolean;
  bgHex?: string; // e.g. "#0d1117"
}

export const CHARSETS = {
  dense: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  blocks: " ░▒▓█",
  minimal: " .:-=+*#%@",
};

export interface AsciiCell {
  char: string;
  color: string;
}

export interface AsciiGridResult {
  rows: AsciiCell[][];
  cols: number;
  rowCount: number;
  plainText: string;
}

export async function convertImageFileToAsciiGrid(
  file: File,
  opts: ImageToAsciiOptions
): Promise<AsciiGridResult> {
  const allowed = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];
  if (!allowed.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Please use PNG, JPEG, WebP, or SVG.`);
  }

  const bitmap = await createImageBitmap(file);
  const cols = Math.max(16, Math.min(140, opts.cols || 60));
  // Monospace character cells are roughly twice as tall as they are wide (~0.5 aspect ratio)
  const rowCount = Math.max(8, Math.round((bitmap.height / bitmap.width) * cols * 0.5));

  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rowCount;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 2D context unavailable.");

  ctx.drawImage(bitmap, 0, 0, cols, rowCount);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, cols, rowCount);
  const ramp = CHARSETS[opts.charset] || CHARSETS.dense;
  const rows: AsciiCell[][] = [];
  const textLines: string[] = [];

  for (let y = 0; y < rowCount; y++) {
    const row: AsciiCell[] = [];
    let textLine = "";
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3] / 255;

      if (a < 0.1) {
        row.push({ char: " ", color: "transparent" });
        textLine += " ";
        continue;
      }

      // ITU-R BT.709 luma formula
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const normalized = opts.invert ? 1 - lum : lum;
      const idx = Math.min(
        ramp.length - 1,
        Math.max(0, Math.floor(normalized * (ramp.length - 1)))
      );
      const char = ramp[idx];
      textLine += char;

      const color =
        opts.colorMode === "mono"
          ? opts.darkTheme
            ? "#e6edf3"
            : "#1f2328"
          : `rgb(${r},${g},${b})`;

      row.push({ char, color });
    }
    rows.push(row);
    textLines.push(textLine);
  }

  return { rows, cols, rowCount, plainText: textLines.join("\n") };
}

export function exportAsciiGridToReadmeSvg(
  grid: { rows: AsciiCell[][]; cols: number; rowCount: number },
  opts: { fontSize?: number; bgHex?: string; darkTheme?: boolean }
): string {
  const fontSize = opts.fontSize ?? 10;
  const charW = fontSize * 0.62;
  const lineH = fontSize * 1.25;
  const pad = 16;
  const width = Math.ceil(grid.cols * charW + pad * 2);
  const height = Math.ceil(grid.rowCount * lineH + pad * 2);

  const lines = grid.rows
    .map((row, rowIdx) => {
      const y = pad + (rowIdx + 1) * lineH - 2;
      const tspans = row
        .map((cell) => {
          if (cell.char === " ") return "&#160;";
          const safeChar = cell.char
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          return `<tspan fill="${cell.color}">${safeChar}</tspan>`;
        })
        .join("");
      return `<text x="${pad}" y="${y.toFixed(1)}" xml:space="preserve">${tspans}</text>`;
    })
    .join("\n  ");

  const bgRect = opts.bgHex
    ? `<rect width="100%" height="100%" rx="8" fill="${opts.bgHex}" />`
    : "";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Custom ASCII Art">`,
    `  <style>`,
    `    text { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: ${fontSize}px; }`,
    `  </style>`,
    `  ${bgRect}`,
    `  ${lines}`,
    `</svg>`,
  ].join("\n");
}
