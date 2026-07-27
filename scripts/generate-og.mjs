/**
 * Atualiza public/og-wagoo.png: logo oficial no lugar de "wagoo" + "SaaS".
 * Uso: node scripts/generate-og.mjs
 */
import { Jimp } from "jimp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const ogPath = path.join(root, "public", "og-wagoo.png");
const logoPath = path.join(root, "public", "logo.png");
const backupPath = path.join(root, "public", "og-wagoo.source.png");

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(ogPath, backupPath);
}

const og = await Jimp.read(backupPath);
let logo = await Jimp.read(logoPath);

const targetLogoWidth = 240;
logo = logo.resize({ w: targetLogoWidth });

logo.scan((_x, _y, idx) => {
  const r = logo.bitmap.data[idx];
  const g = logo.bitmap.data[idx + 1];
  const b = logo.bitmap.data[idx + 2];
  if (r < 40 && g < 40 && b < 40) {
    logo.bitmap.data[idx + 3] = 0;
  }
});

// Branding antigo no source: ~x64–380, y135–230 (círculo + wagoo + SaaS)
const patchX = 40;
const patchY = 110;
const patchW = 380;
const patchH = 140;

// Fundo paper sólido (evita copiar glow verde da direita)
const paper = 0xf5f9f2ff;
const patch = new Jimp({ width: patchW, height: patchH, color: paper });
og.composite(patch, patchX, patchY);

const logoX = 56;
const logoY = 145;
og.composite(logo, logoX, logoY);

await og.write(ogPath);

// Residual: faixa do "SaaS" (abaixo da logo, fora dos pixels da logo)
const checkY0 = logoY + logo.bitmap.height + 8;
const checkY1 = patchY + patchH;
let residual = 0;
for (let y = checkY0; y < checkY1; y++) {
  for (let x = patchX; x < patchX + patchW; x++) {
    const c = og.getPixelColor(x, y);
    const r = (c >> 24) & 255;
    const g = (c >> 16) & 255;
    const b = (c >> 8) & 255;
    if (g > r + 30 && g > b + 30 && g > 100 && r < 120) residual++;
  }
}

console.log(
  `og-wagoo.png — logo ${targetLogoWidth}px @ (${logoX},${logoY}) | residual SaaS: ${residual}`
);
if (residual > 20) {
  console.warn("AVISO: ainda há texto verde sob a logo (possível SaaS).");
  process.exitCode = 1;
} else {
  console.log("OK: sem texto SaaS.");
}
